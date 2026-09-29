import { type CSSProperties } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { cropToImgStyle, type CropRect } from "./cropGeometry";
import styles from "./ImageReframer.module.css";

export interface ReframeShapePreviewProps {
  src: string;
  /** The crop rect the reframe frame is showing right now, or null before
   *  the image has loaded. */
  displayRect: CropRect | null;
}

const PREVIEW_SHAPES = [
  { key: "round", shapeClassName: styles.shapePreviewRound },
  { key: "square", shapeClassName: styles.shapePreviewSquare },
] as const;

/**
 * Live "how it will look" row under a square reframe frame: the same crop
 * rendered in a circle and in a rounded square, the two shapes a 1:1 avatar
 * is painted in across the app. Each thumbnail positions the image with
 * `cropToImgStyle`, exactly like the frame does, so it follows every drag,
 * pinch and slider move. The whole row is `aria-hidden`: it only echoes the
 * frame, and the frame plus the zoom slider already carry the meaning.
 */
export default function ReframeShapePreview({
  src,
  displayRect,
}: ReframeShapePreviewProps) {
  const { t } = useTranslation();
  const imageStyle: CSSProperties | null = displayRect
    ? { position: "absolute", ...cropToImgStyle(displayRect) }
    : null;

  return (
    <div className={styles.shapePreview} aria-hidden>
      <p className={styles.shapePreviewHeading}>
        {t("shared:reframe.preview.group")}
      </p>
      <div className={styles.shapePreviewShapes}>
        {PREVIEW_SHAPES.map((shape) => (
          <div
            key={shape.key}
            className={[styles.shapePreviewThumb, shape.shapeClassName].join(
              " ",
            )}
          >
            {imageStyle && (
              <img
                alt=""
                src={src}
                className={styles.image}
                style={imageStyle}
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
