import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { BanEvasionEscalationDTO } from "./api/adminBanEvasionEscalations.api";
import styles from "./AdminBanEvasionEscalationsPage.module.css";

/**
 * What staff did with a closed escalation: who looked, when, and what they
 * wrote.
 *
 * This block is staff-only. `resolutionNote` is never returned on any
 * community-scoped surface, and handing it back to the escalating moderator
 * would deliver through the back door the cross-community picture the one-bit
 * badge exists to withhold. A community moderator learns only that somebody
 * closed the question.
 *
 * A closed escalation with no note says so in words. "Nobody wrote anything
 * down" and "the note did not load" are different, and a blank line would let
 * the first stand in for the second.
 */
export function AdminBanEvasionEscalationOutcome({
  escalation,
}: {
  escalation: BanEvasionEscalationDTO;
}) {
  const { t, language } = useTranslation();
  const resolvedOn = escalation.resolvedAt
    ? formatDate(escalation.resolvedAt, language, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const resolverName = escalation.resolvedBy
    ? `${escalation.resolvedBy.firstName} ${escalation.resolvedBy.lastName}`.trim()
    : t("admin:banEvasionEscalations.resolverErased");

  return (
    <div className={styles.section}>
      <p className={styles.sectionTerm}>
        {t("admin:banEvasionEscalations.outcomeTerm")}
      </p>
      <p className={styles.meta}>
        {resolvedOn
          ? t("admin:banEvasionEscalations.resolvedBy", {
              name: resolverName,
              date: resolvedOn,
            })
          : t("admin:banEvasionEscalations.resolvedUnknownDate", {
              name: resolverName,
            })}
      </p>
      <p className={styles.sectionBody}>
        {escalation.resolutionNote ??
          t("admin:banEvasionEscalations.noResolutionNote")}
      </p>
    </div>
  );
}
