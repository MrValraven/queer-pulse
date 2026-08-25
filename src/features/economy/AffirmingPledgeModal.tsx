import { FiCheck, FiHeart } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending } from "./ModalKit";
import { useAcceptAffirmingPledge } from "./api/useAffirmingPledge";
import styles from "./AffirmingPledgeModal.module.css";

const POINT_KEYS = [
  "economy:affirmingPledge.point.affirm",
  "economy:affirmingPledge.point.noHarm",
  "economy:affirmingPledge.point.report",
] as const;

/**
 * The one-time LGBTQ+ affirming pledge prompt, shown when a housing write or
 * contact action returns `AFFIRMING_PLEDGE_REQUIRED`. Accepting stamps the
 * member (accept once, applies everywhere) and calls `onAccepted` so the caller
 * retries the original action. This is a community code of conduct, never an
 * identity filter. Dual-mode: the demo persona is pre-pledged, so this never
 * blocks in demo.
 */
export function AffirmingPledgeModal({
  onAccepted,
  onClose,
}: {
  onAccepted: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const accept = useAcceptAffirmingPledge();

  const handleAccept = () => {
    if (accept.isPending) return;
    accept.mutate(undefined, {
      onSuccess: () => onAccepted(),
      onError: () => showToast(t("economy:affirmingPledge.error"), "error"),
    });
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:affirmingPledge.ariaLabel")}
    >
      <div className={styles.head}>
        <span className={styles.icon}>
          <FiHeart aria-hidden />
        </span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="economy:affirmingPledge.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("economy:affirmingPledge.sub")}</p>
      </div>

      <ul className={styles.points}>
        {POINT_KEYS.map((pointKey) => (
          <li key={pointKey} className={styles.point}>
            <FiCheck aria-hidden className={styles.pointIcon} />
            <span>{t(pointKey)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.foot}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:affirmingPledge.cancel")}
        </button>
        <Button
          variant="primary"
          disabled={accept.isPending}
          onClick={handleAccept}
        >
          {accept.isPending ? (
            <Sending label={t("economy:affirmingPledge.accepting")} />
          ) : (
            t("economy:affirmingPledge.acceptCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
