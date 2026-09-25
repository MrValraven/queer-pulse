import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MarkdownLite } from "../../../../shared/markdown";
import { TherapistChip, TherapistChipRow } from "./TherapistChip";
import {
  TherapistNote,
  TherapistSection,
  TherapistSubBlock,
} from "./TherapistSection";
import { RevealBlock, RevealList, RevealListItem } from "./TherapistReveal";
import { occurrenceKeys } from "./revealKeys";
import { useStableRowKeys } from "./useStableRowKeys";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import {
  MODALITY_OPTIONS,
  pickDisplayText,
  WORKING_STYLE_OPTIONS,
} from "./therapistPickOptions";
import styles from "./TherapistSections.module.css";

/** The reading column's gap (`.main` in TherapistBody.module.css). */
const COLUMN_GAP = 16;
/** `.notForList`'s gap in TherapistSections.module.css. */
const NOT_FOR_GAP = 8;

/** "How Sofia works": the approach and modality chips, then the therapist's
 *  own working style, who it is probably not for, and what they don't do.
 *  The approach is markdown-lite prose (one `skinData.approach` entry per
 *  block, joined on blank lines) rendered through the shared MarkdownLite, so
 *  bold, italic, lists, quotes, headings and links show as written. An edit
 *  grows a block in or folds it away (the whole section too), and chips and
 *  reasons animate one by one; the first render shows as is. */
export function TherapistApproach({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  const hasContent =
    view.approach.length > 0 ||
    view.modalities.length > 0 ||
    view.workingStyle.length > 0 ||
    view.notFor.length > 0 ||
    view.boundaries.length > 0;
  const modalityKeys = occurrenceKeys(view.modalities);
  const styleKeys = occurrenceKeys(view.workingStyle);
  // Reasons and boundaries are typed line by line, so a row keeps its key
  // while the owner edits it.
  const reasonKeys = useStableRowKeys(view.notFor);
  const boundaryKeys = useStableRowKeys(view.boundaries);

  return (
    <RevealBlock isShown={hasContent} parentGap={COLUMN_GAP}>
      <TherapistSection
        label={t("subprofiles:therapist.approach.label", { name })}
        heading={t("subprofiles:therapist.approach.heading")}
        editTarget={THERAPIST_EDIT_TARGETS.approach}
      >
        <RevealBlock isShown={view.approach.length > 0}>
          <div className={styles.approachBody}>
            <MarkdownLite text={view.approach.join("\n\n")} />
          </div>
        </RevealBlock>
        <RevealBlock isShown={view.modalities.length > 0}>
          <TherapistChipRow>
            {view.modalities.map((modality, modalityIndex) => (
              <TherapistChip key={modalityKeys[modalityIndex]}>
                {pickDisplayText(MODALITY_OPTIONS, modality, t)}
              </TherapistChip>
            ))}
          </TherapistChipRow>
        </RevealBlock>

        <RevealBlock isShown={view.workingStyle.length > 0}>
          <TherapistSubBlock
            label={t("subprofiles:therapist.approach.styleLabel", { name })}
          >
            <TherapistChipRow>
              {view.workingStyle.map((style, styleIndex) => (
                <TherapistChip key={styleKeys[styleIndex]} tone="hi" hasCheck>
                  {pickDisplayText(WORKING_STYLE_OPTIONS, style, t)}
                </TherapistChip>
              ))}
            </TherapistChipRow>
          </TherapistSubBlock>
        </RevealBlock>

        <RevealBlock isShown={view.notFor.length > 0}>
          <TherapistSubBlock
            label={t("subprofiles:therapist.approach.notForLabel")}
          >
            <ul className={styles.notForList}>
              <RevealList>
                {view.notFor.map((reason, reasonIndex) => (
                  <RevealListItem
                    key={reasonKeys[reasonIndex]}
                    className={styles.notForItem}
                    parentGap={NOT_FOR_GAP}
                  >
                    <FiX className={styles.notForIcon} aria-hidden="true" />
                    <span>{reason}</span>
                  </RevealListItem>
                ))}
              </RevealList>
            </ul>
            <TherapistNote>
              {t("subprofiles:therapist.approach.notForNote", { name })}
            </TherapistNote>
          </TherapistSubBlock>
        </RevealBlock>

        <RevealBlock isShown={view.boundaries.length > 0}>
          <TherapistSubBlock
            label={t("subprofiles:therapist.approach.boundariesLabel", {
              name,
            })}
          >
            <TherapistChipRow>
              {view.boundaries.map((boundary, boundaryIndex) => (
                <TherapistChip key={boundaryKeys[boundaryIndex]}>
                  {boundary}
                </TherapistChip>
              ))}
            </TherapistChipRow>
          </TherapistSubBlock>
        </RevealBlock>
      </TherapistSection>
    </RevealBlock>
  );
}
