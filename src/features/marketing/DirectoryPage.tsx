import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  FilterChips,
  Outro,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Tint } from "./directoryPlaces";
import { useDirectoryPlaces } from "./api/useDirectory";
import { CAT_LABEL_KEYS } from "./directorySpace.data";
import { routes } from "../../app/routeMap";
import s from "./DirectoryPage.module.css";

/** i18n Pattern A — `c` is the stable stored filter value; `labelKey` resolves via `t()`. */
const CATS = [
  { c: "all", labelKey: "marketing:directory.cat.all" },
  { c: "food", labelKey: CAT_LABEL_KEYS.food! },
  { c: "design", labelKey: CAT_LABEL_KEYS.design! },
  { c: "health", labelKey: CAT_LABEL_KEYS.health! },
  { c: "space", labelKey: CAT_LABEL_KEYS.space! },
  { c: "culture", labelKey: CAT_LABEL_KEYS.culture! },
  { c: "tech", labelKey: CAT_LABEL_KEYS.tech! },
  { c: "grooming", labelKey: CAT_LABEL_KEYS.grooming! },
  { c: "fitness", labelKey: CAT_LABEL_KEYS.fitness! },
];

const tintBg: Record<Tint, string> = {
  coral: "rgba(232,119,90,.15)",
  jade: "rgba(74,140,111,.15)",
  plum: "rgba(45,27,61,.1)",
};
const tintFg: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

function DirectoryCardSkeleton() {
  // Mirrors the real .card: top row (44px avatar + badge), name, cat, hood, desc, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.top}>
        <SkeletonLine width={44} height={44} style={{ borderRadius: 12 }} />
        <SkeletonLine width={84} height={18} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="65%" height={19} />
        <SkeletonLine width="40%" height={12} style={{ marginTop: 6 }} />
        <SkeletonLine width="50%" height={12.5} style={{ marginTop: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.foot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

export function DirectoryPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const places = useDirectoryPlaces();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((b) => {
      if (cat !== "all" && b.cat !== cat) return false;
      if (
        q &&
        !(
          b.name.toLowerCase().includes(q) ||
          b.hood.toLowerCase().includes(q) ||
          b.desc.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [places, cat, query]);

  return (
    <PageShell>
      <PageHero
        eyebrow={t("marketing:directory.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:directory.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:directory.hero.sub")}
      >
        <div className={s.heroNote}>
          <span className={s.live} /> {t("marketing:directory.hero.note")}
        </div>
      </PageHero>

      <div className={s.bar}>
        <div className="wrap">
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
              placeholder={t("marketing:directory.search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterChips
            label={t("marketing:directory.filterAria")}
            options={CATS.map((c) => ({ value: c.c, label: t(c.labelKey) }))}
            value={cat}
            onChange={setCat}
          />
        </div>
      </div>

      <section className={s.content}>
        <div className="wrap">
          <Reveal className={s.count}>
            {loading ? (
              <>{t("marketing:directory.loading")}</>
            ) : (
              <Translation
                i18nKey="marketing:directory.count"
                components={{ b: <b /> }}
                values={{ shown: visible.length, total: places.length }}
              />
            )}
          </Reveal>
          <div className={s.grid}>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <DirectoryCardSkeleton key={index} />
              ))}
            {!loading && visible.length === 0 && (
              <div className={s.empty}>
                {t(
                  places.length === 0
                    ? "marketing:directory.noListings"
                    : "marketing:directory.empty",
                )}
              </div>
            )}
            {!loading &&
              visible.map((place, index) => (
                <FadeIn
                  key={place.name}
                  as={Link}
                  delay={Math.min(index, 8) * 60}
                  to={`${routes.directory}/${place.slug}`}
                  className={s.card}
                >
                  <div className={s.top}>
                    <span
                      className={s.av}
                      style={{
                        background: tintBg[place.tint],
                        color: tintFg[place.tint],
                      }}
                    >
                      {place.av}
                    </span>
                    <span
                      className={`${s.badge} ${place.owned ? s.owned : s.friendly}`}
                    >
                      {t(
                        place.owned
                          ? "marketing:directory.badge.queerOwned"
                          : "marketing:directory.badge.friendly",
                      )}
                    </span>
                  </div>
                  <div>
                    <div className={s.name}>{place.name}</div>
                    <div className={s.cat}>{t(CAT_LABEL_KEYS[place.cat]!)}</div>
                    <div className={s.hood}>
                      <FiMapPin /> {place.hood}
                    </div>
                  </div>
                  <div className={s.desc}>{place.desc}</div>
                  <div className={s.foot}>
                    {place.member ? (
                      <span className={s.memberLink}>
                        {t("marketing:directory.card.memberRun")}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className={s.visit}>
                      {t("marketing:directory.card.viewDetails")}
                    </span>
                  </div>
                </FadeIn>
              ))}
          </div>

          <Reveal className={s.submitStrip}>
            <div>
              <h3>
                <Translation
                  i18nKey="marketing:directory.submitStrip.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("marketing:directory.submitStrip.body")}</p>
            </div>
            <Button size="lg" to={routes.listBusiness}>
              {t("marketing:directory.submitStrip.cta")}
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:directory.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:directory.outro.sub")}
      >
        <Button size="lg" to={routes.requestInvite}>
          {t("marketing:directory.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
