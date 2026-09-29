import { useId, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  BLIP_DEFAULTS,
  type BlipStyle,
} from "../../../stickers/templates/blip/blip.params";
import { UNO_REVERSE_FLAG_IDS } from "../../../stickers/templates/unoReverse.params";
import { StickerColorField } from "../StickerColorField";
import type { TemplateControlsProps } from "./builderTemplates";
import { isBlipFaceHardToRead } from "./blipContrast";
import { DieCutSwitch } from "./DieCutSwitch";
import { ControlSection, StylePanel } from "./StylePanel";
import { NO_CONTRAST_FLAG_IDS, useStylePanelState } from "./useStylePanelState";
import styles from "./BlipControls.module.css";

type BodyFill = "color" | "flag";

const BODY_FILL_OPTIONS: ReadonlyArray<{ fill: BodyFill; labelKey: string }> = [
  { fill: "color", labelKey: "admin:stickerPacks.blip.fillColor" },
  { fill: "flag", labelKey: "admin:stickerPacks.blip.fillFlag" },
];

/** The flag a body switches to when the admin first picks Flag. */
const FIRST_FLAG_ID = UNO_REVERSE_FLAG_IDS[0] ?? "rainbow";

/**
 * Blip's style panel: the body fill (a solid colour or any pride flag) and
 * the die-cut border. A solid body too dark for Blip's ink face gets an
 * inline warning, since the face would vanish on the published sticker.
 */
export function BlipControls({
  style,
  onStyleChange,
  packStyle,
  onLoadPackStyle,
}: TemplateControlsProps) {
  const blipStyle = style as BlipStyle;
  const panelState = useStylePanelState<BlipStyle>({
    style: blipStyle,
    defaultStyle: BLIP_DEFAULTS,
    onStyleChange,
  });
  const { t } = useTranslation();
  const { setField } = panelState;

  return (
    <StylePanel
      style={style}
      isDefaultStyle={panelState.isDefaultStyle}
      onResetDefaults={panelState.resetToDefaults}
      packStyle={packStyle}
      onLoadPackStyle={onLoadPackStyle}
    >
      <ControlSection title={t("admin:stickerPacks.blip.sectionBody")}>
        <BlipBodyFill
          blipStyle={blipStyle}
          onStyleChange={panelState.emitStyle}
          colorFieldResetSignal={panelState.colorFieldResetSignal}
        />
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.dieCut.section")}>
        <DieCutSwitch
          hasDieCut={blipStyle.hasDieCut}
          onChange={(hasDieCut) => setField("hasDieCut", hasDieCut)}
        />
      </ControlSection>
    </StylePanel>
  );
}

/**
 * The Colour / Flag choice as a segmented radio group, then the control for
 * the chosen fill. Native radios on purpose: arrow keys move between the two
 * options and the group reads as one choice, with no roving tabindex to keep
 * by hand. The last flag picked is remembered, so flipping to Colour and back
 * lands on the same flag.
 */
function BlipBodyFill({
  blipStyle,
  onStyleChange,
  colorFieldResetSignal,
}: {
  blipStyle: BlipStyle;
  onStyleChange: (style: BlipStyle) => void;
  colorFieldResetSignal: number;
}) {
  const { t } = useTranslation();
  const groupName = useId();
  const flagSelectId = useId();
  const [lastFlagId, setLastFlagId] = useState(
    blipStyle.bodyFlagId ?? FIRST_FLAG_ID,
  );
  // A flag body arriving from outside (the pack's style) becomes the one to
  // return to. Adjusted during render, like the panel's own resync.
  if (blipStyle.bodyFlagId !== null && blipStyle.bodyFlagId !== lastFlagId) {
    setLastFlagId(blipStyle.bodyFlagId);
  }
  const bodyFill: BodyFill = blipStyle.bodyFlagId === null ? "color" : "flag";
  const isFaceHardToRead =
    bodyFill === "color" && isBlipFaceHardToRead(blipStyle.bodyColor);

  function chooseFill(fill: BodyFill) {
    onStyleChange({
      ...blipStyle,
      bodyFlagId: fill === "flag" ? lastFlagId : null,
    });
  }

  function chooseFlag(flagId: string) {
    setLastFlagId(flagId);
    onStyleChange({ ...blipStyle, bodyFlagId: flagId });
  }

  return (
    <>
      <fieldset className={styles.fill}>
        <legend className={styles.legend}>
          {t("admin:stickerPacks.blip.fillLegend")}
        </legend>
        <div className={styles.segments}>
          {BODY_FILL_OPTIONS.map((option) => (
            <label key={option.fill} className={styles.segment}>
              <input
                type="radio"
                className={styles.input}
                name={groupName}
                value={option.fill}
                checked={bodyFill === option.fill}
                onChange={() => chooseFill(option.fill)}
              />
              <span className={styles.pill}>{t(option.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {bodyFill === "color" ? (
        <StickerColorField
          label={t("admin:stickerPacks.blip.bodyColor")}
          value={blipStyle.bodyColor}
          onChange={(color) =>
            onStyleChange({ ...blipStyle, bodyColor: color })
          }
          contrastFlagIds={NO_CONTRAST_FLAG_IDS}
          resetSignal={colorFieldResetSignal}
        />
      ) : (
        <div className={styles.selectField}>
          <label className={styles.selectLabel} htmlFor={flagSelectId}>
            {t("admin:stickerPacks.blip.bodyFlag")}
          </label>
          <select
            id={flagSelectId}
            className={styles.select}
            value={blipStyle.bodyFlagId ?? FIRST_FLAG_ID}
            onChange={(event) => chooseFlag(event.target.value)}
          >
            {UNO_REVERSE_FLAG_IDS.map((flagId) => (
              <option key={flagId} value={flagId}>
                {t(`cards:flag.${flagId}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* The live region stays mounted so a warning that appears mid-drag
          is announced; only its content comes and goes. */}
      <div role="status" className={styles.warningRegion}>
        {isFaceHardToRead && (
          <p className={styles.warning}>
            <FiAlertTriangle className={styles.warningIcon} aria-hidden />
            <span>{t("admin:stickerPacks.blip.faceContrastWarning")}</span>
          </p>
        )}
      </div>
    </>
  );
}
