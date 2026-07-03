import { Link } from "react-router-dom";
import { Button, ImageSlot, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  collectionsHeader,
  proposeContent,
  type Collection,
} from "./cinemaCollections.data";
import styles from "./CinemaCollectionsPage.module.css";

const collectionPath = (slug: string) => `${routes.cinemaCollections}/${slug}`;

/** Four-poster mosaic over the plum panel, shared by featured + grid cards. */
function Mosaic({ posters, tint }: { posters: string[]; tint?: boolean }) {
  return (
    <>
      {posters.map((src, i) => (
        <ImageSlot
          key={i}
          src={src}
          width="100%"
          height="100%"
          radius={0}
          placeholder="poster"
        />
      ))}
      <div className={tint ? styles.thumbOverlay : styles.overlay} />
    </>
  );
}

export function CollectionsHeader() {
  const { eyebrow, titlePre, titleEm, sub, quote } = collectionsHeader;
  return (
    <section className={styles.header}>
      <div className={`wrap ${styles.headerInner}`}>
        <div>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h1 className={styles.title}>
            {titlePre}
            <em>{titleEm}</em>
          </h1>
          <p className={styles.sub}>{sub}</p>
        </div>
        <div className={styles.quote}>
          <div className={styles.quoteText}>
            {quote.pre}
            <em>{quote.em}</em>
            {quote.post}
          </div>
          <div className={styles.quoteAttr}>{quote.attr}</div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCollection({ c }: { c: Collection }) {
  return (
    <Link to={collectionPath(c.slug)} className={styles.feat}>
      <div className={styles.featVisual}>
        <div className={styles.mosaic}>
          <Mosaic posters={c.posters} />
        </div>
        <div className={styles.featNum}>{c.num}</div>
      </div>
      <div className={styles.featText}>
        <div className={styles.featTag}>
          <span className={styles.live} aria-hidden />
          {c.tag}
        </div>
        <div className={styles.featTitle}>
          {c.titlePre}
          <em>{c.titleEm}</em>
          {c.titlePost}
        </div>
        <div className={styles.featBody}>{c.desc}</div>
        <div className={styles.curatorRow}>
          <span className={styles.av}>{c.curatorInitials}</span>
          <span className={styles.curatorName}>
            <strong>{c.curator}</strong>
            {c.curatorRole ? ` · ${c.curatorRole}` : ""}
          </span>
        </div>
        <div className={styles.metaRow}>
          {c.stats.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function CollectionCard({ c }: { c: Collection }) {
  return (
    <Link to={collectionPath(c.slug)} className={styles.card}>
      <div className={styles.thumb}>
        <Mosaic posters={c.posters} tint />
        <div className={styles.cardNum}>{c.num}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTag}>{c.tag}</div>
        <div className={styles.cardTitle}>
          {c.titlePre}
          <em>{c.titleEm}</em>
          {c.titlePost}
        </div>
        <div className={styles.cardDesc}>{c.desc}</div>
        <div className={styles.cardCurator}>
          <span className={styles.avSm}>{c.curatorInitials}</span>
          <span className={styles.cardCuratorName}>
            Curated by <strong>{c.curator}</strong>
          </span>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <span>{c.footLeft}</span>
        <em>{c.footRight}</em>
      </div>
    </Link>
  );
}

export function ProposeCollection() {
  const { showToast } = useToast();
  const { eyebrow, titlePre, titleEm, titlePost, body, steps } = proposeContent;

  return (
    <div className={styles.propose}>
      <div className={styles.proposeText}>
        <div className={styles.proposeEb}>{eyebrow}</div>
        <h2 className={styles.proposeTitle}>
          {titlePre}
          <em>{titleEm}</em>
          {titlePost}
        </h2>
        <p className={styles.proposeBody}>{body}</p>
        <div className={styles.proposeActions}>
          <Button
            onClick={() =>
              showToast(
                "Send your 200-word thesis to curators@queerpulse.co — the council responds within 3 weeks.",
                "success",
              )
            }
          >
            Propose a collection
          </Button>
          <Button variant="ghost-dark" to={routes.governance}>
            Meet the council
          </Button>
        </div>
      </div>
      <div className={styles.proposeHow}>
        {steps.map((step, i) => (
          <div key={i} className={styles.step}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span>
              {step.pre}
              {step.em && <em>{step.em}</em>}
              {step.post}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Zero-shift skeleton mirroring the featured card + grid layout. */
export function CollectionsSkeleton() {
  return (
    <>
      <div className={styles.feat} aria-hidden>
        <div className={styles.featVisual} />
        <div className={styles.featText}>
          <SkeletonLine width="40%" height={12} />
          <SkeletonLine width="80%" height={34} style={{ marginTop: 14 }} />
          <SkeletonLine height={14} style={{ marginTop: 16 }} />
          <SkeletonLine width="90%" height={14} style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.card} aria-hidden>
            <div className={styles.thumb} />
            <div className={styles.cardBody}>
              <SkeletonLine width="50%" height={11} />
              <SkeletonLine width="85%" height={20} style={{ marginTop: 6 }} />
              <SkeletonLine height={13} style={{ marginTop: 8 }} />
              <SkeletonLine width="70%" height={13} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
