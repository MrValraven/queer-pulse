import { useMemo, type ReactNode } from "react";
import QRCode from "qrcode";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MembershipCardFace.module.css";

// ISO/IEC 18004 specifies a quiet zone of 4 modules on every side. The
// previous value of 1 was inherited from `SubprofileQR`, which is itself
// under-specced for the same reason.
const QUIET_ZONE_MODULES = 4;

// A scanner needs dark-on-light POLARITY, not merely contrast against
// whatever is behind it. Four of the five card skins (plum, jade, coral,
// ink — including the default, plum) have a dark background, so painting
// the modules in `currentColor` there produces light-on-dark, which most
// camera QR readers cannot decode. This paints an explicit light plate
// first, then explicit dark modules on top, so the symbol is always
// dark-on-light regardless of the card underneath it. Matches the fixed
// dark-module fill `SubprofileQR` uses, for the same "scanners need
// dark-on-light" reason.
const LIGHT_PLATE_FILL = "rgb(var(--cream-rgb))";
const DARK_MODULE_FILL = "rgb(var(--plum-rgb))";

/**
 * Scannable QR rendered as real SVG rects, mirroring `SubprofileQR`: CSP-safe
 * (no external image request, no canvas, no `dangerouslySetInnerHTML`).
 *
 * Error correction is 'M'. Higher levels survive a scuffed screen better but
 * make the module grid denser, which hurts more at the small sizes a card
 * uses than the extra redundancy helps.
 */
export function CardQr({
  url,
  ariaLabel,
  size = 180,
}: {
  url: string;
  ariaLabel: string;
  size?: number;
}) {
  const { t } = useTranslation();
  const qrCode = useMemo(() => {
    try {
      return QRCode.create(url, { errorCorrectionLevel: "M" });
    } catch {
      return null;
    }
  }, [url]);

  if (!qrCode) {
    // Says plainly that the card cannot currently prove itself, rather than
    // rendering nothing — mirrors the offline/minting notices this same slot
    // shows in `MembershipCardFace`.
    return <p className={styles.qrNotice}>{t("cards:qrNotice.offline")}</p>;
  }

  const { modules } = qrCode;
  const moduleCount = modules.size;
  const total = moduleCount + QUIET_ZONE_MODULES * 2;
  const rects: ReactNode[] = [];
  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      if (!modules.get(row, column)) continue;
      rects.push(
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

  return (
    <svg
      className={styles.qr}
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={total} height={total} fill={LIGHT_PLATE_FILL} />
      {rects}
    </svg>
  );
}
