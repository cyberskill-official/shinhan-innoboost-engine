# Encryption Configuration — Shinhan Innoboost Engine

> All encryption settings for data at rest, in transit, and key management.

**Owner**: eng-sec
**Last updated**: 2026-05-02
**Status**: DRAFT — KMS key creation pending

---

## Encryption Standards

| Layer | Protocol/Algorithm | Minimum | Notes |
|---|---|---|---|
| **In transit** | TLS 1.3 | TLS 1.2 fallback for legacy clients only | HSTS enforced |
| **At rest (DB)** | AES-256-GCM | — | Cloud SQL default; CMEK optional |
| **At rest (files)** | AES-256 | — | GCS server-side encryption |
| **Application-layer** | AES-256-GCM | — | PII fields encrypted before DB write |
| **API keys** | HMAC-SHA256 | — | API key hashing in DB |
| **Passwords** | Argon2id | — | Via Keycloak; never direct storage |
| **JWTs** | RS256 (Keycloak) | — | Asymmetric signing |

---

## TLS Configuration

### Ingress (Nginx Ingress Controller)

```yaml
# infra/helm/values-tls.yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.3"
    nginx.ingress.kubernetes.io/ssl-ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256"
    nginx.ingress.kubernetes.io/hsts: "true"
    nginx.ingress.kubernetes.io/hsts-max-age: "31536000"
    nginx.ingress.kubernetes.io/hsts-include-subdomains: "true"
    nginx.ingress.kubernetes.io/hsts-preload: "true"
```

### Service-to-Service (mTLS via Istio/Linkerd)

All pod-to-pod traffic is encrypted via service mesh mTLS. See P01-T10 zero-trust network config.

---

## Key Management (KMS)

### GCP Cloud KMS

```hcl
# infra/terraform/kms.tf
resource "google_kms_key_ring" "shinhan" {
  name     = "shinhan-innoboost-${var.environment}"
  location = var.region
  project  = var.project_id
}

resource "google_kms_crypto_key" "app_encryption" {
  name            = "app-encryption"
  key_ring        = google_kms_key_ring.shinhan.id
  rotation_period = "7776000s"  # 90 days
  purpose         = "ENCRYPT_DECRYPT"

  version_template {
    algorithm        = "GOOGLE_SYMMETRIC_ENCRYPTION"
    protection_level = "SOFTWARE"  # HSM for production
  }
}

resource "google_kms_crypto_key" "db_cmek" {
  name            = "db-cmek"
  key_ring        = google_kms_key_ring.shinhan.id
  rotation_period = "7776000s"  # 90 days
  purpose         = "ENCRYPT_DECRYPT"
}
```

### BYOK (Bring Your Own Key)

For Shinhan-managed key scenarios (post-kickoff):

1. Shinhan generates a key in their HSM
2. Key is wrapped with our GCP KMS wrapping key
3. Wrapped key is imported into our KMS key ring
4. Application uses the imported key via the same KMS API
5. Shinhan retains the ability to revoke the key

---

## Key Rotation Policy

| Key | Rotation period | Automated | Owner |
|---|---|---|---|
| Application encryption key | 90 days | Yes (KMS auto-rotate) | eng-sec |
| Database CMEK | 90 days | Yes (KMS auto-rotate) | platform eng |
| TLS certificates | 90 days | Yes (cert-manager) | platform eng |
| Keycloak signing keys | 180 days | Manual | eng-sec |
| API key salts | Annual | Manual | eng-sec |

---

## Application-Layer Encryption

PII fields are encrypted at the application layer before being written to the database:

```typescript
// engine/crypto/field-encryption.ts (scaffold)
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encryptField(plaintext: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptField(ciphertext: string, key: Buffer): string {
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### Fields requiring encryption

| Model | Field | Reason |
|---|---|---|
| User | email | PII |
| Query | raw_query | May contain PII |
| AuditLog | user_context | Contains PII references |
