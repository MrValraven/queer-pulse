import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiThumbsUp, FiUser } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  leadStaffInitialsOf,
  leadStaffToneOf,
} from "../leads/leadAssignees.model";
import { AdminAvatar } from "../ui";
import type {
  CulturalIdeaDTO,
  CulturalStaffSummaryDTO,
} from "./api/culturalProduction.types";
import {
  useIsCulturalWriteInFlight,
  useToggleCulturalIdeaBacking,
} from "./api/useCulturalIdeaMutations";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { useCulturalViewerId } from "./useCulturalViewerId";
import styles from "./IdeaDrawer.module.css";

/**
 * A staff member as the drawer shows them: the avatar (a photo, else
 * initials on a steady tone, else a person icon) and the name, which reads
 * "You" for the viewer and names a former team member once the account is
 * gone. `detail` sits under the name (a comment's date).
 */
export function IdeaStaffIdentity({
  person,
  detail,
}: {
  person: CulturalStaffSummaryDTO | null;
  detail?: ReactNode;
}) {
  const { t } = useTranslation();
  const viewerId = useCulturalViewerId();
  const knownName = person?.displayName.trim() ?? "";
  const isViewer =
    person !== null && viewerId !== null && person.id === viewerId;
  const name = isViewer
    ? t("admin:culturalProduction.staff.you")
    : knownName === ""
      ? t("admin:culturalProduction.common.formerTeamMember")
      : knownName;
  const initials = leadStaffInitialsOf(knownName);
  return (
    <span className={styles.identity}>
      <span className={styles.identityAvatar} aria-hidden>
        <AdminAvatar
          size="sm"
          src={person?.avatarUrl ?? undefined}
          alt=""
          tone={person === null ? "anon" : leadStaffToneOf(person.id)}
          initials={initials === "" ? <FiUser /> : initials}
        />
      </span>
      <span className={styles.identityText}>
        <span className={styles.identityName}>{name}</span>
        {detail !== undefined && (
          <span className={styles.identityDetail}>{detail}</span>
        )}
      </span>
    </span>
  );
}

/**
 * Who's in: the "I'm in" toggle (pressed while the viewer backs the idea),
 * the count, and every backer by name. A new backer grows into the list and
 * a leaving one folds away. A second press while any write runs is ignored;
 * a refusal names its cause under the toggle.
 */
export function IdeaBackers({ idea }: { idea: CulturalIdeaDTO }) {
  const { t } = useTranslation();
  const toggleBacking = useToggleCulturalIdeaBacking(idea.id);
  const isWriteInFlight = useIsCulturalWriteInFlight();
  const [refusal, setRefusal] = useState<unknown>(null);
  const headingId = `cultural-idea-${idea.id}-backers`;
  const refusalId = `${headingId}-refusal`;

  const toggle = () => {
    if (isWriteInFlight) return;
    setRefusal(null);
    toggleBacking.mutate(
      { isBacking: !idea.isBackedByMe },
      { onError: (cause) => setRefusal(cause) },
    );
  };

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <h3 id={headingId} className={styles.sectionTitle}>
          {t("admin:culturalProduction.ideas.drawer.backersHeading")}
        </h3>
        <Button
          variant={idea.isBackedByMe ? "soft" : "ghost"}
          size="sm"
          className={styles.phoneTarget}
          aria-pressed={idea.isBackedByMe}
          aria-disabled={isWriteInFlight || undefined}
          aria-describedby={refusal === null ? undefined : refusalId}
          onClick={toggle}
        >
          <FiThumbsUp aria-hidden />
          {t("admin:culturalProduction.ideas.drawer.backCta")}
        </Button>
      </div>
      <CulturalRefusalLine error={refusal} id={refusalId} />
      <p className={styles.count}>
        {t("admin:culturalProduction.ideas.card.backers", {
          count: idea.backerCount,
        })}
      </p>
      <ul className={styles.backerList}>
        <AnimatePresence initial={false}>
          {idea.backers.map((backer) => (
            <CollapseListItem key={backer.id}>
              <div className={styles.backer}>
                <IdeaStaffIdentity person={backer} />
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={idea.backers.length === 0}>
        <p className={styles.empty}>
          {t("admin:culturalProduction.ideas.drawer.backersNone")}
        </p>
      </Collapse>
    </section>
  );
}
