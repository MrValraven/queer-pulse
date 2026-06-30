import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import { CHANGEMAKERS, getChangemaker, type Tint } from "./changemakerStories";
import styles from "./ChangemakerStoryPage.module.css";

const HERO_GRADIENT: Record<Tint, string> = {
  coral:
    "linear-gradient(135deg, rgba(var(--accent-rgb),.42), rgba(45,27,61,.5))",
  jade: "linear-gradient(135deg, rgba(var(--jade-rgb),.42), rgba(45,27,61,.5))",
  plum: "linear-gradient(135deg, rgba(45,27,61,.55), rgba(45,27,61,.35))",
};
const AV_CLASS: Record<Tint, string> = {
  coral: "avCoral",
  jade: "avJade",
  plum: "avPlum",
};

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function ChangemakerStoryPage() {
  const { slug } = useParams();
  const { openConnect } = useConnect();
  const cm = getChangemaker(slug);
  if (!cm) return <Navigate to={routes.changemakers} replace />;

  const others = CHANGEMAKERS.filter((c) => c.slug !== cm.slug).slice(0, 3);
  const [first, ...rest] = cm.body;

  return (
    <PageShell>
      <div className={styles.back}>
        <div className="wrap">
          <Link to={routes.changemakers} className={styles.backLink}>
            ← Change Makers
          </Link>
        </div>
      </div>

      <div
        className={styles.hero}
        style={{ background: HERO_GRADIENT[cm.tint] }}
      >
        <div className={styles.heroInitials}>{cm.initials}</div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            <div className={styles.cat}>Change Maker · {cm.cause}</div>
            <h1 className={styles.title}>{cm.name}</h1>
            <div className={styles.byline}>
              <span className={styles.bylineAv}>{cm.initials}</span>
              <span>{cm.byline}</span>
              <span className={styles.bDot} />
              <span>{cm.readTime}</span>
              <span className={styles.bDot} />
              <span>{cm.date}</span>
            </div>
          </div>
        </div>
      </div>

      <article className={styles.articleWrap}>
        <p className={styles.lead}>{cm.lead}</p>
        <div className={styles.meta}>
          {cm.tags.map((t) => (
            <span className={styles.tag} key={t}>
              {t}
            </span>
          ))}
          <span className={styles.metaDot} />
          <span>{cm.readTime}</span>
          <span className={styles.metaDot} />
          <span>{cm.date}</span>
        </div>

        <div className={styles.body}>
          <p>{first}</p>
          {rest[0] && <p>{rest[0]}</p>}

          <blockquote className={styles.quote}>
            <p>“{cm.pullQuote.text}”</p>
            <cite>{cm.pullQuote.cite}</cite>
          </blockquote>

          <div className={styles.impactCard}>
            <div className={styles.impactLabel}>
              Why we highlight {cm.name.split(" ")[0]}
            </div>
            {cm.impact.map((row) => (
              <div className={styles.impactRow} key={row}>
                <span className={styles.impactIc}>
                  <Tick />
                </span>
                <span>{row}</span>
              </div>
            ))}
          </div>

          {rest.slice(1).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      <Outro
        title={
          <>
            Want to support <em>{cm.name.split(" ")[0]}'s</em> work?
          </>
        }
        sub="Change makers do this alongside their day jobs. A message, an introduction, or an hour of your time goes further than you'd think."
      >
        <Button variant="primary" onClick={() => openConnect()}>
          Connect with {cm.name.split(" ")[0]} →
        </Button>
        <Button variant="ghost-dark" to={routes.changemakers}>
          Meet more change makers
        </Button>
      </Outro>

      <div className={styles.more}>
        <div className={styles.moreLabel}>More change makers</div>
        <div className={styles.moreGrid}>
          {others.map((o) => (
            <Link
              key={o.slug}
              to={`/changemaker/${o.slug}`}
              className={styles.moreCard}
            >
              <div
                className={[styles.moreAv, styles[AV_CLASS[o.tint]]].join(" ")}
              >
                {o.initials}
              </div>
              <div>
                <div className={styles.moreName}>{o.name}</div>
                <div className={styles.moreCause}>{o.cause}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ height: 60 }} />
      </div>
    </PageShell>
  );
}
