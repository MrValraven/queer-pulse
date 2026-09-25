// ── Which language a draft is written in ────────────────────────────────────
// Split out of `ComposeDetailsSection`, which only reads the answer.

/**
 * Which language the draft reads as, or null when it is too short or too even
 * to call.
 *
 * Two word lists rather than a library: they are the prototype's, tuned across
 * the two languages this community actually writes in, and the answer only
 * feeds a hint the member can overrule with one tap. A tie returns null, so
 * the hint stays quiet on a post that really is written in both.
 */
const PORTUGUESE_WORDS =
  /\b(que|não|uma|para|com|é|está|também|alguém|onde|quando|porque|obrigad[oa]|sim|muito|aqui|isso|isto|já|vou|tenho|preciso|procuro|casa|quarto)\b/gi;
const ENGLISH_WORDS =
  /\b(the|and|for|with|that|this|have|anyone|looking|need|know|where|when|because|thanks|room|flat|does|would)\b/gi;

export function detectLanguage(body: string): "pt" | "en" | null {
  // `String.match` with a global regex resets `lastIndex` itself, so these two
  // module-level regexes are safe to reuse across calls.
  const portugueseHits = body.match(PORTUGUESE_WORDS)?.length ?? 0;
  const englishHits = body.match(ENGLISH_WORDS)?.length ?? 0;
  if (portugueseHits === englishHits) return null;
  return portugueseHits > englishHits ? "pt" : "en";
}
