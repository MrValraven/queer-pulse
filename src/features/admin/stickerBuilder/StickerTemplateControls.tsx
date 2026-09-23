import { Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  UNO_REVERSE_FLAG_IDS,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import styles from "./stickerBuilder.module.css";

/**
 * A controlled panel over one `UnoReverseParams` object plus the flag ids
 * currently checked for publish. Every control is native, so `FormField`
 * wires up its own `<label htmlFor>` without extra markup here.
 */
export function StickerTemplateControls({
  params,
  onParamsChange,
  selectedFlagIds,
  onSelectedFlagIdsChange,
}: {
  params: UnoReverseParams;
  onParamsChange: (params: UnoReverseParams) => void;
  selectedFlagIds: string[];
  onSelectedFlagIdsChange: (flagIds: string[]) => void;
}) {
  const { t } = useTranslation();

  function setParam<Key extends keyof UnoReverseParams>(
    key: Key,
    value: UnoReverseParams[Key],
  ) {
    onParamsChange({ ...params, [key]: value });
  }

  function toggleFlag(flagId: string, isChecked: boolean) {
    onSelectedFlagIdsChange(
      isChecked
        ? [...selectedFlagIds, flagId]
        : selectedFlagIds.filter((id) => id !== flagId),
    );
  }

  return (
    <div className={styles.controlsPanel}>
      <fieldset className={styles.flagFieldset}>
        <legend className={styles.flagLegend}>
          {t("admin:stickerPacks.controls.flagsLegend")}
        </legend>
        <div className={styles.flagActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectedFlagIdsChange([...UNO_REVERSE_FLAG_IDS])}
          >
            {t("admin:stickerPacks.controls.selectAll")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectedFlagIdsChange([])}
          >
            {t("admin:stickerPacks.controls.clear")}
          </Button>
        </div>
        <div className={styles.flagGrid}>
          {UNO_REVERSE_FLAG_IDS.map((flagId) => {
            const checkboxId = `sticker-template-flag-${flagId}`;
            return (
              <label
                key={flagId}
                className={styles.flagOption}
                htmlFor={checkboxId}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={selectedFlagIds.includes(flagId)}
                  onChange={(event) => toggleFlag(flagId, event.target.checked)}
                />
                {t(`cards:flag.${flagId}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <FormField label={t("admin:stickerPacks.controls.frameColor")}>
        <input
          type="color"
          value={params.frameColor}
          onChange={(event) => setParam("frameColor", event.target.value)}
        />
      </FormField>

      <FormField
        label={t("admin:stickerPacks.controls.frameWidth")}
        labelAside={String(params.frameWidth)}
      >
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={params.frameWidth}
          onChange={(event) =>
            setParam("frameWidth", Number(event.target.value))
          }
        />
      </FormField>

      <FormField
        label={t("admin:stickerPacks.controls.ringAngle")}
        labelAside={String(params.ringAngleDeg)}
      >
        <input
          type="range"
          min={-45}
          max={45}
          step={1}
          value={params.ringAngleDeg}
          onChange={(event) =>
            setParam("ringAngleDeg", Number(event.target.value))
          }
        />
      </FormField>

      <FormField
        label={t("admin:stickerPacks.controls.ringStroke")}
        labelAside={String(params.ringStrokeWidth)}
      >
        <input
          type="range"
          min={4}
          max={32}
          step={1}
          value={params.ringStrokeWidth}
          onChange={(event) =>
            setParam("ringStrokeWidth", Number(event.target.value))
          }
        />
      </FormField>

      <FormField label={t("admin:stickerPacks.controls.cornerArrows")}>
        <input
          type="checkbox"
          checked={params.hasCornerArrows}
          onChange={(event) =>
            setParam("hasCornerArrows", event.target.checked)
          }
        />
      </FormField>

      <FormField
        label={t("admin:stickerPacks.controls.cornerArrowScale")}
        labelAside={params.cornerArrowScale.toFixed(2)}
      >
        <input
          type="range"
          min={0.15}
          max={0.6}
          step={0.01}
          value={params.cornerArrowScale}
          disabled={!params.hasCornerArrows}
          onChange={(event) =>
            setParam("cornerArrowScale", Number(event.target.value))
          }
        />
      </FormField>
    </div>
  );
}
