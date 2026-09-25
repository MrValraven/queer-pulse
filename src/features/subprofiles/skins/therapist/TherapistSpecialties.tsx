import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistChip, TherapistChipRow } from "./TherapistChip";
import {
  TherapistNote,
  TherapistSection,
  TherapistSubBlock,
} from "./TherapistSection";
import type {
  SpecialtyTone,
  TherapistSpecialtyGroup,
  TherapistView,
} from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { TherapistEditLink } from "./TherapistEditLink";
import { RevealBlock, RevealList, RevealListItem } from "./TherapistReveal";
import { occurrenceKeys } from "./revealKeys";
import { useStableRowKeys } from "./useStableRowKeys";
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

/** The reading column's gap (`.main` in TherapistBody.module.css). */
const COLUMN_GAP = 16;
/** `.groupList`'s gap in TherapistSections.module.css. */
const BULLET_GAP = 6;

/** "What Sofia can help with": specialty groups (from the persona's
 *  `specialisms` items), who-for chips, and the contexts the therapist
 *  knows from the inside. An edit grows a block in or folds it away (the
 *  whole section too, once none of the three is set), and bullets and chips
 *  animate one by one. The groups sit in a multi-column grid, where a cell
 *  cannot glide, so a whole group appears and goes as is. */
export function TherapistSpecialties({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  const hasContent =
    view.specialtyGroups.length > 0 ||
    view.whoFor.length > 0 ||
    view.contexts.length > 0;
  // Headings and bullets are typed live, so a cell or bullet keeps its key
  // while the owner edits it.
  const groupKeys = useStableRowKeys(
    view.specialtyGroups.map((group) => group.heading),
  );
  const audienceKeys = occurrenceKeys(view.whoFor);
  const contextKeys = occurrenceKeys(view.contexts);
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
    <RevealBlock isShown={hasContent} parentGap={COLUMN_GAP}>
      <TherapistSection
        label={t("subprofiles:therapist.specialties.label", { name })}
        heading={t("subprofiles:therapist.specialties.heading")}
        editTarget={THERAPIST_EDIT_TARGETS.specialties}
      >
        <RevealBlock isShown={view.specialtyGroups.length > 0}>
          <div className={styles.groups}>
            {view.specialtyGroups.map((group, groupIndex) => (
              <SpecialtyGroup key={groupKeys[groupIndex]} group={group} />
            ))}
          </div>
        </RevealBlock>

        <RevealBlock isShown={view.whoFor.length > 0}>
          <TherapistChipRow>
            {view.whoFor.map((audience, audienceIndex) => (
              <TherapistChip
                key={audienceKeys[audienceIndex]}
                tone="hi"
                hasCheck
              >
                {pickDisplayText(WHO_FOR_OPTIONS, audience, t)}
              </TherapistChip>
            ))}
            {audienceEditLink}
          </TherapistChipRow>
        </RevealBlock>

        <RevealBlock isShown={view.contexts.length > 0}>
          <TherapistSubBlock
            label={t("subprofiles:therapist.specialties.contextsLabel")}
          >
            <TherapistChipRow>
              {view.contexts.map((context, contextIndex) => (
                <TherapistChip key={contextKeys[contextIndex]}>
                  {pickDisplayText(CONTEXT_OPTIONS, context, t)}
                </TherapistChip>
              ))}
              {view.whoFor.length === 0 && audienceEditLink}
            </TherapistChipRow>
            <TherapistNote>
              {t("subprofiles:therapist.specialties.contextsNote", { name })}
            </TherapistNote>
          </TherapistSubBlock>
        </RevealBlock>
      </TherapistSection>
    </RevealBlock>
  );
}

/** One grid cell: the group's heading over its bullets. A bullet an edit
 *  adds grows in and a removed one folds away. */
function SpecialtyGroup({ group }: { group: TherapistSpecialtyGroup }) {
  const bulletKeys = useStableRowKeys(group.bullets);
  const bulletClassName = [styles.bullet, BULLET_CLASS[group.tone]]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      {group.heading !== "" && (
        <h3 className={styles.groupHeading}>{group.heading}</h3>
      )}
      <ul className={styles.groupList}>
        <RevealList>
          {group.bullets.map((bullet, bulletIndex) => (
            <RevealListItem
              key={bulletKeys[bulletIndex]}
              className={styles.groupItem}
              parentGap={BULLET_GAP}
            >
              <span className={bulletClassName} aria-hidden="true" />
              <span>{bullet}</span>
            </RevealListItem>
          ))}
        </RevealList>
      </ul>
    </div>
  );
}
