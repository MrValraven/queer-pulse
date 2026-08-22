import { QrCode } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MembershipCardFace.module.css";

// A scanner needs dark-on-light POLARITY, not merely contrast against whatever
// is behind it. Four of the five card skins (plum, jade, coral, ink, including
// the default) have a dark ground, so painting the modules in `currentColor`
// there produces light-on-dark, which most camera QR readers cannot decode.
//
// Both values are FIXED rather than theme-following: a card is meant to read as
// the same physical object in either theme, and a symbol that inverted with the
// app would be a different object at night.
const LIGHT_PLATE_FILL = "rgb(var(--cream-rgb))";
const DARK_MODULE_FILL = "rgb(var(--plum-rgb))";

/**
 * The scannable code on a membership card, with the QueerPulse Q at its
 * centre.
 *
 * A thin wrapper over the shared `QrCode` primitive, which owns the module
 * grid, the quiet zone, the error-correction level and the mark. What lives
 * here is what is specific to a CARD: the fixed dark-on-light polarity above,
 * and a failure notice phrased in the card's own terms.
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

  return (
    <QrCode
      className={styles.qr}
      url={url}
      ariaLabel={ariaLabel}
      size={size}
      lightFill={LIGHT_PLATE_FILL}
      darkFill={DARK_MODULE_FILL}
      hasLightPlate
      // Says plainly that the card cannot currently prove itself, rather than
      // rendering nothing. Shares the notice `CardBackFace` shows when a card
      // carries no code at all, because to a reader the two are the same fact.
      fallback={
        <p className={styles.qrNotice}>{t("cards:qrNotice.unavailable")}</p>
      }
    />
  );
}
