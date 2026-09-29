import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { UNO_REVERSE_DEFAULTS } from "../../../stickers/templates/unoReverse.params";
import {
  UNO_REVERSE_TEMPLATE,
  type UnoReverseStyle,
} from "../../../stickers/templates/unoReverse.template";
import { StickerColorField } from "../StickerColorField";
import { StickerSliderField } from "../StickerSliderField";
import type { TemplateControlsProps } from "./builderTemplates";
import { LabelledSwitch } from "./DieCutSwitch";
import { ControlSection, StylePanel } from "./StylePanel";
import { useStylePanelState } from "./useStylePanelState";

/** The arrow size is stored as a fraction of the centre glyph and shown as a
 *  whole percent, which is what an admin reads a size as. */
const PERCENT = 100;

function toPercent(fraction: number): number {
  return Math.round(fraction * PERCENT);
}

/**
 * Uno reverse's style panel: the template's controls grouped by the part of
 * the sticker they change (card, oval, arrows). Fully controlled over one
 * `UnoReverseStyle`; the flag being previewed is owned elsewhere. The frame
 * colour is checked against the selected flags' stripes, the one contrast
 * warning only this template has.
 */
export function UnoReverseControls({
  style,
  onStyleChange,
  selectedItemIds,
  packStyle,
  onLoadPackStyle,
}: TemplateControlsProps) {
  const { t } = useTranslation();
  const unoStyle = style as UnoReverseStyle;
  const panelState = useStylePanelState<UnoReverseStyle>({
    style: unoStyle,
    defaultStyle: UNO_REVERSE_TEMPLATE.defaultStyle as UnoReverseStyle,
    onStyleChange,
  });
  const { setField } = panelState;

  return (
    <StylePanel
      style={style}
      isDefaultStyle={panelState.isDefaultStyle}
      onResetDefaults={panelState.resetToDefaults}
      packStyle={packStyle}
      onLoadPackStyle={onLoadPackStyle}
    >
      <ControlSection title={t("admin:stickerPacks.controls.sectionCard")}>
        <StickerColorField
          label={t("admin:stickerPacks.controls.frameColor")}
          value={unoStyle.frameColor}
          onChange={(color) => setField("frameColor", color)}
          contrastFlagIds={selectedItemIds}
          resetSignal={panelState.colorFieldResetSignal}
        />
        <StickerSliderField
          label={t("admin:stickerPacks.controls.borderWidth")}
          value={unoStyle.frameWidth}
          defaultValue={UNO_REVERSE_DEFAULTS.frameWidth}
          min={0}
          max={40}
          unit="px"
          onChange={(value) => setField("frameWidth", value)}
        />
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.controls.sectionOval")}>
        <StickerSliderField
          label={t("admin:stickerPacks.controls.ovalAngle")}
          value={unoStyle.ringAngleDeg}
          defaultValue={UNO_REVERSE_DEFAULTS.ringAngleDeg}
          min={-45}
          max={45}
          unit="°"
          onChange={(value) => setField("ringAngleDeg", value)}
        />
        <StickerSliderField
          label={t("admin:stickerPacks.controls.ovalLine")}
          value={unoStyle.ringStrokeWidth}
          defaultValue={UNO_REVERSE_DEFAULTS.ringStrokeWidth}
          min={4}
          max={32}
          unit="px"
          onChange={(value) => setField("ringStrokeWidth", value)}
        />
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.controls.sectionArrows")}>
        <LabelledSwitch
          label={t("admin:stickerPacks.controls.cornerArrows")}
          isOn={unoStyle.hasCornerArrows}
          onChange={(isOn) => setField("hasCornerArrows", isOn)}
        />
        {unoStyle.hasCornerArrows && (
          <StickerSliderField
            label={t("admin:stickerPacks.controls.arrowSize")}
            value={toPercent(unoStyle.cornerArrowScale)}
            defaultValue={toPercent(UNO_REVERSE_DEFAULTS.cornerArrowScale)}
            min={15}
            max={60}
            unit="%"
            onChange={(value) => setField("cornerArrowScale", value / PERCENT)}
          />
        )}
      </ControlSection>
    </StylePanel>
  );
}
