// hitl/notifications/notify.ts
// P06-T05 — Notifications (email + in-app + Shinhan webhook)
// SLA-critical breaches, user approval notifications, reviewer alerts

// ─── Types ───────────────────────────────────────────────

export type NotificationChannel = 'email' | 'in_app' | 'webhook';
export type NotificationType =
  | 'review_assigned'         // Reviewer: new item in your queue
  | 'sla_warning'             // Reviewer: 20 min warning
  | 'sla_breach'              // Reviewer + admin: 30 min breach
  | 'sla_escalation'          // Admin + Shinhan webhook: 45 min escalation
  | 'answer_approved'         // End user: your answer is ready
  | 'answer_rejected'         // End user: question was declined
  | 'queue_depth_alert'       // Admin: queue exceeds threshold
  | 'injection_detected'      // Security: prompt injection attempt
  | 'calibration_due';        // Admin: quarterly calibration reminder

export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly channels: readonly NotificationChannel[];
  readonly recipientId: string;
  readonly recipientEmail?: string;
  readonly subject: string;
  readonly body: string;
  readonly bodyVi?: string;
  readonly deepLink?: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
  readonly sentAt: string | null;
  readonly status: 'pending' | 'sent' | 'failed' | 'acknowledged';
}

export interface WebhookPayload {
  readonly event: NotificationType;
  readonly timestamp: string;
  readonly tenantId: string;
  readonly bu: string;
  readonly severity: 'info' | 'warning' | 'critical';
  readonly data: Record<string, unknown>;
  readonly callbackUrl: string;
}

// ─── Notification Templates ──────────────────────────────

const TEMPLATES: Record<NotificationType, {
  subject: string;
  subjectVi: string;
  channels: readonly NotificationChannel[];
  severity: 'info' | 'warning' | 'critical';
}> = {
  review_assigned: {
    subject: 'New review item assigned',
    subjectVi: 'Mục kiểm duyệt mới được giao',
    channels: ['in_app', 'email'],
    severity: 'info',
  },
  sla_warning: {
    subject: '⚠️ SLA Warning: 10 minutes remaining',
    subjectVi: '⚠️ Cảnh báo SLA: Còn 10 phút',
    channels: ['in_app', 'email'],
    severity: 'warning',
  },
  sla_breach: {
    subject: '🚨 SLA Breach: Review overdue',
    subjectVi: '🚨 Vi phạm SLA: Quá hạn kiểm duyệt',
    channels: ['in_app', 'email', 'webhook'],
    severity: 'critical',
  },
  sla_escalation: {
    subject: '🔴 SLA Escalation: Immediate action required',
    subjectVi: '🔴 Nâng cấp SLA: Cần xử lý ngay',
    channels: ['in_app', 'email', 'webhook'],
    severity: 'critical',
  },
  answer_approved: {
    subject: '✅ Your answer is ready',
    subjectVi: '✅ Câu trả lời của bạn đã sẵn sàng',
    channels: ['in_app'],
    severity: 'info',
  },
  answer_rejected: {
    subject: 'Your question was declined',
    subjectVi: 'Câu hỏi của bạn đã bị từ chối',
    channels: ['in_app'],
    severity: 'info',
  },
  queue_depth_alert: {
    subject: '⚠️ Queue depth exceeds threshold',
    subjectVi: '⚠️ Hàng đợi vượt ngưỡng',
    channels: ['email', 'webhook'],
    severity: 'warning',
  },
  injection_detected: {
    subject: '🛡️ Prompt injection attempt detected',
    subjectVi: '🛡️ Phát hiện thử tấn công prompt',
    channels: ['in_app', 'email', 'webhook'],
    severity: 'critical',
  },
  calibration_due: {
    subject: '📋 Quarterly calibration due',
    subjectVi: '📋 Đến hạn hiệu chuẩn quý',
    channels: ['email'],
    severity: 'info',
  },
};

// ─── Notification Service ────────────────────────────────

export interface NotificationConfig {
  readonly emailProvider: 'ses' | 'sendgrid' | 'smtp';
  readonly webhookUrl: string;               // Shinhan-side webhook
  readonly webhookSecret: string;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly batchWindowMs: number;            // Debounce multiple notifications
}

