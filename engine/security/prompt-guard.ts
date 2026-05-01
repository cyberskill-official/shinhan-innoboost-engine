// engine/security/prompt-guard.ts
// P02-T06 — Layered prompt-injection defence
// Three layers: input sanitiser → system-prompt isolation → output classifier

// ─── Types ───────────────────────────────────────────────

export type ThreatType =
  | 'role_swap'
  | 'system_prompt_extraction'
  | 'context_overflow'
  | 'encoded_payload'
  | 'dan_attack'
  | 'sql_injection_via_prompt'
  | 'data_exfiltration'
  | 'none';

export interface SanitisationResult {
  readonly sanitised: string;
  readonly threatsDetected: readonly ThreatType[];
  readonly blocked: boolean;
  readonly blockReason?: string;
}

export interface OutputClassificationResult {
  readonly safe: boolean;
  readonly threatsDetected: readonly ThreatType[];
  readonly blockReason?: string;
}

// ─── Layer 1: Input Sanitiser ────────────────────────────

const ADVERSARIAL_PATTERNS: readonly { readonly pattern: RegExp; readonly threat: ThreatType }[] = [
  // Role-swap attacks
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|prompts?)/i, threat: 'role_swap' },
  { pattern: /you\s+are\s+now\s+(a|an|the)\s+/i, threat: 'role_swap' },
  { pattern: /pretend\s+(to\s+be|you('re|r)\s+)/i, threat: 'role_swap' },
  { pattern: /act\s+as\s+(if\s+you('re|r)|a|an)\s+/i, threat: 'role_swap' },
  { pattern: /new\s+system\s+prompt/i, threat: 'role_swap' },
  { pattern: /override\s+(system|safety|security)/i, threat: 'role_swap' },

  // DAN (Do Anything Now) attacks
  { pattern: /\bDAN\b/g, threat: 'dan_attack' },
  { pattern: /do\s+anything\s+now/i, threat: 'dan_attack' },
  { pattern: /jailbreak/i, threat: 'dan_attack' },

  // System prompt extraction
  { pattern: /what\s+(is|are)\s+your\s+(system\s+)?prompt/i, threat: 'system_prompt_extraction' },
  { pattern: /reveal\s+(your|the)\s+(system\s+)?prompt/i, threat: 'system_prompt_extraction' },
  { pattern: /show\s+me\s+(your|the)\s+instructions/i, threat: 'system_prompt_extraction' },
  { pattern: /repeat\s+(everything|all)\s+(above|before)/i, threat: 'system_prompt_extraction' },
  { pattern: /print\s+(your|the)\s+(system\s+)?(prompt|instructions)/i, threat: 'system_prompt_extraction' },

  // Encoded payloads
  { pattern: /\\x[0-9a-f]{2}/gi, threat: 'encoded_payload' },
  { pattern: /&#x?[0-9a-f]+;/gi, threat: 'encoded_payload' },
  { pattern: /%[0-9a-f]{2}/gi, threat: 'encoded_payload' },

  // Context overflow
  { pattern: /(.)\1{50,}/g, threat: 'context_overflow' },

  // SQL injection via prompt
  { pattern: /;\s*(DROP|DELETE|UPDATE|TRUNCATE|ALTER|INSERT)\s+/i, threat: 'sql_injection_via_prompt' },
  { pattern: /UNION\s+SELECT/i, threat: 'sql_injection_via_prompt' },
  { pattern: /--\s*$/gm, threat: 'sql_injection_via_prompt' },
];

/**
 * Layer 1: Sanitise user input before it reaches the LLM.
 * Detects and neutralises adversarial patterns.
 */
export function sanitiseInput(input: string): SanitisationResult {
  const threats: ThreatType[] = [];
  let sanitised = input;

  for (const { pattern, threat } of ADVERSARIAL_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(sanitised)) {
      threats.push(threat);
      // Reset again for replacement
      pattern.lastIndex = 0;
      sanitised = sanitised.replace(pattern, '[REDACTED]');
    }
  }

  // Length check — context overflow protection
  if (sanitised.length > 2000) {
    threats.push('context_overflow');
    sanitised = sanitised.slice(0, 2000);
  }

  // Deduplicate threats
  const uniqueThreats = [...new Set(threats)];

  // Block on severe threats
  const blockingThreats: ThreatType[] = ['role_swap', 'dan_attack', 'sql_injection_via_prompt'];
  const hasBlockingThreat = uniqueThreats.some((t) => blockingThreats.includes(t));

  return {
    sanitised,
    threatsDetected: uniqueThreats,
    blocked: hasBlockingThreat,
    blockReason: hasBlockingThreat
      ? `Adversarial input detected: ${uniqueThreats.join(', ')}`
      : undefined,
  };
}

// ─── Layer 2: System-Prompt Isolation ────────────────────

/**
 * Layer 2: Wrap user content in untrusted_content tags.
 * Ensures user text is never treated as system instructions.
 */
export function isolateUserContent(userInput: string): string {
  // Strip any existing tags that might bypass isolation
  const stripped = userInput
    .replace(/<\/?untrusted_content>/gi, '')
    .replace(/<\/?system>/gi, '')
    .replace(/<\/?assistant>/gi, '')
    .replace(/<\/?user>/gi, '');

  return `<untrusted_content>${stripped}</untrusted_content>`;
}

// ─── Layer 3: Output Classifier ──────────────────────────

const OUTPUT_THREAT_PATTERNS: readonly { readonly pattern: RegExp; readonly threat: ThreatType }[] = [
  // System prompt leakage
  { pattern: /SYSTEM_PROMPT_VERSION/i, threat: 'system_prompt_extraction' },
  { pattern: /untrusted_content/i, threat: 'system_prompt_extraction' },
  { pattern: /CyberSkill's chat-with-data assistant/i, threat: 'system_prompt_extraction' },

  // Role swap in output
  { pattern: /I('m| am) (now |)(a |an |the )(?!CyberSkill)/i, threat: 'role_swap' },

  // Data exfiltration patterns
  { pattern: /\b(password|secret|api[_\s]?key|access[_\s]?token)\s*[:=]/i, threat: 'data_exfiltration' },
];

/**
 * Layer 3: Classify LLM output before surfacing to user.
 * Catches model attempting to exfiltrate or break role.
 */
export function classifyOutput(output: string): OutputClassificationResult {
  const threats: ThreatType[] = [];

  for (const { pattern, threat } of OUTPUT_THREAT_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(output)) {
      threats.push(threat);
    }
  }

  const uniqueThreats = [...new Set(threats)];

  return {
    safe: uniqueThreats.length === 0,
    threatsDetected: uniqueThreats,
    blockReason: uniqueThreats.length > 0
      ? `Output contains potential threats: ${uniqueThreats.join(', ')}`
      : undefined,
  };
}

// ─── Full Guard Pipeline ─────────────────────────────────

export interface GuardResult {
  readonly allowed: boolean;
  readonly sanitisedInput: string;
  readonly inputThreats: readonly ThreatType[];
  readonly outputThreats: readonly ThreatType[];
  readonly blockReason?: string;
}

/**
 * Run the full 3-layer guard pipeline.
 * Call guardInput before LLM, guardOutput after.
 */
export function guardInput(userInput: string): Pick<GuardResult, 'allowed' | 'sanitisedInput' | 'inputThreats' | 'blockReason'> {
  const sanitised = sanitiseInput(userInput);
  const isolated = sanitised.blocked ? '' : isolateUserContent(sanitised.sanitised);

  return {
    allowed: !sanitised.blocked,
    sanitisedInput: isolated,
    inputThreats: sanitised.threatsDetected,
    blockReason: sanitised.blockReason,
  };
}

export function guardOutput(llmOutput: string): Pick<GuardResult, 'allowed' | 'outputThreats' | 'blockReason'> {
  const classification = classifyOutput(llmOutput);
  return {
    allowed: classification.safe,
    outputThreats: classification.threatsDetected,
    blockReason: classification.blockReason,
  };
}
