import { FiX } from "react-icons/fi";
import { TbPencilPlus } from "react-icons/tb";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FIRST_POST_STARTER_KEYS } from "./firstPostPrompt.data";
import styles from "./FirstPostPrompt.module.css";

/**
 * A warm, dismissible invitation shown at the top of the thread list to members
 * who haven't posted yet. Not a success surface — an offer, so it lives on a
 * soft coral card rather than the plum panel.
 */
export function FirstPostPrompt({
  onWrite,
  onPickStarter,
  onDismiss,
}: {
  onWrite: () => void;
  onPickStarter: (text: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label={t("forum:firstPost.dismissAria")}
      >
        <FiX />
      </button>

      <span className={styles.icon} aria-hidden="true">
        <TbPencilPlus />
      </span>

      <div className={styles.copy}>
        <span className={styles.eyebrow}>{t("forum:firstPost.eyebrow")}</span>
        <h2 className={styles.title}>
          <Translation
            i18nKey="forum:firstPost.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.body}>{t("forum:firstPost.body")}</p>

        <div className={styles.starters}>
          {FIRST_POST_STARTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={styles.starter}
              onClick={() => onPickStarter(t(key))}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <Button onClick={onWrite}>{t("forum:firstPost.writeCta")}</Button>
          <Button variant="ghost" onClick={onDismiss}>
            {t("forum:firstPost.maybeLater")}
          </Button>
        </div>
      </div>
    </div>
  );
}
