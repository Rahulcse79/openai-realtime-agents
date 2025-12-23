import { zodTextFormat } from 'openai/helpers/zod';
import { GuardrailOutputZod, GuardrailOutput } from '@/app/types';
import { z } from 'zod';

export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'Coral telecom',
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at classifying text according to moderation policies. The message may be in any language (including Hindi or English). Consider the provided message, analyze potential classes from output_classes, and output the best classification. Output json, following the provided schema. Keep your analysis and reasoning short and to the point, maximum 2 sentences.

      <info>
      - Company name: ${companyName}
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - OFFENSIVE: Content that includes hate speech, discriminatory language, insults, slurs, or harassment.
      - OFF_BRAND: Content that discusses competitors in a disparaging way.
      - VIOLENCE: Content that includes explicit threats, incitement of harm, or graphic descriptions of physical injury or violence.
      - NONE: If no other classes are appropriate and the message is fine.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Use a more capable, up-to-date text model for classification.
      model: 'gpt-4.1-mini',
      input: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runGuardrailClassifier.');
  }

  const data = await response.json();

  try {
    const output = GuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error('Error parsing the message content as GuardrailOutput:', error);
    return Promise.reject('Failed to parse guardrail output.');
  }
}

export interface RealtimeOutputGuardrailResult {
  tripwireTriggered: boolean;
  outputInfo: any;
}

export interface RealtimeOutputGuardrailArgs {
  agentOutput: string;
  agent?: any;
  context?: any;
}

const LanguageDetectionZod = z.object({
  language: z.string(),
  iso639_1: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

type LanguageDetection = z.infer<typeof LanguageDetectionZod>;

async function detectLanguage(text: string): Promise<LanguageDetection> {
  const messages = [
    {
      role: 'user',
      content: `Detect the language of the text below.\n\nRules:\n- Output JSON only, matching the schema.\n- language: a short human-readable name (e.g., Hindi, English, Punjabi).\n- iso639_1: if known (e.g., hi, en, pa).\n- confidence: number 0..1.\n\n<text>\n${text}\n</text>`,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: messages,
      text: {
        format: zodTextFormat(LanguageDetectionZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    return Promise.reject('Error with detectLanguage.');
  }

  const data = await response.json();
  return LanguageDetectionZod.parse(data.output_parsed);
}

function isTriviallyLanguageAgnostic(text: string) {
  const t = (text ?? '').trim();
  if (!t) return true;
  // Only digits / punctuation / spaces
  if (/^[\d\s+\-()#.,]*$/.test(t)) return true;
  // Very short acknowledgements that are commonly ambiguous across languages
  if (/^(ok|okay|yes|no|ya|yep|nope|hm|hmm|haan|han|ji|theek|thik)\b/i.test(t) && t.length <= 8) {
    return true;
  }
  return false;
}

// Creates a guardrail that locks the conversation language (from user transcripts)
// and blocks assistant outputs that are clearly in a different language.
export function createLanguageLockGuardrail(options?: {
  name?: string;
  // Where we store language info on the shared session context.
  contextKey?: string;
}) {
  const name = options?.name ?? 'language_lock_guardrail';
  const contextKey = options?.contextKey ?? 'languageLock';

  return {
    name,

    async execute({ agentOutput, context }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        // Let purely numeric/neutral outputs pass without checks.
        if (isTriviallyLanguageAgnostic(agentOutput)) {
          return { tripwireTriggered: false, outputInfo: { skipped: 'agnostic_output' } };
        }

        const ctx = (context ?? {}) as any;
        const lock = (ctx[contextKey] ?? {}) as any;

        // Find a "good" user utterance from history to initialize the lock.
        // We depend on the Realtime session pushing message history into context.
        const history: any[] = ctx.history ?? [];
        const userMessages = history
          .filter((h) => h?.type === 'message' && h?.role === 'user')
          .map((h) => (typeof h?.content === 'string' ? h.content : h?.content?.[0]?.text ?? ''))
          .filter((t) => typeof t === 'string' && t.trim().length > 0);

        if (!lock.conversationLanguage && userMessages.length > 0) {
          const candidate = userMessages.find((t) => t.trim().length >= 8) ?? userMessages[0];
          const userLang = await detectLanguage(candidate);
          lock.conversationLanguage = userLang;
          ctx[contextKey] = lock;
        }

        // If we still couldn't infer, don't block.
        if (!lock.conversationLanguage?.language) {
          return { tripwireTriggered: false, outputInfo: { skipped: 'no_conversation_language' } };
        }

        const outLang = await detectLanguage(agentOutput);

        const normalize = (s: string) => s.trim().toLowerCase();
        const lockedName = normalize(lock.conversationLanguage.language);
        const outName = normalize(outLang.language);

        // If ISO language is available for both, compare that first.
        const lockedIso = (lock.conversationLanguage.iso639_1 ?? '').trim().toLowerCase();
        const outIso = (outLang.iso639_1 ?? '').trim().toLowerCase();
        const isoMismatch = lockedIso && outIso ? lockedIso !== outIso : false;

        const nameMismatch = lockedName && outName ? lockedName !== outName : false;

        // Only trip on a confident mismatch. (Avoid false positives.)
        const confidence = outLang.confidence ?? 0.6;
        const mismatch = (isoMismatch || nameMismatch) && confidence >= 0.55;

        return {
          tripwireTriggered: mismatch,
          outputInfo: {
            conversationLanguage: lock.conversationLanguage,
            outputLanguage: outLang,
            reason: mismatch ? 'language_mismatch' : 'language_match_or_low_confidence',
          },
        };
      } catch (err) {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'language_guardrail_failed' },
        };
      }
    },
  } as const;
}

// Creates a guardrail bound to a specific company name for output moderation purposes. 
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({ agentOutput }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}