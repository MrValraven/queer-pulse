import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { CATEGORIES, type Guide } from "../resources/library.data";
import { CATEGORY_DOT, type Organisation } from "./resourceLibrary.data";
import s from "./ResourceLibraryPage.module.css";

export function ResourceCardSkeleton() {
  // Mirrors the real .card: category tag, name, two desc lines, tags, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.cardTop}>
        <SkeletonLine width={80} height={12} />
      </div>
      <SkeletonLine width="70%" height={17} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13} />
        <SkeletonLine width="85%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={s.cardFoot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

/** Search field + real-category chips + live result count. */
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
              aria-label={t("marketing:resourceLibrary.search.placeholder")}
              placeholder={t("marketing:resourceLibrary.search.placeholder")}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
            />
          </div>
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.id}
              className={[s.chip, cat === category.id && s.chipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCat(category.id)}
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

/** A single editorial guide, real backend data via `useLibraryData`. */
export function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={Math.min(index, 8) * 60} style={{ height: "100%" }}>
      <Link to={guide.to} className={s.card} style={{ height: "100%" }}>
        <div className={s.cardTop}>
          <span
            className={s.catTag}
            style={{ color: CATEGORY_DOT[guide.category] }}
          >
            <span
              className={s.dot}
              style={{ background: CATEGORY_DOT[guide.category] }}
            />
            {guide.categoryLabel}
          </span>
        </div>
        <div className={s.name}>{guide.title}</div>
        <div className={s.desc}>{guide.description}</div>
        <div className={s.verified}>
          {guide.lastVerifiedAt ? (
            <>
              <FiCheckCircle aria-hidden />
              {t("resources:library.card.verifiedOn", {
                date: formatDate(guide.lastVerifiedAt),
              })}
            </>
          ) : (
            <>
              <FiClock aria-hidden />
              {t("resources:library.card.notYetVerified")}
            </>
          )}
        </div>
        <div className={s.cardFoot}>
          {t("resources:library.readGuideCta")} <FiArrowRight aria-hidden />
        </div>
      </Link>
    </FadeIn>
  );
}

/** A curated external organisation — always opens in a new tab. */
export function OrganisationCard({
  organisation,
  index,
}: {
  organisation: Organisation;
  index: number;
}) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={Math.min(index, 8) * 60} style={{ height: "100%" }}>
      <a
        href={organisation.url}
        className={s.card}
        target="_blank"
        rel="noopener noreferrer"
        style={{ height: "100%" }}
      >
        <div className={s.name}>{organisation.name}</div>
        <div className={s.desc}>{organisation.description}</div>
        <div className={s.tags}>
          {organisation.tags.map((tag) => (
            <span key={tag} className={s.tag}>
              #{tag}
            </span>
          ))}
        </div>
        <div className={`${s.cardFoot} ${s.ext}`}>
          {t("marketing:resourceLibrary.card.visitSite")}{" "}
          <FiExternalLink aria-hidden />
        </div>
      </a>
    </FadeIn>
  );
}
