# Shinhan Innoboost Engine — Terraform Infrastructure

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.16"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
  }

  backend "gcs" {
    bucket = "cyberskill-terraform-state"
    prefix = "shinhan-innoboost"
  }
}

# ─── Variables ─────────────────────────────────────────────

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region (Vietnam-optimised)"
  type        = string
  default     = "asia-southeast1"  # Singapore — closest to Vietnam with full GKE support
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  validation {
    condition     = contains(["staging", "production-rehearsal", "production"], var.environment)
    error_message = "Environment must be staging, production-rehearsal, or production."
  }
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "shinhan-innoboost"
}

# ─── GKE Cluster ──────────────────────────────────────────

resource "google_container_cluster" "primary" {
  name     = "${var.cluster_name}-${var.environment}"
  location = var.region
  project  = var.project_id

  # Autopilot for cost efficiency during demo phase
  enable_autopilot = true

  # Network policy enforcement
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Workload Identity for pod-level IAM
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Binary Authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_RESOURCE"
  }

  # Release channel
  release_channel {
    channel = "REGULAR"
  }

  # Logging and monitoring
  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }

  # Maintenance window (Sunday 2-6am ICT = Saturday 19-23 UTC)
  maintenance_policy {
    daily_maintenance_window {
      start_time = "19:00"
    }
  }
}

# ─── Cloud SQL (Postgres 16) ─────────────────────────────

resource "google_sql_database_instance" "postgres" {
  name             = "shinhan-innoboost-${var.environment}"
  database_version = "POSTGRES_16"
  region           = var.region
  project          = var.project_id

  settings {
    tier = var.environment == "staging" ? "db-f1-micro" : "db-custom-4-16384"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }

    insights_config {
      query_insights_enabled  = true
      record_client_address   = true
    }
  }

  deletion_protection = var.environment == "production"
}

resource "google_sql_database" "app" {
  name     = "shinhan_innoboost"
  instance = google_sql_database_instance.postgres.name
  project  = var.project_id
}

# ─── VPC ──────────────────────────────────────────────────

resource "google_compute_network" "vpc" {
  name                    = "shinhan-innoboost-${var.environment}"
  auto_create_subnetworks = false
  project                 = var.project_id
}

resource "google_compute_subnetwork" "primary" {
  name          = "shinhan-innoboost-${var.environment}-primary"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.4.0.0/14"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.8.0.0/20"
  }

  private_ip_google_access = true
}

# ─── Redis (Memorystore) ─────────────────────────────────

resource "google_redis_instance" "cache" {
  name           = "shinhan-innoboost-cache-${var.environment}"
  tier           = var.environment == "staging" ? "BASIC" : "STANDARD_HA"
  memory_size_gb = var.environment == "staging" ? 1 : 4
  region         = var.region
  project        = var.project_id

  authorized_network = google_compute_network.vpc.id

  redis_version = "REDIS_7_2"

  transit_encryption_mode = "SERVER_AUTHENTICATION"
}

# ─── Workload Identity Federation (for GitHub Actions) ───

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-actions"
  display_name              = "GitHub Actions"
  project                   = var.project_id
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"
  project                            = var.project_id

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_condition = "assertion.repository == 'cyberskill-official/shinhan-innoboost-engine'"
}

# ─── Outputs ─────────────────────────────────────────────

output "cluster_endpoint" {
  value     = google_container_cluster.primary.endpoint
  sensitive = true
}

output "database_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "redis_host" {
  value = google_redis_instance.cache.host
}

output "wif_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}
