import { AnimatePresence, m } from "motion/react";
import { FiUser } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminAvatar } from "../ui";
import type { LeadStaffSummaryDTO } from "./api/leads.types";
import {
  LEAD_ASSIGNEE_MOTION_EASE,
  LEAD_ASSIGNEE_MOTION_SECONDS,
} from "./leadAssignees.data";
import {
  leadAssigneesAriaOf,
  leadStaffInitialsOf,
  leadStaffToneOf,
} from "./leadAssignees.model";
import { LeadFadeInline } from "./LeadFadeInline";
import { useLeadViewerId } from "./useLeadViewerId";
import styles from "./LeadAssigneeStack.module.css";

/**
 * The staff in charge of a list row: up to three overlapping avatars (a
 * photo, else initials on a steady tone, else a person icon), then "+N" for
 * the rest. The eye reads the stack; assistive tech reads "In charge: You
 * and Marta Lobo". An unassigned lead draws nothing and says nothing. The
 * container always renders, so the last avatar to leave still fades out.
 */
export function LeadAssigneeStack({
  assignees,
  assigneeCount,
}: {
  assignees: readonly LeadStaffSummaryDTO[];
  assigneeCount: number;
}) {
  const { t, language } = useTranslation();
  const viewerId = useLeadViewerId();
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : LEAD_ASSIGNEE_MOTION_SECONDS,
    ease: LEAD_ASSIGNEE_MOTION_EASE,
  };
  const hiddenScale = reducedMotion ? 1 : 0.8;
  const spokenLine = leadAssigneesAriaOf(
    { assignees, assigneeCount },
    viewerId,
    t,
    language,
  );
  const moreCount = Math.max(0, assigneeCount - assignees.length);

  return (
    <span className={styles.stack}>
      <span className={styles.avatars} aria-hidden>
        <AnimatePresence initial={false}>
          {assignees.map((summary) => {
            const initials = leadStaffInitialsOf(summary.displayName);
            return (
              <m.span
                key={summary.id}
                className={styles.avatarSlot}
                initial={{ opacity: 0, scale: hiddenScale }}
                animate={{ opacity: 1, scale: 1, transition }}
                exit={{ opacity: 0, scale: hiddenScale, transition }}
              >
                <AdminAvatar
                  size="sm"
                  src={summary.avatarUrl ?? undefined}
                  alt=""
                  initials={initials === "" ? <FiUser /> : initials}
                  tone={leadStaffToneOf(summary.id)}
                />
              </m.span>
            );
          })}
        </AnimatePresence>
        <LeadFadeInline isShown={moreCount > 0}>
          <span className={styles.more}>
            {t("admin:leads.list.assigneesMore", { count: moreCount })}
          </span>
        </LeadFadeInline>
      </span>
      {spokenLine !== null ? (
        <span className="visuallyHidden">{spokenLine}</span>
      ) : null}
    </span>
  );
}
