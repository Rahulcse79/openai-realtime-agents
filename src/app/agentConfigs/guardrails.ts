import { zodTextFormat } from "openai/helpers/zod";
import { GuardrailOutputZod, GuardrailOutput } from "@/app/types";
import { z } from "zod";

export async function runGuardrailClassifier(
  message: string,
  companyName: string = "Coral telecom"
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: "user",
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

  const response = await fetch("http://localhost:3000/api/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, "output_format"),
      },
    }),
  });

  if (!response.ok) {
    console.warn("Server returned an error:", response);
    return Promise.reject("Error with runGuardrailClassifier.");
  }

  const data = await response.json();

  try {
    const output = GuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error(
      "Error parsing the message content as GuardrailOutput:",
      error
    );
    return Promise.reject("Failed to parse guardrail output.");
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
      role: "user",
      content: `Detect the language of the text below.\n\nRules:\n- Output JSON only, matching the schema.\n- language: a short human-readable name (e.g., Hindi, English, Punjabi).\n- iso639_1: if known (e.g., hi, en, pa).\n- confidence: number 0..1.\n\n<text>\n${text}\n</text>`,
    },
  ];

  const response = await fetch("/api/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: messages,
      text: {
        format: zodTextFormat(LanguageDetectionZod, "output_format"),
      },
    }),
  });

  if (!response.ok) {
    return Promise.reject("Error with detectLanguage.");
  }

  const data = await response.json();
  return LanguageDetectionZod.parse(data.output_parsed);
}

function isTriviallyLanguageAgnostic(text: string) {
  const t = (text ?? "").trim();
  if (!t) return true;
  if (/^[\d\s+\-()#.,]*$/.test(t)) return true;
  if (
    /^(ok|okay|yes|no|ya|yep|nope|hm|hmm|haan|han|ji|theek|thik)\b/i.test(t) &&
    t.length <= 8
  ) {
    return true;
  }
  return false;
}

function getTextFromHistoryMessage(h: any): string {
  if (!h || typeof h !== "object") return "";
  const c: any = (h as any).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .map((part: any) => {
        if (!part || typeof part !== "object") return "";
        if (part.type === "input_text") return part.text ?? "";
        if (part.type === "text") return part.text ?? "";
        if (part.type === "audio") return part.transcript ?? "";
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function isShortOrAmbiguousUserTurn(text: string): boolean {
  const t = (text ?? "").trim();
  if (!t) return true;
  if (t.length <= 2) return true;
  // If it's a single word (common in voice IVR like "no"/"yes"/"नहीं"/"نہیں"),
  // treat it as ambiguous and do NOT consider it a language switch.
  // This intentionally captures non-Latin scripts too.
  if (!/\s/.test(t) && t.length <= 6) return true;
  if (/^[\d\s+\-()#.,]*$/.test(t)) return true;
  // A small set of common short confirmations across languages.
  if (/^(ok|okay|yes|no|ya|yep|nope|hm|hmm|haan|han|ji|thik|theek|nahi|nahin|nhi|n|haanji|theek hai)\b/i.test(t) && t.length <= 12) {
    return true;
  }
  return false;
}

export function createLanguageLockGuardrail(options?: {
  name?: string;
  contextKey?: string;
}) {
  const name = options?.name ?? "language_lock_guardrail";
  const contextKey = options?.contextKey ?? "languageLock";

  return {
    name,

    async execute({
      agentOutput,
      context,
    }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        if (isTriviallyLanguageAgnostic(agentOutput)) {
          return {
            tripwireTriggered: false,
            outputInfo: { skipped: "agnostic_output" },
          };
        }

        const ctx = (context ?? {}) as any;
        const lock = (ctx[contextKey] ?? {}) as any;
        const history: any[] = ctx.history ?? [];
        const userMessages = history
          .filter((h) => h?.type === "message" && h?.role === "user")
          .map((h) => getTextFromHistoryMessage(h))
          .filter((t) => typeof t === "string" && t.trim().length > 0);

        // Instead of a permanent "lock" to the initial language, we track the
        // most recent CLEAR user language. Short/ambiguous turns (e.g., "no",
        // numbers, OTPs) do not change the conversation language.
        const clearUserMessages = userMessages.filter(
          (t) => !isShortOrAmbiguousUserTurn(t) && t.trim().length >= 4
        );

        const latestClear = clearUserMessages[clearUserMessages.length - 1];
        if (latestClear) {
          const userLang = await detectLanguage(latestClear);
          lock.conversationLanguage = userLang;
          lock.lastClearUserText = latestClear;
          ctx[contextKey] = lock;
        }

        if (!lock.conversationLanguage?.language) {
          return {
            tripwireTriggered: false,
            outputInfo: { skipped: "no_conversation_language" },
          };
        }

        const outLang = await detectLanguage(agentOutput);

        const normalize = (s: string) => s.trim().toLowerCase();
        const lockedName = normalize(lock.conversationLanguage.language);
        const outName = normalize(outLang.language);

        const lockedIso = (lock.conversationLanguage.iso639_1 ?? "")
          .trim()
          .toLowerCase();
        const outIso = (outLang.iso639_1 ?? "").trim().toLowerCase();
        const isoMismatch = lockedIso && outIso ? lockedIso !== outIso : false;

        const nameMismatch =
          lockedName && outName ? lockedName !== outName : false;

        const confidence = outLang.confidence ?? 0.6;
        const mismatch = (isoMismatch || nameMismatch) && confidence >= 0.55;

        return {
          tripwireTriggered: mismatch,
          outputInfo: {
            conversationLanguage: lock.conversationLanguage,
            outputLanguage: outLang,
            reason: mismatch
              ? "language_mismatch"
              : "language_match_or_low_confidence",
          },
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: "language_guardrail_failed" },
        };
      }
    },
  } as const;
}

export function createModerationGuardrail(companyName: string) {
  return {
    name: "moderation_guardrail",

    async execute({
      agentOutput,
    }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== "NONE";
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: "guardrail_failed" },
        };
      }
    },
  } as const;
}
