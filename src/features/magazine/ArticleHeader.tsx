import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AuthorLink } from "./AuthorLink";
import { ArticleTagList } from "./ArticleTagList";
import { ArticleLanguageSwitcher } from "./ArticleLanguageSwitcher";
import type { ReaderArticle } from "./readerArticle";

import styles from "./ArticlePage.module.css";

/**
 * The masthead block above an article: the way back, the desk's kicker, the
 * headline, its standfirst, the byline row and the language switcher. Lifted
 * out of `ArticlePage` so that component stays under the repo's 200-line cap;
 * the styles stay in `ArticlePage.module.css`, where the header already lives.
 */
export function ArticleHeader({
  article,
  standfirst,
}: {
  article: ReaderArticle;
  /** PRD-102 — the line under the headline, already resolved by the page to
   *  the desk's standfirst or, failing that, the dek. Empty renders nothing. */
  standfirst: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className="wrap">
        <Link to={routes.magazine} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("magazine:article.backToMagazine")}
          {/* PRD-102 — the section, and no dangling separator without one. */}
          {article.section && (
            <>
              {" "}
              <span style={{ opacity: 0.5 }}>·</span> {article.section}
            </>
          )}
        </Link>
        {/* PRD-102 — the desk's own kicker, and nothing at all when the editor
            left it blank rather than an empty coral line. */}
        {article.kicker && (
          <div className={styles.kicker}>{article.kicker}</div>
        )}
        <h1 className={styles.title}>{article.title}</h1>
        {/* PRD-102 — the standfirst under the headline, exactly where the
            desk's own reader preview puts it. */}
        {standfirst && <p className={styles.standfirst}>{standfirst}</p>}
        <div className={styles.bylineRow}>
          <Avatar initials={article.initials} tint={article.tint} size={36} />
          <div>
            <div className={styles.author}>
              <AuthorLink name={article.byline} />
            </div>
            {article.role && <div className={styles.role}>{article.role}</div>}
          </div>
          <div className={styles.pills}>
            <span className={styles.pill}>{article.date}</span>
            <span className={styles.pill}>{article.readTime}</span>
          </div>
        </div>
        <ArticleTagList tags={article.tags} />
        {/* CON-16 — every language this piece is readable in. When there is
            only one and it is not the reader's, it says so plainly instead of
            leaving them looking for a control that is not there. */}
        <ArticleLanguageSwitcher
          translations={article.translations}
          currentLocale={article.locale}
          translatorName={article.translatorName}
        />
      </div>
    </div>
  );
}
