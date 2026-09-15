import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { TbPencilPlus } from "react-icons/tb";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { composeHref } from "./compose/useComposeThreadSeeds";
import { FIRST_POST_STARTER_KEYS } from "./firstPostPrompt.data";
import styles from "./FirstPostPrompt.module.css";

/**
 * A warm, dismissible invitation shown at the top of the thread list to members
 * who haven't posted yet. Not a success surface — an offer, so it lives on a
 * soft coral card rather than the plum panel.
 *
 * Both the button and the starter chips are real links to `/forum/new`; a chip
 * carries its opening line as `?title=`, which the composer reads on mount. A
 * seeded composer is therefore something a member can open in a new tab, come
 * back to, or send to somebody else.
 */
export function FirstPostPrompt({ onDismiss }: { onDismiss: () => void }) {
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
            <Link
              key={key}
              className={styles.starter}
              to={composeHref(routes.forumNew, { title: t(key) })}
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Button to={routes.forumNew}>{t("forum:firstPost.writeCta")}</Button>
          <Button variant="ghost" onClick={onDismiss}>
            {t("forum:firstPost.maybeLater")}
          </Button>
        </div>
      </div>
    </div>
  );
}
