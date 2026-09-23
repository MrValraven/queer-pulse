import { useEffect, useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { drawStickerOnCanvas } from "../../stickers/render/renderStickerBlob";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import type { UnoReverseParams } from "../../stickers/templates/unoReverse.params";
import styles from "./stickerBuilder.module.css";

/** Backing-store size for every preview canvas, matching the sticker's true
 *  export size so the preview is drawn from the same geometry that ships. The
 *  canvas is then sized down to a small tile in CSS. */
const PREVIEW_SIZE = 512;

/**
 * One live preview canvas per selected flag, redrawn whenever the shared
 * template params change. A canvas paints pixels only, so each tile carries
 * `role="img"` and an `aria-label` naming its flag for assistive tech.
 */
export function StickerPreviewGrid({
  selectedFlagIds,
  params,
}: {
  selectedFlagIds: string[];
  params: UnoReverseParams;
}) {
  const { t } = useTranslation();

  if (selectedFlagIds.length === 0) {
    return (
      <p className={styles.previewEmpty}>
        {t("admin:stickerPacks.preview.empty")}
      </p>
    );
  }

  return (
    <div className={styles.previewGrid}>
      {selectedFlagIds.map((flagId) => (
        <StickerPreviewTile
          key={flagId}
          flagId={flagId}
          params={params}
          flagLabel={t(`cards:flag.${flagId}`)}
        />
      ))}
    </div>
  );
}

function StickerPreviewTile({
  flagId,
  params,
  flagLabel,
}: {
  flagId: string;
  params: UnoReverseParams;
  flagLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const primitives = unoReverseGeometry({ ...params, flagId });
    drawStickerOnCanvas(canvas, primitives, PREVIEW_SIZE);
  }, [flagId, params]);

  return (
    <div className={styles.previewTile}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={flagLabel}
        className={styles.previewCanvas}
      />
      <span className={styles.previewLabel}>{flagLabel}</span>
    </div>
  );
}
