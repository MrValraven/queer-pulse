import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  TEA_DEFAULTS,
  type TeaStyle,
} from "../../../stickers/templates/tea/tea.params";
import { StickerColorField } from "../StickerColorField";
import type { TemplateControlsProps } from "./builderTemplates";
import { DieCutSwitch } from "./DieCutSwitch";
import { ControlSection, StylePanel } from "./StylePanel";
import { NO_CONTRAST_FLAG_IDS, useStylePanelState } from "./useStylePanelState";
import styles from "./TeaControls.module.css";

/**
 * Tea's style panel: the one accent colour every sticker in the set shares
 * (cup band, sunglasses, nails, lips and the rest), and the die-cut border.
 * The fixed tea, gold and night palette is not tunable.
 */
export function TeaControls({
  style,
  onStyleChange,
  packStyle,
  onLoadPackStyle,
}: TemplateControlsProps) {
  const { t } = useTranslation();
  const teaStyle = style as TeaStyle;
  const panelState = useStylePanelState<TeaStyle>({
    style: teaStyle,
    defaultStyle: TEA_DEFAULTS,
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
      <ControlSection title={t("admin:stickerPacks.tea.sectionAccent")}>
        <div className={styles.accentField}>
          <StickerColorField
            label={t("admin:stickerPacks.tea.accentColor")}
            value={teaStyle.accentColor}
            onChange={(color) => setField("accentColor", color)}
            contrastFlagIds={NO_CONTRAST_FLAG_IDS}
            resetSignal={panelState.colorFieldResetSignal}
          />
        </div>
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.dieCut.section")}>
        <DieCutSwitch
          hasDieCut={teaStyle.hasDieCut}
          onChange={(hasDieCut) => setField("hasDieCut", hasDieCut)}
        />
      </ControlSection>
    </StylePanel>
  );
}