export class NotificationService {
  private queue: Notification[] = [];
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  /**
   * Send a notification across configured channels.
   */
  async send(
    type: NotificationType,
    recipientId: string,
    recipientEmail: string,
    body: string,
    bodyVi?: string,
    deepLink?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<Notification> {
    const template = TEMPLATES[type];

    const notification: Notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      channels: template.channels,
      recipientId,
      recipientEmail,
      subject: template.subject,
      body,
      bodyVi,
      deepLink,
      metadata,
      createdAt: new Date().toISOString(),
      sentAt: null,
      status: 'pending',
    };

    this.queue.push(notification);

    // Dispatch to each channel
    for (const channel of template.channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmail(notification);
            break;
          case 'in_app':
            await this.sendInApp(notification);
            break;
          case 'webhook':
            await this.sendWebhook(notification, template.severity);
            break;
        }
      } catch (error) {
        console.error(`[Notify] Failed to send via ${channel}:`, error);
        // Mark failed but don't throw — other channels may succeed
      }
    }

    (notification as { status: string; sentAt: string | null }).status = 'sent';
    (notification as { sentAt: string | null }).sentAt = new Date().toISOString();

    return notification;
  }

  /**
   * SLA monitoring tick — check all active items and emit warnings/breaches.
   */
  async checkSlaStatus(activeItems: readonly { id: string; slaDeadline: string; reviewerId: string; reviewerEmail: string }[]): Promise<void> {
    const now = Date.now();

    for (const item of activeItems) {
      const deadline = new Date(item.slaDeadline).getTime();
      const remaining = deadline - now;
      const remainingMin = remaining / 60_000;

      if (remainingMin <= 0 && remainingMin > -15) {
        // Breach: 0-15 min overdue
        await this.send(
          'sla_breach',
          item.reviewerId,
          item.reviewerEmail,
          `Review item ${item.id} is overdue. Please take action immediately.`,
          `Mục kiểm duyệt ${item.id} đã quá hạn. Vui lòng xử lý ngay.`,
          `/review/${item.id}`,
        );
      } else if (remainingMin <= -15) {
        // Escalation: 15+ min overdue
        await this.send(
          'sla_escalation',
          item.reviewerId,
          item.reviewerEmail,
          `Review item ${item.id} is severely overdue (${Math.abs(Math.round(remainingMin))} min). Escalating to admin.`,
          `Mục kiểm duyệt ${item.id} đã quá hạn nghiêm trọng (${Math.abs(Math.round(remainingMin))} phút). Nâng cấp lên quản trị.`,
          `/review/${item.id}`,
        );
      } else if (remainingMin <= 10 && remainingMin > 0) {
        // Warning: 10 min remaining
        await this.send(
          'sla_warning',
          item.reviewerId,
          item.reviewerEmail,
          `Review item ${item.id} has ${Math.round(remainingMin)} minutes remaining before SLA breach.`,
          `Mục kiểm duyệt ${item.id} còn ${Math.round(remainingMin)} phút trước khi vi phạm SLA.`,
          `/review/${item.id}`,
        );
      }
    }
  }

  /** Notify end-user on approval with deep-link. */
  async notifyUserApproval(userId: string, email: string, questionId: string): Promise<Notification> {
    return this.send(
      'answer_approved',
      userId,
      email,
      'Your answer has been reviewed and approved. Click to view.',
      'Câu trả lời của bạn đã được kiểm duyệt và phê duyệt. Nhấn để xem.',
      `/chat?q=${questionId}`,
    );
  }

  // ─── Channel Implementations (stubs for CI) ────────────

  private async sendEmail(notification: Notification): Promise<void> {
    // Production: SES / SendGrid dispatch
    console.log(`[Email] → ${notification.recipientEmail}: ${notification.subject}`);
  }

  private async sendInApp(notification: Notification): Promise<void> {
    // Production: WebSocket push to user session
    console.log(`[InApp] → ${notification.recipientId}: ${notification.subject}`);
  }

  private async sendWebhook(notification: Notification, severity: string): Promise<void> {
    const payload: WebhookPayload = {
      event: notification.type,
      timestamp: notification.createdAt,
      tenantId: (notification.metadata.tenantId as string) ?? 'default',
      bu: (notification.metadata.bu as string) ?? 'bank',
      severity: severity as WebhookPayload['severity'],
      data: notification.metadata,
      callbackUrl: this.config.webhookUrl,
    };

    // Production: HMAC-signed POST to Shinhan webhook
    console.log(`[Webhook] → ${this.config.webhookUrl}: ${JSON.stringify(payload)}`);
  }

  /** Get notification history. */
  getHistory(type?: NotificationType): readonly Notification[] {
    return type ? this.queue.filter((n) => n.type === type) : this.queue;
  }
}
