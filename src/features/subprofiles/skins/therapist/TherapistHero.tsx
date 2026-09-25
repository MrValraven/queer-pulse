import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ResolvedMentionText } from "../../../../shared/mentions/ResolvedMentionText";
import { useAuth } from "../../../../app/providers/authContext";
import { personaTitleName } from "../../subprofile-kinds";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import type { TherapistView } from "./therapistView";
import { renderEmphasis } from "./renderEmphasis";
import { TherapistChip } from "./TherapistChip";
import { RevealList } from "./TherapistReveal";
import { occurrenceKeys } from "./revealKeys";
import { TherapistHeroFacts, TherapistStatusPill } from "./TherapistHeroFacts";
import { TherapistHeroActions } from "./TherapistHeroActions";
import { TherapistHeroMedia } from "./TherapistHeroMedia";
import { TherapistEditLink } from "./TherapistEditLink";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { LIVED_OPTIONS, pickDisplayText } from "./therapistPickOptions";
import styles from "./TherapistHero.module.css";

/** The bio's first paragraph: the hero's stand-in when there is no quote. */
function firstParagraph(bio: string): string {
  return (
    bio
      .trim()
      .split(/\n\s*\n/)[0]
      ?.trim() ?? ""
  );
}

interface TherapistHeroProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  /** Id for the contact row, the skip link's target. */
  contactId: string;
  hasMobileBar: boolean;
}

/**
 * The therapist hero card: portrait (or big initials) on the left; status,
 * name, role, quote, lived experience, facts and the contact row on the
 * right. The owner sees the contact row as look-alikes, and every group
 * carries a small "Edit" link into the editor.
 */
export function TherapistHero({
  data,
  view,
  mode,
  onAction,
  contactId,
  hasMobileBar,
}: TherapistHeroProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const titleName = personaTitleName({
    displayName: data.displayName,
    kind: data.kind,
    ownerName: data.ownerName,
  });
  const bioLead = view.quote ? "" : firstParagraph(data.bio);
  const hasRoleLine = view.title !== "" || view.registration !== "";
  const livedKeys = occurrenceKeys(view.lived);

  return (
    <div className={styles.hero}>
      <TherapistHeroMedia data={data} view={view} />

      <div className={styles.body}>
        <div className={styles.badges}>
          <TherapistStatusPill view={view} />
          <TherapistEditLink target={THERAPIST_EDIT_TARGETS.status} />
        </div>

        <div className={styles.name}>
          <h1 className={styles.h1}>{titleName}</h1>
          {data.tagline && <p className={styles.tagline}>{data.tagline}</p>}
          <TherapistEditLink target={THERAPIST_EDIT_TARGETS.name} />
        </div>

        {hasRoleLine && (
          <p className={styles.role}>
            {view.title && (
              <span className={styles.roleItem}>{view.title}</span>
            )}
            {view.registration && (
              <span className={`${styles.roleItem} ${styles.registration}`}>
                <FiCheck aria-hidden className={styles.registrationIcon} />
                {view.registration}
              </span>
            )}
            <TherapistEditLink target={THERAPIST_EDIT_TARGETS.role} />
          </p>
        )}

        {view.quote ? (
          <p className={styles.quote}>
            {renderEmphasis(view.quote)}{" "}
            <TherapistEditLink
              target={THERAPIST_EDIT_TARGETS.quote}
              className={styles.inlineEdit}
            />
          </p>
        ) : (
          bioLead && (
            <p className={styles.quoteMuted}>
              <ResolvedMentionText
                text={bioLead}
                linkify={loggedIn && mode !== "preview"}
              />{" "}
              <TherapistEditLink
                target={THERAPIST_EDIT_TARGETS.bio}
                className={styles.inlineEdit}
              />
            </p>
          )
        )}

        {view.lived.length > 0 && (
          <div className={styles.lived}>
            <span className={styles.livedLabel}>
              {t("subprofiles:therapist.hero.lived", {
                name: view.firstName || data.displayName,
              })}
            </span>
            <RevealList>
              {view.lived.map((entry, index) => (
                <TherapistChip key={livedKeys[index]} tone="sm">
                  {pickDisplayText(LIVED_OPTIONS, entry, t)}
                </TherapistChip>
              ))}
            </RevealList>
            <TherapistEditLink target={THERAPIST_EDIT_TARGETS.lived} />
          </div>
        )}

        <TherapistHeroFacts view={view} />

        <TherapistHeroActions
          data={data}
          view={view}
          mode={mode}
          onAction={onAction}
          contactId={contactId}
          hasMobileBar={hasMobileBar}
        />
      </div>
    </div>
  );
}
