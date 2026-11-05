import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOST_CHOICE_OPTIONS } from "./hostChoice.data";
import styles from "./HostChoiceModal.module.css";

/**
 * Opened by the Events header's "Host an event" button: the member picks
 * between reading the how-to-host guide and going straight to the event
 * form. Each option is a real link, so it opens in a new tab on a modifier
 * click and reads as a link to assistive tech; a plain click also closes the
 * dialog. The caller mounts it inside `AnimatePresence` so closing plays the
 * shared Modal's exit.
 */
export function HostChoiceModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("myevents:eventsHeader.hostChoice.title")}
      sub={t("myevents:eventsHeader.hostChoice.sub")}
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          {t("myevents:eventsHeader.hostChoice.cancelCta")}
        </Button>
      }
    >
      <ul className={styles.options}>
        {HOST_CHOICE_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return (
            <li key={option.key}>
              <Link to={option.to} className={styles.option} onClick={onClose}>
                <span className={styles.optionIcon} aria-hidden="true">
                  <OptionIcon />
                </span>
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}>
                    {t(option.titleKey)}
                  </span>
                  <span className={styles.optionBody}>{t(option.bodyKey)}</span>
                </span>
                <span className={styles.optionArrow} aria-hidden="true">
                  <FiArrowRight />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
