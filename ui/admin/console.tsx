// ui/admin/console.tsx
// P05-T05 — Admin Console
// RBAC editor, metric registry browser, audit-log explorer,
// eval-harness viewer, prompt-injection alert console

// ─── Types ───────────────────────────────────────────────

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly role: 'admin' | 'compliance_officer' | 'reviewer' | 'viewer';
  readonly tenantId: string;
  readonly permissions: readonly string[];
}

export type AdminSection =
  | 'tenant-management'
  | 'rbac-editor'
  | 'metric-registry'
  | 'audit-explorer'
  | 'eval-viewer'
  | 'alert-console';

// ─── Navigation ──────────────────────────────────────────

export interface AdminNavItem {
  readonly id: AdminSection;
  readonly label: string;
  readonly labelVi: string;
  readonly icon: string;
  readonly requiredRole: readonly string[];
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { id: 'tenant-management', label: 'Tenants & BUs', labelVi: 'Tổ chức & Đơn vị', icon: '🏢', requiredRole: ['admin'] },
  { id: 'rbac-editor', label: 'RBAC Matrix', labelVi: 'Ma trận Phân quyền', icon: '🔐', requiredRole: ['admin', 'compliance_officer'] },
  { id: 'metric-registry', label: 'Metric Registry', labelVi: 'Sổ Chỉ số', icon: '📊', requiredRole: ['admin', 'compliance_officer', 'viewer'] },
  { id: 'audit-explorer', label: 'Audit Log', labelVi: 'Nhật ký Kiểm toán', icon: '📋', requiredRole: ['admin', 'compliance_officer'] },
  { id: 'eval-viewer', label: 'Eval Harness', labelVi: 'Bộ Đánh giá', icon: '🧪', requiredRole: ['admin', 'viewer'] },
  { id: 'alert-console', label: 'Security Alerts', labelVi: 'Cảnh báo Bảo mật', icon: '🛡️', requiredRole: ['admin', 'compliance_officer'] },
] as const;

// ─── Tenant Management ───────────────────────────────────

export interface TenantConfig {
  readonly tenantId: string;
  readonly name: string;
  readonly bus: readonly {
    readonly id: string;
    readonly name: string;
    readonly theme: string;
    readonly enabled: boolean;
  }[];
  readonly createdAt: string;
  readonly activeUsers: number;
}

// ─── RBAC Matrix Editor ──────────────────────────────────

export interface RbacRole {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly RbacPermission[];
  readonly sensitivityCeiling: 'public' | 'internal' | 'restricted' | 'regulated';
  readonly buScope: readonly string[];
}

export interface RbacPermission {
  readonly resource: string;
  readonly actions: readonly ('read' | 'write' | 'delete' | 'admin')[];
}

export const SEED_ROLES: readonly RbacRole[] = [
  {
    id: 'analyst', name: 'Analyst', description: 'Read-only access to public and internal data',
    permissions: [{ resource: '*', actions: ['read'] }],
    sensitivityCeiling: 'internal', buScope: ['*'],
  },
  {
    id: 'manager', name: 'Manager', description: 'Read access including restricted data',
    permissions: [{ resource: '*', actions: ['read'] }],
    sensitivityCeiling: 'restricted', buScope: ['*'],
  },
  {
    id: 'executive', name: 'Executive', description: 'Full read access across all sensitivity tiers',
    permissions: [{ resource: '*', actions: ['read'] }],
    sensitivityCeiling: 'regulated', buScope: ['*'],
  },
  {
    id: 'compliance', name: 'Compliance Officer', description: 'Audit access, consent management',
    permissions: [{ resource: 'audit', actions: ['read', 'admin'] }, { resource: 'consent', actions: ['read', 'write', 'admin'] }],
    sensitivityCeiling: 'regulated', buScope: ['*'],
  },
  {
    id: 'admin', name: 'Administrator', description: 'Full system access',
    permissions: [{ resource: '*', actions: ['read', 'write', 'delete', 'admin'] }],
    sensitivityCeiling: 'regulated', buScope: ['*'],
  },
];

// ─── Metric Registry Browser ─────────────────────────────

export interface MetricRegistryView {
  readonly searchQuery: string;
  readonly filters: {
    readonly bu: string | null;
    readonly version: string | null;
    readonly status: 'active' | 'deprecated' | 'all';
  };
  readonly sortBy: 'name' | 'version' | 'updated_at';
  readonly sortOrder: 'asc' | 'desc';
}

// ─── Audit Log Explorer ──────────────────────────────────

export interface AuditExplorerFilters {
  readonly dateRange: { from: string; to: string };
  readonly eventType: string | null;
  readonly userId: string | null;
  readonly tenantId: string | null;
  readonly fullTextQuery: string;
  readonly severityMin: 'info' | 'warning' | 'critical';
}

export interface AuditEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly eventType: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly action: string;
  readonly resource: string;
  readonly details: Record<string, unknown>;
  readonly rowHash: string;
  readonly prevHash: string;
  readonly integrityVerified: boolean;
}

// ─── Eval Harness Viewer ─────────────────────────────────

export interface EvalRunSummary {
  readonly runId: string;
  readonly timestamp: string;
  readonly bu: string;
  readonly suite: string;
  readonly accuracy: number;
  readonly coverage: number;
  readonly hallucinations: number;
  readonly regressions: number;
  readonly status: 'pass' | 'fail' | 'warning';
}

// ─── Prompt Injection Alert Console ──────────────────────

export interface SecurityAlert {
  readonly id: string;
  readonly timestamp: string;
  readonly category: 'injection' | 'extraction' | 'system-prompt-leak' | 'anomaly';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly userId: string;
  readonly input: string;  // redacted
  readonly outcome: 'blocked' | 'sanitised' | 'escalated';
  readonly guardLayer: 'input' | 'system' | 'output';
  readonly tenantId: string;
  readonly acknowledged: boolean;
}

// ─── Admin Console Component ─────────────────────────────

export function AdminConsole() {
  return {
    type: 'div',
    className: 'admin-console',
    children: [
      { type: 'nav', className: 'admin-sidebar',
        children: ADMIN_NAV.map((item) => ({
          type: 'button',
          className: 'admin-nav-item',
          'data-section': item.id,
          'aria-label': item.label,
          children: [
            { type: 'span', className: 'nav-icon', children: item.icon },
            { type: 'span', className: 'nav-label', children: item.label },
          ],
        })),
      },
      { type: 'main', className: 'admin-content',
        children: [
          { type: 'header', className: 'admin-header',
            children: [
              { type: 'h1', children: 'Admin Console' },
              { type: 'div', className: 'admin-user-info' },
            ],
          },
          { type: 'section', className: 'admin-panel', id: 'admin-panel-content' },
        ],
      },
    ],
  };
}
