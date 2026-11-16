import { AnimatePresence, m } from "motion/react";
import { FiUser, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminAvatar, AdminChip } from "../ui";
import type { LeadStaffSummaryDTO } from "./api/leads.types";
import {
  LEAD_ASSIGNEE_MOTION_EASE,
  LEAD_ASSIGNEE_MOTION_SECONDS,
} from "./leadAssignees.data";
import {
  isLeadViewer,
  leadStaffInitialsOf,
  leadStaffLabelOf,
  leadStaffMidSentenceNameOf,
  leadStaffToneOf,
} from "./leadAssignees.model";
import styles from "./LeadAssigneesPanel.module.css";

/**
 * The staff in charge of a lead, one pill each: the avatar (a photo, else
 * initials on a steady tone, else a person icon), the name ("You" for the
 * viewer) and Unassign, whose spoken name reads mid-sentence. Pills wrap
 * onto more lines; each one fades and scales in and out, and the rest
 * slide to their new place.
 */
export function LeadAssigneeChips({
  assignees,
  viewerId,
  isBusy,
  onUnassign,
}: {
  assignees: readonly LeadStaffSummaryDTO[];
  viewerId: string | null;
  isBusy: boolean;
  onUnassign: (person: LeadStaffSummaryDTO) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : LEAD_ASSIGNEE_MOTION_SECONDS,
    ease: LEAD_ASSIGNEE_MOTION_EASE,
  };
  const hiddenScale = reducedMotion ? 1 : 0.96;

  return (
    <ul
      className={styles.chipList}
      aria-label={t("admin:leads.assignees.heading")}
    >
      <AnimatePresence initial={false}>
        {assignees.map((person) => {
          const initials = leadStaffInitialsOf(person.displayName);
          const label = leadStaffLabelOf(person, viewerId, t);
          const isViewer = isLeadViewer(person, viewerId);
          return (
            <m.li
              key={person.id}
              layout="position"
              className={styles.chipItem}
              initial={{ opacity: 0, scale: hiddenScale }}
              animate={{ opacity: 1, scale: 1, transition }}
              exit={{ opacity: 0, scale: hiddenScale, transition }}
              transition={transition}
            >
              <AdminChip tone="plum" className={styles.chip}>
                <span className={styles.chipAvatar} aria-hidden>
                  <AdminAvatar
                    size="sm"
                    src={person.avatarUrl ?? undefined}
                    alt=""
                    initials={initials === "" ? <FiUser /> : initials}
                    tone={leadStaffToneOf(person.id)}
                  />
                </span>
                <span className={styles.chipName}>{label}</span>
                <Button
                  variant="quiet"
                  size="sm"
                  className={styles.unassignButton}
                  aria-label={
                    isViewer
                      ? t("admin:leads.assignees.unassignSelfAria")
                      : t("admin:leads.assignees.unassignAria", {
                          name: leadStaffMidSentenceNameOf(person, viewerId, t),
                        })
                  }
                  aria-disabled={isBusy || undefined}
                  onClick={() => onUnassign(person)}
                >
                  <FiX className={styles.unassignIcon} aria-hidden />
                  {t("admin:leads.assignees.unassign")}
                </Button>
              </AdminChip>
            </m.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
