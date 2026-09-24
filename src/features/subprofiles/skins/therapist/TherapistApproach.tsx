import { FiX } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistChip, TherapistChipRow } from "./TherapistChip";
import {
  TherapistNote,
  TherapistSection,
  TherapistSubBlock,
} from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import {
  MODALITY_OPTIONS,
  pickDisplayText,
  WORKING_STYLE_OPTIONS,
} from "./therapistPickOptions";
import styles from "./TherapistSections.module.css";

/** "How Sofia works": approach paragraphs and modality chips, then the
 *  therapist's own working style, who it is probably not for, and what
 *  they don't do. Empty sub-blocks are skipped; `null` with nothing at all. */
export function TherapistApproach({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const name = view.firstName;
  const hasContent =
    view.approach.length > 0 ||
    view.modalities.length > 0 ||
    view.workingStyle.length > 0 ||
    view.notFor.length > 0 ||
    view.boundaries.length > 0;
  if (!hasContent) return null;

  return (
    <TherapistSection
      label={t("subprofiles:therapist.approach.label", { name })}
      heading={t("subprofiles:therapist.approach.heading")}
      editTarget={THERAPIST_EDIT_TARGETS.approach}
    >
      {view.approach.map((paragraph, paragraphIndex) => (
        <p key={`${paragraph}-${paragraphIndex}`} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
      {view.modalities.length > 0 && (
        <TherapistChipRow>
          {view.modalities.map((modality, modalityIndex) => (
            <TherapistChip key={`${modality}-${modalityIndex}`}>
              {pickDisplayText(MODALITY_OPTIONS, modality, t)}
            </TherapistChip>
          ))}
        </TherapistChipRow>
      )}

      {view.workingStyle.length > 0 && (
        <TherapistSubBlock
          label={t("subprofiles:therapist.approach.styleLabel", { name })}
        >
          <TherapistChipRow>
            {view.workingStyle.map((style, styleIndex) => (
              <TherapistChip key={`${style}-${styleIndex}`} tone="hi" hasCheck>
                {pickDisplayText(WORKING_STYLE_OPTIONS, style, t)}
              </TherapistChip>
            ))}
          </TherapistChipRow>
        </TherapistSubBlock>
      )}

      {view.notFor.length > 0 && (
        <TherapistSubBlock
          label={t("subprofiles:therapist.approach.notForLabel")}
        >
          <ul className={styles.notForList}>
            {view.notFor.map((reason, reasonIndex) => (
              <li
                key={`${reason}-${reasonIndex}`}
                className={styles.notForItem}
              >
                <FiX className={styles.notForIcon} aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <TherapistNote>
            {t("subprofiles:therapist.approach.notForNote", { name })}
          </TherapistNote>
        </TherapistSubBlock>
      )}

      {view.boundaries.length > 0 && (
        <TherapistSubBlock
          label={t("subprofiles:therapist.approach.boundariesLabel", { name })}
        >
          <TherapistChipRow>
            {view.boundaries.map((boundary, boundaryIndex) => (
              <TherapistChip key={`${boundary}-${boundaryIndex}`}>
                {boundary}
              </TherapistChip>
            ))}
          </TherapistChipRow>
        </TherapistSubBlock>
      )}
    </TherapistSection>
  );
}
