import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

export const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** Format the live `expiresAt`; demo mode sends '' so we fall back to the 7-day line. */
export function expiryLabel(
  iso: string,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!iso) return t("auth:invite.ready.expiresIn7Days");
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return t("auth:invite.ready.expiresIn7Days");
  return t("auth:invite.ready.expiresOn", { date: fmt.date(d) });
}
