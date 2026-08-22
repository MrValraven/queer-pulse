import { useMemo, type ReactNode } from "react";
import QRCode from "qrcode";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileQR.module.css";

interface SubprofileQRProps {
  /** The URL the QR code resolves to (the persona's public share link). */
  url: string;
  ariaLabel: string;
  /** Rendered pixel size of the SVG (square). Defaults to 220. */
  size?: number;
}

// Matches the `margin: 1` quiet zone from the previous `QRCode.toString`
// call: one blank module on every side of the symbol.
const QUIET_ZONE_MODULES = 1;

// Plum ink for the modules; the card surface behind the SVG shows through for
// the light squares (we simply don't paint them), matching the previous
// transparent `color.light` option. Inline SVG resolves CSS custom properties
// in `fill`, so this stays on the design token instead of a frozen hex, and a
// theme/token change carries through. Scanners need a dark-on-light contrast,
// which `--plum` on the card's paper surface keeps in both themes.
const DARK_MODULE_FILL = "var(--plum)";

/**
 * Scannable QR code for a persona's public share URL, rendered as real SVG
 * elements (CSP-safe — no external image request, no canvas, no
 * `dangerouslySetInnerHTML`). `QRCode.create` computes the module matrix
 * synchronously, so this draws one `<rect>` per dark module directly instead
 * of injecting a serialized SVG string; on an encoding error it falls back
 * to the raw URL as a plain link so the share flow degrades gracefully
 * rather than showing a blank card.
 */
export function SubprofileQR({ url, ariaLabel, size = 220 }: SubprofileQRProps) {
  const { t } = useTranslation();

  const qrCode = useMemo(() => {
    try {
      return QRCode.create(url, { errorCorrectionLevel: "M" });
    } catch {
      return null;
    }
  }, [url]);

  if (!qrCode) {
    return (
      <div className={styles.card} style={{ width: size, height: size }}>
        <p className={styles.fallbackHint}>{t("subprofiles:qr.error")}</p>
        <a href={url} className={styles.fallbackLink}>
          {url}
        </a>
      </div>
    );
  }

  const { modules } = qrCode;
  const symbolSize = modules.size;
  const viewBoxSize = symbolSize + QUIET_ZONE_MODULES * 2;

  const darkModuleRects: ReactNode[] = [];
  for (let row = 0; row < symbolSize; row++) {
    for (let column = 0; column < symbolSize; column++) {
      if (modules.get(row, column)) {
        darkModuleRects.push(
          <rect
            key={`${row}-${column}`}
            x={column + QUIET_ZONE_MODULES}
            y={row + QUIET_ZONE_MODULES}
            width={1}
            height={1}
            fill={DARK_MODULE_FILL}
          />,
        );
      }
    }
  }

  return (
    <div
      className={`${styles.card} ${styles.symbol}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        shapeRendering="crispEdges"
      >
        {darkModuleRects}
      </svg>
    </div>
  );
}
