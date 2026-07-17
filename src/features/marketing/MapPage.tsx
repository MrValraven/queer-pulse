import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, FilterChips, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { TYPES, VENUES, VIBES, VIBE_LABEL_KEYS, type Venue } from "./map.data";
import { LisbonMapSvg } from "./LisbonMapSvg";
import { MapVenueCard } from "./MapVenueCard";
import s from "./MapPage.module.css";

function VenueCardSkeleton() {
  // Mirrors the collapsed .vc: head (38px icon + name/bairro + type tag) and a vibes row.
  return (
    <div className={s.vc} aria-hidden>
      <div className={s.vcHead}>
        <SkeletonLine
          width={38}
          height={38}
          style={{ borderRadius: 10, flex: "none" }}
        />
        <div className={s.vcInfo}>
          <SkeletonLine width="60%" height={15} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 5 }} />
        </div>
        <SkeletonLine
          width={54}
          height={20}
          style={{ borderRadius: 6, flex: "none" }}
        />
      </div>
      <div className={s.vcVibes}>
        <SkeletonLine width={48} height={18} style={{ borderRadius: 6 }} />
        <SkeletonLine width={62} height={18} style={{ borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function MapPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [bairro, setBairro] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [vibes, setVibes] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  const items = useMemo(
    () =>
      VENUES.filter((v) => {
        if (bairro && v.bairro !== bairro) return false;
        if (type !== "all" && v.type !== type) return false;
        if (vibes.length && !vibes.some((f) => v.vibe.includes(f)))
          return false;
        return true;
      }),
    [bairro, type, vibes],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((v) => {
      c[v.bairro] = (c[v.bairro] ?? 0) + 1;
    });
    return c;
  }, [items]);

  const groups = useMemo(() => {
    if (bairro) return null;
    const g: { bairro: string; venues: Venue[] }[] = [];
    items.forEach((v) => {
      let grp = g.find((x) => x.bairro === v.bairro);
      if (!grp) {
        grp = { bairro: v.bairro, venues: [] };
        g.push(grp);
      }
      grp.venues.push(v);
    });
    return g;
  }, [items, bairro]);

  function toggleVibe(v: string) {
    setVibes((cur) =>
      cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
    );
    setExpanded(null);
  }
  function selectBairro(name: string | null) {
    setBairro(name);
    setExpanded(null);
  }

  const renderCard = (v: Venue, i: number) => (
    <FadeIn key={v.id} delay={Math.min(i, 8) * 60}>
      <MapVenueCard
        v={v}
        isExpanded={expanded === v.id}
        beenCount={been[v.id] ?? v.beenHere}
        marked={been[v.id] !== undefined}
        onToggle={() => setExpanded(expanded === v.id ? null : v.id)}
        onMarkBeen={() =>
          setBeen((cur) => ({ ...cur, [v.id]: v.beenHere + 1 }))
        }
      />
    </FadeIn>
  );

  return (
    <PageShell>
      <header className={s.hero}>
        <div className="wrap">
          <div className={s.eye}>{t("marketing:map.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="marketing:map.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("marketing:map.hero.sub")}</p>
          <div className={s.stats}>
            <div className={s.stat}>
              <b>23</b>
              <span>{t("marketing:map.stats.venuesListed")}</span>
            </div>
            <div className={s.stat}>
              <b>8</b>
              <span>{t("marketing:map.stats.neighbourhoods")}</span>
            </div>
            <div className={s.stat}>
              <b>{t("marketing:map.stats.communityLabel")}</b>
              <span>{t("marketing:map.stats.maintained")}</span>
            </div>
          </div>
        </div>
      </header>

      <div className={s.filterBar}>
        <div className="wrap">
          <div className={s.fbInner}>
            <span className={s.fbLabel}>
              {t("marketing:map.filterBar.typeLabel")}
            </span>
            <FilterChips
              options={TYPES.map((typeOption) => ({
                value: typeOption.t,
                label: t(typeOption.labelKey),
              }))}
              value={type}
              onChange={(value) => {
                setType(value);
                setExpanded(null);
              }}
            />
            <span className={s.fbSep} />
            <span className={s.fbLabel}>
              {t("marketing:map.filterBar.vibeLabel")}
            </span>
            {VIBES.map((vibe) => (
              <button
                type="button"
                key={vibe}
                className={[s.chip, s.vibe, vibes.includes(vibe) && s.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleVibe(vibe)}
              >
                {t(VIBE_LABEL_KEYS[vibe]!)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={s.body}>
          <LisbonMapSvg
            bairro={bairro}
            counts={counts}
            onSelectBairro={selectBairro}
          />

          <aside className={s.sidebar}>
            <div className={s.sbTop}>
              <div>
                <div className={s.sbHeading}>
                  {bairro ?? t("marketing:map.sidebar.allVenues")}
                </div>
                <div className={s.sbCount}>
                  <Translation
                    i18nKey="marketing:map.sidebar.venueCount"
                    values={{ count: items.length }}
                    components={{ b: <b /> }}
                  />
                </div>
              </div>
              {bairro && (
                <button
                  type="button"
                  className={s.clear}
                  onClick={() => selectBairro(null)}
                >
                  <FiX /> {t("marketing:map.sidebar.clear")}
                </button>
              )}
            </div>

            {!loading && items.length === 0 && (
              <div className={s.empty}>{t("marketing:map.sidebar.empty")}</div>
            )}

            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <VenueCardSkeleton key={i} />
                ))
              : groups
                ? groups.map((g) => (
                    <div key={g.bairro}>
                      <div className={s.groupHead}>{g.bairro}</div>
                      {g.venues.map(renderCard)}
                    </div>
                  ))
                : items.map(renderCard)}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
