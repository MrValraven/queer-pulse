import { useState, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, ImageSlot, Tag } from '../../shared/components/ui'
import { MagazineMasthead } from './MagazineMasthead'
import {
  articles,
  defaultArticleId,
  isPullQuote,
  relationReason,
} from './data/articles'
import { ArticleToolbar, type TextSize } from './ArticleToolbar'

import styles from './ArticlePage.module.css'

const SIZE_PX: Record<TextSize, number> = { sm: 17, md: 19, lg: 22 }

export function ArticlePage() {
  const [params] = useSearchParams()
  const [textSize, setTextSize] = useState<TextSize>('md')
  const id = params.get('id') ?? defaultArticleId
  const article = articles[id]

  if (!article) {
    return (
      <PageShell>
        <div className={`${styles.notFound} wrap`}>
          <h2>We couldn't find that piece.</h2>
          <p>The article may have moved, or the link may be incomplete.</p>
          <Button to="/magazine">Back to the magazine</Button>
        </div>
      </PageShell>
    )
  }

  const related = article.related
    .map((relatedId) => articles[relatedId])
    .filter((value): value is NonNullable<typeof value> => Boolean(value))

  return (
    <PageShell>
      <MagazineMasthead />
      <div className={styles.header}>
        <div className="wrap">
          <Link to="/magazine" className={styles.back}>
            ← Magazine <span style={{ opacity: 0.5 }}>·</span> {article.section}
          </Link>
          <div className={styles.kicker}>{article.kicker}</div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.bylineRow}>
            <Avatar initials={article.initials} tint={article.tint} size={36} />
            <div>
              <div className={styles.author}>{article.byline}</div>
              {article.role && <div className={styles.role}>{article.role}</div>}
            </div>
            <div className={styles.pills}>
              <span className={styles.pill}>{article.date}</span>
              <span className={styles.pill}>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.hero}>
        <ImageSlot tint={article.tint === 'auth' ? 'plum' : article.tint} height={480} radius={0} placeholder={article.imgDesc} />
        <div className={styles.heroStrip} />
      </div>

      <div className={styles.bodyWrap}>
        <article className={styles.bodyInner}>
          <ArticleToolbar textSize={textSize} onTextSize={setTextSize} />
          <div
            className={styles.body}
            style={{ '--article-body-size': `${SIZE_PX[textSize]}px` } as CSSProperties}
          >
            {article.body.map((block, index) =>
              isPullQuote(block) ? (
                <blockquote key={index} className={styles.pull}>
                  {block.pull}
                </blockquote>
              ) : (
                <p key={index}>{block}</p>
              ),
            )}
          </div>

          <div className={styles.bio}>
            <Avatar initials={article.initials} tint={article.tint} size={48} />
            <div>
              <div className={styles.bioName}>{article.byline}</div>
              <p className={styles.bioText}>{article.authorBio}</p>
            </div>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <div className={styles.related}>
          <div className="wrap">
            <div className={styles.relatedHead}>
              Keep <em>reading</em>
            </div>
            <div className={styles.relGrid}>
              {related.map((rel) => (
                <Link key={rel.id} to={`/article?id=${rel.id}`} className={styles.relCard}>
                  <div className={styles.relKicker}>{rel.section}</div>
                  <div className={styles.relTitle}>{rel.title}</div>
                  <div className={styles.relMeta}>
                    {rel.byline} · {rel.readTime}
                  </div>
                  <Tag className={styles.relReason}>{relationReason(article, rel)}</Tag>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
