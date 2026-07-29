import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ForumPage.module.css";

export function ForumHero({ onNewPost }: { onNewPost: () => void }) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className="wrap">
        <div className={styles.heroRow}>
          <div>
            <div className={styles.cat}>{t("forum:hero.eyebrow")}</div>
            <h1>
              <Translation
                i18nKey="forum:hero.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p>
              {t("forum:hero.lead")}{" "}
              <Link to={routes.communities} className={styles.heroLink}>
                {t("forum:hero.findCommunitiesCta")}
              </Link>
            </p>
          </div>
          <Button className={styles.newBtn} onClick={onNewPost}>
            {t("forum:newPostCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
