import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ForumSearch } from "./ForumSearch";
import { ForumDraftResumeNotice } from "./ForumDraftResumeNotice";
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
            {/* FeatureHelp beside the h1, not inside it, so it stays out of
                the heading's accessible name and off the display type scale
                (same pattern as CommunityDetailHero and PageHero). */}
            <div className={styles.titleRow}>
              <h1>
                <Translation
                  i18nKey="forum:hero.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <FeatureHelp id="forum.hub" />
            </div>
            <p>
              {t("forum:hero.lead")}{" "}
              <Link to={routes.communities} className={styles.heroLink}>
                {t("forum:hero.findCommunitiesCta")}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            </p>
          </div>
          <Button className={styles.newBtn} onClick={onNewPost}>
            {t("forum:newPostCta")}
          </Button>
        </div>
        <ForumSearch value={q} onChange={onSearch} />
        {/* PRD-165 — an unsent draft is visible on the forum itself, not only
            on /account/drafts. Renders nothing when there is none. */}
        <ForumDraftResumeNotice onResume={onNewPost} />
      </div>
    </section>
  );
}
