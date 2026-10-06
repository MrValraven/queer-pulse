import { useRef } from "react";
import { Avatar } from "../../shared/components/ui";
import type { ReaderArticle } from "./readerArticle";
import type { TextSize } from "./articleTextSize.data";
import { ArticleReaderBody } from "./ArticleReaderBody";
import { ArticleToolbar } from "./ArticleToolbar";
import { AuthorLink } from "./AuthorLink";
import { ArticleContentNotes, ArticleCorrections } from "./ArticleNotes";
import { ArticleLifecycleBanner } from "./ArticleLifecycleBanner";
import { ArticleReadingAids } from "./ArticleReadingAids";

import styles from "./ArticlePage.module.css";

interface Props {
  article: ReaderArticle;
  /** The slug the URL addresses, which the toolbar saves and shares. */
  articleId: string;
  plainTitle: string;
  blurb: string | undefined;
  standfirst: string;
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
}

/** The reading column: toolbar, notes, reading aids, the body and the bio. */
export function ArticlePageBody({
  article,
  articleId,
  plainTitle,
  blurb,
  standfirst,
  textSize,
  onTextSize,
}: Props) {
  // PRD-113: the element the reading aids measure: progress, the resume
  // point and the contents list all address the body alone.
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.bodyWrap}>
      <article className={styles.bodyInner}>
        <ArticleToolbar
          textSize={textSize}
          onTextSize={onTextSize}
          articleId={articleId}
          articleTitle={plainTitle || undefined}
          articleMeta={`${article.byline} · ${article.readTime}`}
          articleDescription={blurb}
          articleReadTime={article.readTime}
          articleStandfirst={standfirst}
          articleByline={article.byline}
          articleLocale={article.locale}
        />
        {/* CON-16: where the desk stands on this piece today. A live piece
            draws nothing; an archived or superseded one stays readable and
            carries a dated note so it never disappears. */}
        <ArticleLifecycleBanner
          lifecycle={article.lifecycle}
          notice={article.lifecycleNotice}
          publishedLabel={article.date}
        />
        <ArticleContentNotes notes={article.contentNotes ?? []} />
        {/* PRD-113: the long-read aids: a progress bar, a contents list
            built from the piece's own headings, and the point this reader
            left off at. Above the body so a returning reader meets the
            resume prompt before the first paragraph. */}
        <ArticleReadingAids article={article} bodyRef={bodyRef} />
        {/* DES-102: the chosen size rides a data attribute and the CSS maps
            it onto rem tokens. Writing px here ignored the reader's own
            browser font size and capped "A+" at 22px. */}
        <div className={styles.body} data-text-size={textSize} ref={bodyRef}>
          <ArticleReaderBody article={article} />
        </div>

        <ArticleCorrections corrections={article.corrections ?? []} />

        <div className={styles.bio}>
          <Avatar initials={article.initials} tint={article.tint} size={48} />
          <div>
            <div className={styles.bioName}>
              <AuthorLink name={article.byline} />
            </div>
            <p className={styles.bioText}>{article.authorBio}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
