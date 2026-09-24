import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistChip, TherapistChipRow } from "./TherapistChip";
import {
  TherapistNote,
  TherapistSection,
  TherapistSubBlock,
} from "./TherapistSection";
import type { SpecialtyTone, TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { TherapistEditLink } from "./TherapistEditLink";
import {
  CONTEXT_OPTIONS,
  pickDisplayText,
  WHO_FOR_OPTIONS,
} from "./therapistPickOptions";
import styles from "./TherapistSections.module.css";

const BULLET_CLASS: Record<SpecialtyTone, string | undefined> = {
  accent: undefined,
  jade: styles.bulletJade,
  violet: styles.bulletViolet,
};

/** "What Sofia can help with": specialty groups (from the persona's
 *  `specialisms` items), who-for chips, and the contexts the therapist
 *  knows from the inside. `null` when none of the three is set. */
export function TherapistSpecialties({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  const hasContent =
    view.specialtyGroups.length > 0 ||
    view.whoFor.length > 0 ||
    view.contexts.length > 0;
  if (!hasContent) return null;
  // Who-for and contexts share a card in the editor's Approach chapter, the
  // one after the specialty groups: one link for them, on whichever shows
  // first.
  const audienceEditLink = (
    <TherapistEditLink
      target={THERAPIST_EDIT_TARGETS.whoFor}
      label={t("subprofiles:therapist.edit.whoFor")}
    />
  );

  return (
    <TherapistSection
      label={t("subprofiles:therapist.specialties.label", { name })}
      heading={t("subprofiles:therapist.specialties.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.specialties}
    >
      {view.specialtyGroups.length > 0 && (
        <div className={styles.groups}>
          {view.specialtyGroups.map((group, groupIndex) => (
            <div key={`${group.heading}-${groupIndex}`}>
              {group.heading !== "" && (
                <h3 className={styles.groupHeading}>{group.heading}</h3>
              )}
              <ul className={styles.groupList}>
                {group.bullets.map((bullet, bulletIndex) => (
                  <li
                    key={`${bullet}-${bulletIndex}`}
                    className={styles.groupItem}
                  >
                    <span
                      className={[styles.bullet, BULLET_CLASS[group.tone]]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {view.whoFor.length > 0 && (
        <TherapistChipRow>
          {view.whoFor.map((audience, audienceIndex) => (
            <TherapistChip
              key={`${audience}-${audienceIndex}`}
              tone="hi"
              hasCheck
            >
              {pickDisplayText(WHO_FOR_OPTIONS, audience, t)}
            </TherapistChip>
          ))}
          {audienceEditLink}
        </TherapistChipRow>
      )}

      {view.contexts.length > 0 && (
        <TherapistSubBlock
          label={t("subprofiles:therapist.specialties.contextsLabel")}
        >
          <TherapistChipRow>
            {view.contexts.map((context, contextIndex) => (
              <TherapistChip key={`${context}-${contextIndex}`}>
                {pickDisplayText(CONTEXT_OPTIONS, context, t)}
              </TherapistChip>
            ))}
            {view.whoFor.length === 0 && audienceEditLink}
          </TherapistChipRow>
          <TherapistNote>
            {t("subprofiles:therapist.specialties.contextsNote", { name })}
          </TherapistNote>
        </TherapistSubBlock>
      )}
    </TherapistSection>
  );
}
