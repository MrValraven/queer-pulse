import type { TFunction } from "../../shared/i18n/types";

/**
 * The canonical sentinel a report carries instead of a reporter's name when the
 * reporter filed anonymously. It is an ID, not display text: `ModReport`'s demo
 * seed stores this exact literal, the live adapter emits it for
 * `reporter.anonymous`, and `AdminReportDrawer` compares against it to pick the
 * shielded "?" avatar. Never translate the sentinel itself.
 */
export const ANONYMOUS_REPORTER = "anonymous";

export function isAnonymousReporter(reporterName: string): boolean {
  return reporterName === ANONYMOUS_REPORTER;
}

/**
 * What a moderator actually reads for "Reported by …" (FE-ADM-26). A real
 * reporter's name is fetched content and passes through; the anonymous
 * sentinel resolves to a catalog phrase so it isn't English in every locale.
 */
export function reporterDisplayName(
  reporterName: string,
  t: TFunction,
): string {
  return isAnonymousReporter(reporterName)
    ? t("admin:moderation.reporter.anonymous")
    : reporterName;
}
