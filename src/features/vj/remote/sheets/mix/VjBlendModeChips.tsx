import { useId } from "react";
import {
  VJ_BLEND_MODES,
  type VjBlendMode,
} from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { VjOptionDescription } from "../../kit/VjHelpCaption";
import styles from "./VjMixSheet.module.css";

export interface VjBlendModeChipsProps {
  /** The shown mode: the stage's, or the one just picked while it travels. */
  blendMode: VjBlendMode;
  isBlocked: boolean;
  onPick: (blendMode: VjBlendMode) => void;
}

/**
 * How the mix clip lands over the live source: one chip per blend mode, the
 * shown one pressed, and one line under the chips saying what the pressed
 * mode does (the chips are too small for a line each). Picking the pressed
 * mode again sends nothing.
 */
export function VjBlendModeChips({
  blendMode,
  isBlocked,
  onPick,
}: VjBlendModeChipsProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.sectionTitle}>
        {t("vj:mix.blend")}
      </h3>
      <div
        className={styles.blendChips}
        role="group"
        aria-labelledby={titleId}
        data-vj-blend-modes=""
      >
        {VJ_BLEND_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className={styles.chip}
            aria-pressed={blendMode === mode}
            aria-disabled={isBlocked}
            aria-describedby={blendMode === mode ? descriptionId : undefined}
            onClick={() => {
              if (!isBlocked && blendMode !== mode) onPick(mode);
            }}
          >
            {t(`vj:mix.blend.${mode}`)}
          </button>
        ))}
      </div>
      <VjOptionDescription
        id={descriptionId}
        text={t(`vj:mix.blendDesc.${blendMode}`)}
      />
    </section>
  );
}
