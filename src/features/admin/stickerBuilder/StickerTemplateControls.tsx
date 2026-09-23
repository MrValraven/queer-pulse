import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FiCheck, FiDownload, FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { drawStickerOnCanvas } from "../../stickers/render/renderStickerBlob";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import {
  UNO_REVERSE_DEFAULTS,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import { AdminToggle } from "../ui";
import { StickerColorField } from "./StickerColorField";
import { StickerSliderField } from "./StickerSliderField";
import styles from "./StickerTemplateControls.module.css";

type TemplateStyle = Omit<UnoReverseParams, "flagId">;

/** Backing-store size of the template thumbnail: 2x its 32px CSS size, so
 *  it stays crisp on a high-density screen. */
const THUMBNAIL_BACKING_SIZE = 64;

/** The arrow size is stored as a fraction of the centre glyph and shown as a
 *  whole percent, which is what an admin reads a size as. */
const PERCENT = 100;

function toPercent(fraction: number): number {
  return Math.round(fraction * PERCENT);
}

/** Whether every style field of `params` equals the one in `style`. */
function hasSameStyle(params: UnoReverseParams, style: TemplateStyle): boolean {
  return (
    params.frameColor.toLowerCase() === style.frameColor.toLowerCase() &&
    params.frameWidth === style.frameWidth &&
    params.ringAngleDeg === style.ringAngleDeg &&
    params.ringStrokeWidth === style.ringStrokeWidth &&
    params.hasCornerArrows === style.hasCornerArrows &&
    params.cornerArrowScale === style.cornerArrowScale
  );
}

/**
 * The builder's style panel: a header naming the template, then the template's
 * controls grouped by the part of the sticker they change (card, oval,
 * arrows). Fully controlled over one `UnoReverseParams`; the flag being
 * previewed is owned elsewhere, so every reset here keeps `params.flagId`.
 */
export function StickerTemplateControls({
  params,
  onParamsChange,
  contrastFlagIds,
  packStyle,
  onLoadPackStyle,
}: {
  params: UnoReverseParams;
  onParamsChange: (params: UnoReverseParams) => void;
  /** The flags whose stripes the frame colour is checked against (the selected ones). */
  contrastFlagIds: string[];
  /** The selected pack's stored style, or null when there is none to load. */
  packStyle: Omit<UnoReverseParams, "flagId"> | null;
  onLoadPackStyle: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const cornerArrowsSwitchId = useId();
  // Handed to the colour field as `resetSignal`, so it can clear a stale hex
  // draft even when a reset lands on the value the draft was already showing
  // (params.frameColor does not change, so the field's own value-resync never
  // fires). Bumped on Template defaults, and on every params object this
  // panel did not hand up itself (Use this pack's style, or the pack's style
  // loading on a pack switch), since any of those can land on the same hex.
  const [colorFieldResetSignal, setColorFieldResetSignal] = useState(0);
  // The params object this panel last handed up. Adjusted during render: a
  // different one arriving means the change came from outside.
  const [ownParams, setOwnParams] = useState(params);
  if (params !== ownParams) {
    setOwnParams(params);
    setColorFieldResetSignal((current) => current + 1);
  }

  function emitParams(nextParams: UnoReverseParams) {
    setOwnParams(nextParams);
    onParamsChange(nextParams);
  }

  function setParam<Key extends keyof UnoReverseParams>(
    key: Key,
    value: UnoReverseParams[Key],
  ) {
    emitParams({ ...params, [key]: value });
  }

  const isDefaultStyle = hasSameStyle(params, UNO_REVERSE_DEFAULTS);

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 id={headingId} className={styles.heading}>
            {t("admin:stickerPacks.controls.heading")}
          </h3>
          <StickerTemplateBadge />
        </div>
      </div>

      <div className={styles.styleActions}>
        {/* aria-disabled keeps focus on the button once the reset lands;
            a real `disabled` would drop a keyboard user to the page. */}
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={isDefaultStyle || undefined}
          onClick={() => {
            if (isDefaultStyle) return;
            setColorFieldResetSignal((current) => current + 1);
            emitParams({ ...UNO_REVERSE_DEFAULTS, flagId: params.flagId });
          }}
        >
          <FiRotateCcw aria-hidden />
          {t("admin:stickerPacks.controls.templateDefaults")}
        </Button>

        {packStyle !== null && (
          <PackStyleButton
            isApplied={hasSameStyle(params, packStyle)}
            onLoad={onLoadPackStyle}
          />
        )}
      </div>

      <ControlSection title={t("admin:stickerPacks.controls.sectionCard")}>
        <StickerColorField
          label={t("admin:stickerPacks.controls.frameColor")}
          value={params.frameColor}
          onChange={(color) => setParam("frameColor", color)}
          contrastFlagIds={contrastFlagIds}
          resetSignal={colorFieldResetSignal}
        />
        <StickerSliderField
          label={t("admin:stickerPacks.controls.borderWidth")}
          value={params.frameWidth}
          defaultValue={UNO_REVERSE_DEFAULTS.frameWidth}
          min={0}
          max={40}
          unit="px"
          onChange={(value) => setParam("frameWidth", value)}
        />
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.controls.sectionOval")}>
        <StickerSliderField
          label={t("admin:stickerPacks.controls.ovalAngle")}
          value={params.ringAngleDeg}
          defaultValue={UNO_REVERSE_DEFAULTS.ringAngleDeg}
          min={-45}
          max={45}
          unit="°"
          onChange={(value) => setParam("ringAngleDeg", value)}
        />
        <StickerSliderField
          label={t("admin:stickerPacks.controls.ovalLine")}
          value={params.ringStrokeWidth}
          defaultValue={UNO_REVERSE_DEFAULTS.ringStrokeWidth}
          min={4}
          max={32}
          unit="px"
          onChange={(value) => setParam("ringStrokeWidth", value)}
        />
      </ControlSection>

      <ControlSection title={t("admin:stickerPacks.controls.sectionArrows")}>
        {/* A <label> names the switch and toggles it on click (a button is a
            labelable element), so the whole row is the target. */}
        <div className={styles.switchRow}>
          <label className={styles.switchLabel} htmlFor={cornerArrowsSwitchId}>
            {t("admin:stickerPacks.controls.cornerArrows")}
          </label>
          <AdminToggle
            id={cornerArrowsSwitchId}
            checked={params.hasCornerArrows}
            onChange={(isOn) => setParam("hasCornerArrows", isOn)}
          />
        </div>
        {params.hasCornerArrows && (
          <StickerSliderField
            label={t("admin:stickerPacks.controls.arrowSize")}
            value={toPercent(params.cornerArrowScale)}
            defaultValue={toPercent(UNO_REVERSE_DEFAULTS.cornerArrowScale)}
            min={15}
            max={60}
            unit="%"
            onChange={(value) => setParam("cornerArrowScale", value / PERCENT)}
          />
        )}
      </ControlSection>
    </section>
  );
}

/** A titled group of controls; the title names the group for assistive tech. */
function ControlSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <div className={styles.section} role="group" aria-labelledby={titleId}>
      <h4 id={titleId} className={styles.sectionTitle}>
        {title}
      </h4>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

/**
 * The one template there is, named beside the panel heading as a static line
 * (there is nothing else to pick, so nothing here looks selectable). The
 * thumbnail is the rainbow sticker at the template defaults, drawn once
 * through the same geometry and canvas routine the export uses; the
 * description rides the tooltip.
 */
function StickerTemplateBadge() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      drawStickerOnCanvas(
        canvas,
        unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId: "rainbow" }),
        THUMBNAIL_BACKING_SIZE,
      );
    } catch {
      // No 2D context (a test DOM, a locked-down browser): the thumbnail is
      // decoration, so the line simply shows its empty tile.
    }
  }, []);

  return (
    <p
      className={styles.template}
      title={t("admin:stickerPacks.controls.templateDescription")}
    >
      <canvas ref={canvasRef} className={styles.templateThumb} aria-hidden />
      <span className={styles.templateName}>
        {t("admin:stickerPacks.controls.templateName")}
      </span>
    </p>
  );
}

function PackStyleButton({
  isApplied,
  onLoad,
}: {
  isApplied: boolean;
  onLoad: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-disabled={isApplied || undefined}
      onClick={() => {
        if (!isApplied) onLoad();
      }}
    >
      {isApplied ? <FiCheck aria-hidden /> : <FiDownload aria-hidden />}
      {isApplied
        ? t("admin:stickerPacks.controls.packStyleApplied")
        : t("admin:stickerPacks.controls.usePackStyle")}
    </Button>
  );
}
