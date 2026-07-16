import { FiCheck, FiInstagram, FiLink, FiShare2 } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./sustainer.module.css";

export interface Receipt {
  welcomeName: string;
  text: string;
  tier: string;
  billing: string;
  solid: string | null;
  ref: string;
  charged: string;
}

type ShareChannel = "story" | "link" | "feed";

const SHARE_CHANNEL_LABEL_KEY: Record<ShareChannel, string> = {
  story: "support:success.share.story",
  link: "support:success.share.link",
  feed: "support:success.share.feed",
};

const SHARE_ARIA_LABEL_KEY: Record<ShareChannel, string> = {
  story: "support:success.shareAriaLabel.story",
  link: "support:success.shareAriaLabel.link",
  feed: "support:success.shareAriaLabel.feed",
};

/** The animated "welcome aboard" success view with receipt + share. */
export function PaymentSuccess({
  receipt,
  onClose,
}: {
  receipt: Receipt;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const share = (channel: ShareChannel) =>
    showToast(
      t("support:success.share.toast", {
        channel: t(SHARE_CHANNEL_LABEL_KEY[channel]),
      }),
      "success",
    );

  return (
    <div className={styles.paySuccess}>
      <div className={styles.psCheck}>
        <FiCheck size={30} aria-hidden />
      </div>
      <div className={styles.psTitle}>
        <Translation
          i18nKey="support:success.welcomeTitle"
          values={{ name: receipt.welcomeName }}
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.psText}>{receipt.text}</div>

      <div className={styles.psShare}>
        <div className={styles.psShareLabel}>{t("support:success.shareLabel")}</div>
        <div className={styles.psShareRow}>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label={t(SHARE_ARIA_LABEL_KEY.story)}
            onClick={() => share("story")}
          >
            <FiShare2 size={17} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label={t(SHARE_ARIA_LABEL_KEY.link)}
            onClick={() => share("link")}
          >
            <FiLink size={17} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.psShareBtn}
            aria-label={t(SHARE_ARIA_LABEL_KEY.feed)}
            onClick={() => share("feed")}
          >
            <FiInstagram size={17} aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.psReceipt}>
        <div className={styles.psRrow}>
          <span>{t("support:success.receipt.membership")}</span>
          <strong>{receipt.tier}</strong>
        </div>
        <div className={styles.psRrow}>
          <span>{t("support:success.receipt.billing")}</span>
          <strong>{receipt.billing}</strong>
        </div>
        {receipt.solid && (
          <div className={styles.psRrow}>
            <span>{t("support:success.receipt.sponsoredMembership")}</span>
            <strong>+ {receipt.solid}</strong>
          </div>
        )}
        <div className={styles.psRrow}>
          <span>{t("support:success.receipt.reference")}</span>
          <strong>{receipt.ref}</strong>
        </div>
        <div className={`${styles.psRrow} ${styles.tot}`}>
          <span>{t("support:success.receipt.chargedToday")}</span>
          <strong>{receipt.charged}</strong>
        </div>
      </div>

      <div className={styles.psActions}>
        <Button
          variant="primary"
          onClick={() => showToast(t("support:success.downloadToast"), "success")}
        >
          {t("support:success.downloadCta")}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t("support:success.backCta")}
        </Button>
      </div>
    </div>
  );
}
