import { useId, useState } from "react";
import { FiLock } from "react-icons/fi";
import { Eyebrow, SegmentedControl } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringForm } from "../useGatheringForm";
import {
  PREVIEW_MODE_OPTIONS,
  type PreviewMode,
} from "./gatheringPreview.data";
import { GatheringPreviewCard } from "./GatheringPreviewCard";
import styles from "./GatheringPreviewPanel.module.css";

export interface GatheringPreviewPanelProps {
  form: GatheringForm;
  /**
   * `rail` (default): the sticky plum panel beside the chapters, with its
   * orbs, the eyebrow, the "On the board" / "Attendees see" toggle and the
   * address lock note.
   * `success`: the board card alone. The published screen is itself a plum
   * panel (ruling R9), so it supplies the ground the card sits on.
   */
  variant?: "rail" | "success";
}

function isPreviewMode(value: string): value is PreviewMode {
  return PREVIEW_MODE_OPTIONS.some((option) => option.mode === value);
}

/** "On the board" / "Attendees see": the shared segmented control, a
 *  two-button group with `aria-pressed`, restyled for the plum rail. */
function PreviewModeToggle({
  mode,
  onModeChange,
}: {
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
}) {
  const { t } = useTranslation();
  const segmentOptions = PREVIEW_MODE_OPTIONS.map((option) => {
    const ModeIcon = option.icon;
    return {
      value: option.mode,
      label: t(option.labelKey),
      icon: <ModeIcon />,
    };
  });
  return (
    <SegmentedControl
      className={styles.modeToggle}
      fullWidth
      label={t("gatherings:create.v2.preview.modeLabel")}
      options={segmentOptions}
      value={mode}
      onChange={(value) => {
        if (isPreviewMode(value)) onModeChange(value);
      }}
    />
  );
}

/**
 * The live preview of the gathering card: a plum panel holding the card as
 * the board will show it, filled in from the form as the host writes.
 */
export function GatheringPreviewPanel({
  form,
  variant = "rail",
}: GatheringPreviewPanelProps) {
  const { t } = useTranslation();
  const eyebrowId = useId();
  const [mode, setMode] = useState<PreviewMode>("board");
  if (variant === "success") {
    return <GatheringPreviewCard form={form} mode="board" />;
  }
  return (
    <section
      className={styles.panel}
      aria-labelledby={eyebrowId}
      data-variant={variant}
    >
      <Eyebrow id={eyebrowId} live className={styles.eyebrow}>
        {t("gatherings:create.v2.preview.eyebrow")}
      </Eyebrow>
      <PreviewModeToggle mode={mode} onModeChange={setMode} />
      <GatheringPreviewCard form={form} mode={mode} />
      <p className={styles.lockNote}>
        <FiLock aria-hidden />
        <span>
          <Translation
            i18nKey="gatherings:create.v2.preview.lockNote"
            components={{ b: <b /> }}
          />
        </span>
      </p>
    </section>
  );
}
