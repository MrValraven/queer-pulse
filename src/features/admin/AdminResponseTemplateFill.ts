/**
 * Placeholder substitution for moderator response templates.
 *
 * The set is deliberately tiny: the two facts that change on every single
 * decision and are tedious to retype. Everything else belongs in the template
 * body as plain words. The backend rejects any other `{token}` at the write
 * boundary (`mod-response-template-placeholders.ts`), so a moderator can never
 * be handed a brace the picker cannot resolve.
 *
 * Substitution happens HERE, at prefill time, before the text reaches the note
 * field. The moderator therefore reads and can edit the finished wording
 * before it is sent, and the stored note is always the text they approved. No
 * template id is ever persisted on the action, so editing a template later
 * cannot rewrite what a member was told.
 */

export const TEMPLATE_PLACEHOLDERS = ["member", "community"] as const;

export type TemplatePlaceholder = (typeof TEMPLATE_PLACEHOLDERS)[number];

export interface TemplateFillValues {
  /** The reported member's display name. */
  member: string;
  /** The community the report is scoped to, or a fallback when it is not. */
  community: string;
}

const PLACEHOLDER_PATTERN = /\{(member|community)\}/g;

/** Replaces every known `{token}` in `body` with its value. Unknown tokens
 *  cannot reach here (the backend rejects them) and are left untouched. */
export function fillTemplateBody(
  body: string,
  values: TemplateFillValues,
): string {
  return body.replace(PLACEHOLDER_PATTERN, (_match, token: string) =>
    token === "member" ? values.member : values.community,
  );
}
