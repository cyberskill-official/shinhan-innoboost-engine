// engine/auth/rbac.ts
// RBAC Engine — Implements P01-T07
// Roles, scopes, tenant boundary enforcement, and permission assertions.

// ─── Role Definitions ────────────────────────────────────

export const ROLES = {
  /** Full system access — founder + eng tech lead only */
  SUPER_ADMIN: 'super_admin',

  /** BU-level admin — manages users, reviews, settings within a BU */
  BU_ADMIN: 'bu_admin',

  /** Reviews AI responses before release to end-users (SB5 HITL) */
  REVIEWER: 'reviewer',

  /** Can query the engine and view responses */
  ANALYST: 'analyst',

  /** Read-only access to dashboards and reports */
  VIEWER: 'viewer',

  /** Manages eval harness, gold-set, adversarial tests */
  EVAL_MANAGER: 'eval_manager',

  /** System service accounts (engine → engine calls) */
  SERVICE: 'service',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Business Unit Scopes ────────────────────────────────

export const BU_SCOPES = {
  /** Shinhan Vietnam Finance Company (SF9) */
  SVFC: 'bu:svfc',

  /** Shinhan Bank HO Departments (SB5) */
  BANK: 'bu:bank',

  /** Shinhan Securities (SS1) */
  SECURITIES: 'bu:securities',

  /** Cross-BU access (admin only) */
  ALL: 'bu:all',
} as const;

export type BuScope = (typeof BU_SCOPES)[keyof typeof BU_SCOPES];

// ─── Permission Matrix ───────────────────────────────────

export const PERMISSIONS = {
  // Query operations
  'query:submit': [ROLES.ANALYST, ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'query:view_history': [ROLES.ANALYST, ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],

  // Review operations (HITL)
  'review:view_queue': [ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'review:approve': [ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'review:reject': [ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'review:escalate': [ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],

  // Admin operations
  'admin:manage_users': [ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'admin:manage_roles': [ROLES.SUPER_ADMIN],
  'admin:view_audit': [ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'admin:manage_metrics': [ROLES.SUPER_ADMIN, ROLES.EVAL_MANAGER],
  'admin:manage_settings': [ROLES.SUPER_ADMIN],

  // Eval operations
  'eval:run': [ROLES.EVAL_MANAGER, ROLES.SUPER_ADMIN],
  'eval:view_results': [ROLES.EVAL_MANAGER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'eval:manage_goldset': [ROLES.EVAL_MANAGER, ROLES.SUPER_ADMIN],

  // Dashboard operations
  'dashboard:view': [ROLES.VIEWER, ROLES.ANALYST, ROLES.REVIEWER, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],
  'dashboard:export': [ROLES.ANALYST, ROLES.BU_ADMIN, ROLES.SUPER_ADMIN],

  // System operations
  'system:health': [ROLES.SERVICE, ROLES.SUPER_ADMIN],
  'system:config': [ROLES.SUPER_ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ─── Tenant Boundary ─────────────────────────────────────

export interface UserContext {
  readonly userId: string;
  readonly email: string;
  readonly role: Role;
  readonly buScope: BuScope;
  readonly tenantId: string;
}

/**
 * Assert that the current user has a specific permission.
 * Throws if the user does not have the permission.
 *
 * Every API endpoint MUST call this function before processing.
 * Enforced by ESLint custom rule (TODO: P01-T01 eslint config).
 *
 * @example
 * ```ts
 * assertCan(ctx.user, 'query:submit');
 * ```
 */
export function assertCan(user: UserContext, permission: Permission): void {
  const allowedRoles = PERMISSIONS[permission];

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `User ${user.userId} with role ${user.role} does not have permission: ${permission}`,
    );
  }
}

/**
 * Assert that the user's BU scope covers the requested tenant.
 * Prevents cross-BU data leakage.
 *
 * @example
 * ```ts
 * assertBuAccess(ctx.user, 'bu:svfc');
 * ```
 */
export function assertBuAccess(user: UserContext, requiredScope: BuScope): void {
  if (user.buScope === BU_SCOPES.ALL) return;
  if (user.buScope !== requiredScope) {
    throw new ForbiddenError(
      `User ${user.userId} (scope: ${user.buScope}) cannot access scope: ${requiredScope}`,
    );
  }
}

/**
 * Check permission without throwing (for conditional UI rendering).
 */
export function canDo(user: UserContext, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(user.role);
}

// ─── Error Types ─────────────────────────────────────────

export class ForbiddenError extends Error {
  public readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  public readonly statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
