/** i18n Pattern A — chrome options for the "what's this about?" picker.
 *  `id` is the stable value the field stores; `labelKey` resolves via `t()`. */
export const REASONS: { id: string; labelKey: string }[] = [
  { id: "collaborate", labelKey: "connect:form.reasonCollaborate" },
  { id: "advice", labelKey: "connect:form.reasonAdvice" },
  { id: "sawPost", labelKey: "connect:form.reasonSawPost" },
  { id: "shouldMeet", labelKey: "connect:form.reasonShouldMeet" },
  { id: "somethingElse", labelKey: "connect:form.reasonSomethingElse" },
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How long the success panel lingers before closing itself. */
export const AUTO_CLOSE_SECONDS = 6;
