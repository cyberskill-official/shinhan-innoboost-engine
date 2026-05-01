// ui/components/chat-surface.tsx
// P05-T01 — Shared Conversational UI Surface
// Chat + citations + confidence tiers + HITL banner + streaming + follow-ups

import type { ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────

export type ConfidenceTier = 'high' | 'medium' | 'low';
export type AnswerShape = 'table' | 'chart' | 'number' | 'refusal';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Citation {
  readonly id: string;
  readonly column: string;
  readonly value: unknown;
  readonly sql: string;
  readonly lineage: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly timestamp: string;
  readonly answerShape?: AnswerShape;
  readonly confidenceTier?: ConfidenceTier;
  readonly confidenceScore?: number;
  readonly citations?: readonly Citation[];
  readonly isStreaming?: boolean;
  readonly isRefusal?: boolean;
  readonly refusalReason?: string;
  readonly hitlPending?: boolean;
  readonly followUpSuggestions?: readonly string[];
  readonly sqlGenerated?: string;
  readonly executionTimeMs?: number;
}

export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly ChatMessage[];
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ─── Citation Pill Component ─────────────────────────────

export interface CitationPillProps {
  readonly citation: Citation;
  readonly index: number;
  readonly onClick?: (citation: Citation) => void;
}

export function CitationPill({ citation, index, onClick }: CitationPillProps) {
  return {
    type: 'button',
    className: 'citation-pill',
    'aria-label': `Citation ${index + 1}: ${citation.column}`,
    'data-citation-id': citation.id,
    onClick: () => onClick?.(citation),
    children: `[${index + 1}]`,
  };
}

// ─── Confidence Badge Component ──────────────────────────

export interface ConfidenceBadgeProps {
  readonly tier: ConfidenceTier;
  readonly score?: number;
  readonly locale?: 'en' | 'vi';
}

const CONFIDENCE_LABELS = {
  en: { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence — routed to reviewer' },
  vi: { high: 'Độ tin cậy cao', medium: 'Độ tin cậy trung bình', low: 'Độ tin cậy thấp — đã chuyển cho kiểm soát viên' },
} as const;

const CONFIDENCE_COLORS = {
  high: 'var(--confidence-high, #10b981)',
  medium: 'var(--confidence-medium, #f59e0b)',
  low: 'var(--confidence-low, #ef4444)',
} as const;

export function ConfidenceBadge({ tier, score, locale = 'en' }: ConfidenceBadgeProps) {
  return {
    type: 'span',
    className: `confidence-badge confidence-${tier}`,
    role: 'status',
    'aria-label': CONFIDENCE_LABELS[locale][tier],
    style: { '--badge-color': CONFIDENCE_COLORS[tier] },
    children: [
      { type: 'span', className: 'confidence-dot' },
      CONFIDENCE_LABELS[locale][tier],
      score !== undefined ? ` (${Math.round(score * 100)}%)` : '',
    ],
  };
}

// ─── HITL Banner Component ───────────────────────────────

export interface HitlBannerProps {
  readonly slaMinutes: number;
  readonly locale?: 'en' | 'vi';
  readonly reviewerName?: string;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly onRefresh?: () => void;
}

const HITL_LABELS = {
  en: {
    pending: (sla: number) => `Your question requires reviewer approval. Reviewer SLA: ${sla} minutes.`,
    approved: 'Your answer has been reviewed and approved.',
    rejected: 'The reviewer has declined this question.',
  },
  vi: {
    pending: (sla: number) => `Câu hỏi của bạn cần được kiểm soát viên phê duyệt. SLA: ${sla} phút.`,
    approved: 'Câu trả lời đã được kiểm soát viên phê duyệt.',
    rejected: 'Kiểm soát viên đã từ chối câu hỏi này.',
  },
} as const;

export function HitlBanner({ slaMinutes, locale = 'en', status, onRefresh }: HitlBannerProps) {
  const labels = HITL_LABELS[locale];
  const message = status === 'pending'
    ? labels.pending(slaMinutes)
    : labels[status];

  return {
    type: 'div',
    className: `hitl-banner hitl-${status}`,
    role: 'alert',
    'aria-live': 'polite',
    children: [
      { type: 'span', className: 'hitl-icon', children: status === 'pending' ? '⏳' : status === 'approved' ? '✅' : '❌' },
      { type: 'span', className: 'hitl-message', children: message },
      status === 'pending' ? { type: 'button', className: 'hitl-refresh', onClick: onRefresh, children: '↻' } : null,
    ],
  };
}

// ─── Refusal State Component ─────────────────────────────

export interface RefusalStateProps {
  readonly reason: 'outOfScope' | 'sensitive' | 'lowConfidence';
  readonly locale?: 'en' | 'vi';
  readonly onRephrase?: () => void;
}

const REFUSAL_MESSAGES = {
  en: {
    outOfScope: "I don't have a metric for that question. Try rephrasing.",
    sensitive: "Your role doesn't permit this question. Request elevation if needed.",
    lowConfidence: "I'm not confident enough to answer. This has been routed to a reviewer.",
  },
  vi: {
    outOfScope: 'Tôi không có chỉ số phù hợp với câu hỏi này. Vui lòng diễn đạt lại.',
    sensitive: 'Vai trò của bạn không cho phép truy vấn này. Vui lòng yêu cầu nâng quyền nếu cần.',
    lowConfidence: 'Tôi chưa đủ tin cậy để trả lời. Câu hỏi đã được chuyển cho kiểm soát viên.',
  },
} as const;

export function RefusalState({ reason, locale = 'en', onRephrase }: RefusalStateProps) {
  return {
    type: 'div',
    className: 'refusal-state',
    role: 'alert',
    children: [
      { type: 'p', children: REFUSAL_MESSAGES[locale][reason] },
      reason === 'outOfScope' ? { type: 'button', onClick: onRephrase, children: locale === 'en' ? 'Rephrase' : 'Diễn đạt lại' } : null,
    ],
  };
}

// ─── Show Me How Drawer ──────────────────────────────────

export interface ShowMeHowDrawerProps {
  readonly sql: string;
  readonly citations: readonly Citation[];
  readonly confidenceTier: ConfidenceTier;
  readonly confidenceScore: number;
  readonly executionTimeMs: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function ShowMeHowDrawer(props: ShowMeHowDrawerProps) {
  return {
    type: 'aside',
    className: `drawer ${props.isOpen ? 'drawer-open' : ''}`,
    role: 'complementary',
    'aria-label': 'Answer provenance',
    children: [
      { type: 'header', children: [
        { type: 'h3', children: 'How this answer was generated' },
        { type: 'button', onClick: props.onClose, 'aria-label': 'Close', children: '✕' },
      ]},
      { type: 'section', className: 'drawer-sql', children: [
        { type: 'h4', children: 'Generated SQL' },
        { type: 'pre', children: { type: 'code', children: props.sql } },
      ]},
      { type: 'section', className: 'drawer-citations', children: [
        { type: 'h4', children: `Citations (${props.citations.length})` },
        ...props.citations.map((c, i) => ({
          type: 'div', className: 'citation-detail',
          children: `[${i + 1}] ${c.column}: ${JSON.stringify(c.value)}`,
        })),
      ]},
      { type: 'section', className: 'drawer-meta', children: [
        { type: 'dl', children: [
          { type: 'dt', children: 'Confidence' },
          { type: 'dd', children: `${props.confidenceTier} (${Math.round(props.confidenceScore * 100)}%)` },
          { type: 'dt', children: 'Execution' },
          { type: 'dd', children: `${props.executionTimeMs}ms` },
        ]},
      ]},
    ],
  };
}

// ─── Follow-Up Suggestions ───────────────────────────────

export interface FollowUpSuggestionsProps {
  readonly suggestions: readonly string[];
  readonly onSelect: (question: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  return {
    type: 'div',
    className: 'follow-up-suggestions',
    role: 'navigation',
    'aria-label': 'Suggested follow-up questions',
    children: suggestions.map((q) => ({
      type: 'button',
      className: 'follow-up-chip',
      onClick: () => onSelect(q),
      children: q,
    })),
  };
}

// ─── Chat Input Component ────────────────────────────────

export interface ChatInputProps {
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly onSubmit: (question: string) => void;
  readonly locale?: 'en' | 'vi';
}

export function ChatInput({ placeholder, disabled, onSubmit, locale = 'en' }: ChatInputProps) {
  const defaultPlaceholder = locale === 'en' ? 'Ask a question…' : 'Đặt câu hỏi…';
  return {
    type: 'form',
    className: 'chat-input-form',
    role: 'search',
    children: [
      { type: 'input', className: 'chat-input', placeholder: placeholder ?? defaultPlaceholder, disabled, 'aria-label': defaultPlaceholder },
      { type: 'button', className: 'chat-submit', type2: 'submit', disabled, children: locale === 'en' ? 'Ask' : 'Hỏi' },
    ],
  };
}

// ─── Empty State ─────────────────────────────────────────

export interface EmptyStateProps {
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly sampleQuestions: readonly string[];
  readonly onSelect: (question: string) => void;
  readonly locale?: 'en' | 'vi';
}

export function EmptyState({ bu, sampleQuestions, onSelect, locale = 'en' }: EmptyStateProps) {
  const greeting = locale === 'en' ? 'What would you like to know?' : 'Bạn muốn tìm hiểu điều gì?';
  return {
    type: 'div',
    className: `empty-state theme-${bu}`,
    children: [
      { type: 'h2', className: 'empty-greeting', children: greeting },
      { type: 'div', className: 'sample-questions', children: sampleQuestions.map((q) => ({
        type: 'button', className: 'sample-question', onClick: () => onSelect(q), children: q,
      }))},
    ],
  };
}

// ─── Loading State ───────────────────────────────────────

export function LoadingState({ locale = 'en' }: { locale?: 'en' | 'vi' }) {
  return {
    type: 'div', className: 'loading-state', role: 'status', 'aria-live': 'polite',
    children: [
      { type: 'div', className: 'loading-dots', children: [
        { type: 'span' }, { type: 'span' }, { type: 'span' },
      ]},
      { type: 'p', children: locale === 'en' ? 'Thinking…' : 'Đang xử lý…' },
    ],
  };
}

// ─── Conversation History ────────────────────────────────

export interface ConversationHistoryProps {
  readonly conversations: readonly Conversation[];
  readonly activeId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onNew: () => void;
  readonly onExport: (id: string) => void;
}

export function ConversationHistory(props: ConversationHistoryProps) {
  return {
    type: 'nav',
    className: 'conversation-history',
    'aria-label': 'Conversation history',
    children: [
      { type: 'button', className: 'new-conversation', onClick: props.onNew, children: '+ New conversation' },
      { type: 'ul', children: props.conversations.map((conv) => ({
        type: 'li',
        className: `conv-item ${conv.id === props.activeId ? 'active' : ''}`,
        children: [
          { type: 'button', onClick: () => props.onSelect(conv.id), children: conv.title },
          { type: 'button', className: 'conv-export', onClick: () => props.onExport(conv.id), 'aria-label': 'Export', children: '↓' },
        ],
      }))},
    ],
  };
}
