import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ForumSearch } from "./ForumSearch";
import styles from "./ForumPage.module.css";

export function ForumHero({
  onNewPost,
  q,
  onSearch,
}: {
  onNewPost: () => void;
  q: string;
  onSearch: (q: string) => void;
}) {
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
              />{" "}
              <FeatureHelp id="forum.hub" />
            </h1>
            <p>
              {t("forum:hero.lead")}{" "}
              <Link to={routes.communities} className={styles.heroLink}>
                {t("forum:hero.findCommunitiesCta")} <FiArrowRight aria-hidden />
              </Link>
            </p>
          </div>
          <Button className={styles.newBtn} onClick={onNewPost}>
            {t("forum:newPostCta")}
          </Button>
        </div>
        <ForumSearch value={q} onChange={onSearch} />
      </div>
    </section>
  );
}
