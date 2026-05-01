// engine/auth/keycloak.config.ts
// Keycloak OIDC configuration for Shinhan Innoboost Engine
// Implements P01-T06: Auth service (Keycloak OIDC + MFA + SAML adapter)

export interface KeycloakConfig {
  readonly realm: string;
  readonly authServerUrl: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly sslRequired: 'none' | 'external' | 'all';
  readonly publicClient: boolean;
  readonly confidentialPort: number;
}

export interface KeycloakRealmConfig {
  readonly realm: string;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly sslRequired: string;
  readonly registrationAllowed: boolean;
  readonly loginWithEmailAllowed: boolean;
  readonly duplicateEmailsAllowed: boolean;
  readonly resetPasswordAllowed: boolean;
  readonly editUsernameAllowed: boolean;
  readonly bruteForceProtected: boolean;
  readonly permanentLockout: boolean;
  readonly maxFailureWaitSeconds: number;
  readonly minimumQuickLoginWaitSeconds: number;
  readonly waitIncrementSeconds: number;
  readonly quickLoginCheckMilliSeconds: number;
  readonly maxDeltaTimeSeconds: number;
  readonly failureFactor: number;
  readonly otpPolicyType: string;
  readonly otpPolicyAlgorithm: string;
  readonly otpPolicyDigits: number;
  readonly otpPolicyPeriod: number;
}

/**
 * Default Keycloak realm configuration for Shinhan Innoboost.
 * Enforces MFA, brute-force protection, and banking-grade session policy.
 */
export const SHINHAN_REALM_CONFIG: KeycloakRealmConfig = {
  realm: 'shinhan-innoboost',
  displayName: 'Shinhan Innoboost 2026',
  enabled: true,
  sslRequired: 'all',
  registrationAllowed: false,
  loginWithEmailAllowed: true,
  duplicateEmailsAllowed: false,
  resetPasswordAllowed: true,
  editUsernameAllowed: false,
  bruteForceProtected: true,
  permanentLockout: false,
  maxFailureWaitSeconds: 900,          // 15 minutes
  minimumQuickLoginWaitSeconds: 60,
  waitIncrementSeconds: 60,
  quickLoginCheckMilliSeconds: 1000,
  maxDeltaTimeSeconds: 43200,         // 12 hours
  failureFactor: 5,                    // Lock after 5 failures
  otpPolicyType: 'totp',
  otpPolicyAlgorithm: 'HmacSHA256',
  otpPolicyDigits: 6,
  otpPolicyPeriod: 30,
} as const;

/**
 * Per-environment Keycloak client configurations.
 */
export const KEYCLOAK_CLIENTS = {
  engine: {
    clientId: 'shinhan-engine',
    publicClient: false,
    confidentialPort: 0,
    directAccessGrantsEnabled: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: true,
    authorizationServicesEnabled: true,
    protocol: 'openid-connect',
    redirectUris: [
      'https://innoboost-staging.cyberskill.io/*',
      'http://localhost:4000/*',
    ],
    webOrigins: ['+'],
    defaultClientScopes: ['openid', 'profile', 'email', 'roles'],
  },
  ui: {
    clientId: 'shinhan-ui',
    publicClient: true,
    confidentialPort: 0,
    directAccessGrantsEnabled: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: false,
    authorizationServicesEnabled: false,
    protocol: 'openid-connect',
    redirectUris: [
      'https://innoboost-staging.cyberskill.io/*',
      'http://localhost:3000/*',
    ],
    webOrigins: ['+'],
    defaultClientScopes: ['openid', 'profile', 'email'],
  },
  hitl: {
    clientId: 'shinhan-hitl',
    publicClient: false,
    confidentialPort: 0,
    directAccessGrantsEnabled: false,
    standardFlowEnabled: true,
    serviceAccountsEnabled: true,
    authorizationServicesEnabled: true,
    protocol: 'openid-connect',
    redirectUris: [
      'https://innoboost-staging.cyberskill.io/hitl/*',
      'http://localhost:4001/*',
    ],
    webOrigins: ['+'],
    defaultClientScopes: ['openid', 'profile', 'email', 'roles'],
  },
  /**
   * SAML adapter for Shinhan SSO federation (post-kickoff).
   * Placeholder — requires Shinhan IdP metadata.
   */
  shinhanSaml: {
    clientId: 'shinhan-saml-broker',
    protocol: 'saml',
    enabled: false,  // Enable after receiving Shinhan IdP metadata
    frontchannelLogout: true,
    attributes: {
      'saml.server.signature': 'true',
      'saml.assertion.signature': 'true',
      'saml.signature.algorithm': 'RSA_SHA256',
      'saml_name_id_format': 'email',
    },
  },
} as const;

/**
 * Session policy — banking-grade defaults.
 */
export const SESSION_POLICY = {
  ssoSessionIdleTimeout: 1800,        // 30 minutes idle
  ssoSessionMaxLifespan: 28800,       // 8 hours max
  accessTokenLifespan: 300,           // 5 minutes
  accessTokenLifespanForImplicitFlow: 300,
  actionTokenGeneratedByUserLifespan: 300,
  offlineSessionIdleTimeout: 2592000, // 30 days
  offlineSessionMaxLifespan: 5184000, // 60 days
} as const;
