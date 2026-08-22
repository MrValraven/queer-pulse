import { QrCode } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileQR.module.css";

// Both values are FIXED rather than theme-following. `--plum` is not
// redefined in the dark block, and `.symbol` paints a fixed cream ground, so
// the symbol keeps dark-on-light POLARITY in either theme. Scanners need that
// polarity rather than merely contrast, so a code that inverted at night would
// stop decoding on many phones.
const LIGHT_FILL = "rgba(var(--cream-rgb), 1)";
const DARK_MODULE_FILL = "var(--plum)";

interface SubprofileQRProps {
  /** The URL the QR code resolves to (the persona's public share link). */
  url: string;
  ariaLabel: string;
  /** Rendered pixel size of the SVG (square). Defaults to 220. */
  size?: number;
}

/**
 * Scannable QR code for a persona's public share URL, with the QueerPulse Q at
 * its centre.
 *
 * A thin wrapper over the shared `QrCode` primitive, which owns the module
 * grid, the quiet zone, the error-correction level and the mark. What is
 * specific to a share sheet lives here: the surface it sits on, and a failure
 * that degrades to the raw URL as a plain link so someone can still reach the
 * profile by typing it.
 *
 * No light plate: `.symbol` already paints the fixed cream ground behind the
 * whole card, so painting a second one inside the SVG would change nothing
 * except to hide the container's rounded corners.
 */
export function SubprofileQR({ url, ariaLabel, size = 220 }: SubprofileQRProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.card} ${styles.symbol}`}
      style={{ width: size, height: size }}
    >
      <QrCode
        url={url}
        ariaLabel={ariaLabel}
        size={size}
        lightFill={LIGHT_FILL}
        darkFill={DARK_MODULE_FILL}
        fallback={
          <>
            <p className={styles.fallbackHint}>{t("subprofiles:qr.error")}</p>
            <a href={url} className={styles.fallbackLink}>
              {url}
            </a>
          </>
        }
      />
    </div>
  );
}
