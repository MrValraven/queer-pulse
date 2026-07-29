import { Link } from "react-router-dom";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { linkToPath } from "../../app/routeMap";
import { CATS, CAT_META, type Resource } from "./resourceLibrary.data";
import s from "./ResourceLibraryPage.module.css";

export function ResourceCardSkeleton() {
  // Mirrors the real .card: top row (category tag + cost pill), name, two desc lines, tags, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.cardTop}>
        <SkeletonLine width={80} height={12} />
        <SkeletonLine width={48} height={18} style={{ borderRadius: 6 }} />
      </div>
      <SkeletonLine width="70%" height={17} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="85%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={s.tags}>
        <SkeletonLine width={50} height={14} />
        <SkeletonLine width={62} height={14} />
      </div>
      <div className={s.cardFoot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

/** Search field + category chips + live result count. */
export function ResourceFilterBar({
  query,
  onQuery,
  cat,
  onCat,
  resultCount,
}: {
  query: string;
  onQuery: (value: string) => void;
  cat: string;
  onCat: (value: string) => void;
  resultCount: number;
}) {
  const { t } = useTranslation();

  return (
    <div className={s.bar}>
      <div className="wrap">
        <div className={s.barInner}>
          <div className={s.search}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={t("marketing:resourceLibrary.search.placeholder")}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
            />
          </div>
          {CATS.map((category) => (
            <button
              type="button"
              key={category.c}
              className={[s.chip, cat === category.c && s.chipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCat(category.c)}
            >
              {t(category.labelKey)}
            </button>
          ))}
          <div className={s.count}>
            {t("marketing:resourceLibrary.results", { count: resultCount })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A single resource tile — internal ones link within the app, external ones
 *  open in a new tab. */
export function ResourceCard({
  resource,
  index,
}: {
  resource: Resource;
  index: number;
}) {
  const { t } = useTranslation();
  const meta = CAT_META[resource.cat]!;
  const inner = (
    <>
      <div className={s.cardTop}>
        <span className={s.catTag} style={{ color: meta.dot }}>
          <span className={s.dot} style={{ background: meta.dot }} />
          {t(meta.labelKey)}
        </span>
        <span
          className={`${s.cost} ${resource.cost === "free" ? s.costFree : s.costSliding}`}
        >
          {resource.cost === "free"
            ? t("marketing:resourceLibrary.cost.free")
            : t("marketing:resourceLibrary.cost.sliding")}
        </span>
      </div>
      <div className={s.name}>{resource.name}</div>
      <div className={s.desc}>{resource.description}</div>
      <div className={s.tags}>
        {resource.tags.map((tag) => (
          <span key={tag} className={s.tag}>
            #{tag}
          </span>
        ))}
      </div>
      <div className={s.cardFoot}>
        {resource.internal ? (
          t("marketing:resourceLibrary.card.openGuide")
        ) : (
          <span className={s.ext}>
            {t("marketing:resourceLibrary.card.visitSite")}
          </span>
        )}
      </div>
    </>
  );

  return (
    <FadeIn delay={Math.min(index, 8) * 60} style={{ height: "100%" }}>
      {resource.internal ? (
        <Link
          to={linkToPath(resource.link)}
          className={s.card}
          style={{ height: "100%" }}
        >
          {inner}
        </Link>
      ) : (
        <a
          href={resource.link}
          className={s.card}
          target="_blank"
          rel="noreferrer"
          style={{ height: "100%" }}
        >
          {inner}
        </a>
      )}
    </FadeIn>
  );
}
