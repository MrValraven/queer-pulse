import { FiArrowRight } from "react-icons/fi";
import { Button, Modal, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  usePublicProfile,
  usePublicProfileEligibility,
} from "../../app/providers/usePublicProfile";
import { EligibilityTracker } from "./EligibilityTracker";
import styles from "./PublicProfileModal.module.css";

/**
 * The member's own public-profile control, housed in the shared Modal (opened
 * from the hero badge). Locked until eligible (a contributor checklist explains
 * how it's earned); once eligible, an off-by-default switch plus a preview link.
 */
export function PublicProfileModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { enabled, toggle, saving } = usePublicProfile();
  // Separate hook on purpose: reading eligibility is what turns the signals
  // fetch on, so it follows this modal's lifetime.
  const { eligibility, eligibilityStatus, retryEligibility } =
    usePublicProfileEligibility();
  const { showToast } = useToast();

  // A failed write says so instead of claiming success.
  //
  // Turning it ON can now be REFUSED by the server: `PUT /me/public-profile`
  // evaluates eligibility and 403s a member who does not qualify, which is
  // reachable if their standing changed after the signals were fetched. So a
  // failed enable also refetches the signals: the modal re-locks and the
  // checklist below explains why, rather than leaving a switch on screen that
  // the server will keep rejecting. A failed disable is never an eligibility
  // problem (turning it off is always allowed), so it just reports.
  async function onToggle() {
    if (saving) return;
    const wasEnabling = !enabled;
    const ok = await toggle();
    if (!ok) {
      showToast(t("members:publicProfile.control.toast.failed"), "error", 7000);
      if (wasEnabling) retryEligibility();
      return;
    }
    showToast(
      enabled
        ? t("members:publicProfile.control.toast.hidden")
        : t("members:publicProfile.control.toast.live"),
      enabled ? "info" : "success",
    );
  }

  if (eligibilityStatus === "loading") {
    return (
      <Modal
        onClose={onClose}
        eyebrow={t("members:publicProfile.control.locked.eyebrow")}
        title={
          <Translation
            i18nKey="members:publicProfile.control.checking.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("members:publicProfile.control.checking.body")}
      >
        <div className={styles.checking} aria-busy="true" />
      </Modal>
    );
  }

  if (eligibilityStatus === "error") {
    return (
      <Modal
        onClose={onClose}
        eyebrow={t("members:publicProfile.control.locked.eyebrow")}
        title={t("members:publicProfile.control.error.title")}
        sub={t("members:publicProfile.control.error.body")}
        footer={
          <Button variant="ghost" onClick={retryEligibility}>
            {t("members:publicProfile.control.error.retry")}
          </Button>
        }
      >
        <span />
      </Modal>
    );
  }

  if (!eligibility.eligible) {
    return (
      <Modal
        onClose={onClose}
        eyebrow={t("members:publicProfile.control.locked.eyebrow")}
        title={
          <Translation
            i18nKey="members:publicProfile.control.locked.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("members:publicProfile.control.locked.lede")}
      >
        <EligibilityTracker eligibility={eligibility} />
      </Modal>
    );
  }

  return (
    <Modal
      onClose={onClose}
      eyebrow={t("members:publicProfile.control.unlocked.eyebrow")}
      title={
        <Translation
          i18nKey="members:publicProfile.control.unlocked.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("members:publicProfile.control.unlocked.lede")}
      footer={
        <Button variant="ghost" to={routes.publicProfile}>
          {t("members:publicProfile.control.viewCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      }
    >
      <p className={styles.notYet}>
        {t("members:publicProfile.control.notYet")}
      </p>
      <div className={styles.switchRow}>
        <div className={styles.switchText}>
          <span className={styles.switchLabel}>
            {t("members:publicProfile.control.switchLabel")}
          </span>
          <span
            className={`${styles.status} ${enabled ? styles.statusOn : ""}`}
            aria-live="polite"
          >
            {enabled
              ? t("members:publicProfile.control.statusOn")
              : t("members:publicProfile.control.statusOff")}
          </span>
        </div>
        <Toggle
          tone="jade"
          checked={enabled}
          label={t("members:publicProfile.control.switchLabel")}
          onChange={() => void onToggle()}
        />
      </div>
    </Modal>
  );
}
