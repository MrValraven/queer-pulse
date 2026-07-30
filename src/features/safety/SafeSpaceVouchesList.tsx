import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type Tint, type Vouch } from "./safeSpaces";
import styles from "./SafeSpaceDetailPage.module.css";

const TINT: Record<Tint, string | undefined> = {
  coral: styles.tCoral,
  jade: styles.tJade,
  plum: styles.tPlum,
};

interface Props {
  vouches: Vouch[];
  /** Opens the "add a vouch" flow (`VouchModal`). Owned by the caller so both
   * the safe-spaces hub's own detail page and the directory detail page's
   * inline trust section can wire it to their own modal-open state. */
  onAddVouch: () => void;
}

/**
 * "N Vouched For" — the member-vouches list from a verified safe space's
 * detail, plus the "add a vouch" trigger. Extracted out of
 * `SafeSpaceDetailPage`'s `VerifiedView` so both the safe-spaces hub's own
 * detail page and the directory detail page's inline trust section
 * (`DirectorySpaceTrust`) render the identical list.
 */
export function SafeSpaceVouchesList({ vouches, onAddVouch }: Props) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <h2>
        <Translation
          i18nKey="safety:spaces.detail.vouchedTitle"
          values={{ count: vouches.length }}
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.secSub}>
        {t("safety:spaces.detail.vouchedSub")}{" "}
        <Button
          variant="ghost"
          className={styles.vouchTrigger}
          onClick={onAddVouch}
        >
          {t("safety:spaces.detail.addVouchCta")}
        </Button>
      </p>
      <div className={styles.vouchRow}>
        {vouches.map((vouch) => (
          <div className={styles.vouch} key={vouch.name + vouch.when}>
            <div className={styles.vouchHead}>
              <div className={[styles.vouchAv, TINT[vouch.tint]].join(" ")}>
                {vouch.initials}
              </div>
              <div>
                <div className={styles.vouchName}>
                  <Link to={routes.members}>{vouch.name}</Link>
                </div>
                <div className={styles.vouchByline}>{vouch.byline}</div>
              </div>
            </div>
            <div className={styles.vouchText}>{vouch.text}</div>
            <div className={styles.vouchWhen}>{vouch.when}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
