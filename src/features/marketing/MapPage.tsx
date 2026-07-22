import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, FilterChips, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { TYPES, VENUES, VIBES, VIBE_LABEL_KEYS, type Venue } from "./map.data";
import { LisbonMap } from "./LisbonMap";
import { MapVenueCard } from "./MapVenueCard";
import s from "./MapPage.module.css";

function VenueCardSkeleton() {
  // Mirrors the collapsed .vc: head (38px icon + name/area + type tag) and a vibes row.
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
  const [freguesia, setFreguesia] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [vibes, setVibes] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [been, setBeen] = useState<Record<string, number>>({});

  // Venues matching the type + vibe filters, but NOT the selected parish. This
  // drives the map's per-parish counts and pins, so selecting one parish never
  // zeroes out the others' badges.
  const typeVibeFiltered = useMemo(
    () =>
      VENUES.filter((venue) => {
        if (type !== "all" && venue.type !== type) return false;
        if (vibes.length && !vibes.some((filter) => venue.vibe.includes(filter)))
          return false;
        return true;
      }),
    [type, vibes],
  );

  // The sidebar list narrows further to the selected parish.
  const items = useMemo(
    () =>
      freguesia
        ? typeVibeFiltered.filter((venue) => venue.freguesia === freguesia)
        : typeVibeFiltered,
    [typeVibeFiltered, freguesia],
  );

  const counts = useMemo(() => {
    const byFreguesia: Record<string, number> = {};
    typeVibeFiltered.forEach((venue) => {
      byFreguesia[venue.freguesia] = (byFreguesia[venue.freguesia] ?? 0) + 1;
    });
    return byFreguesia;
  }, [typeVibeFiltered]);

  const groups = useMemo(() => {
    if (freguesia) return null;
    const grouped: { freguesia: string; venues: Venue[] }[] = [];
    items.forEach((venue) => {
      let group = grouped.find((entry) => entry.freguesia === venue.freguesia);
      if (!group) {
        group = { freguesia: venue.freguesia, venues: [] };
        grouped.push(group);
      }
      group.venues.push(venue);
    });
    return grouped;
  }, [items, freguesia]);

  function toggleVibe(vibe: string) {
    setVibes((current) =>
      current.includes(vibe)
        ? current.filter((entry) => entry !== vibe)
        : [...current, vibe],
    );
    setExpanded(null);
  }
  function selectFreguesia(name: string | null) {
    setFreguesia(name);
    setExpanded(null);
  }
  function selectVenue(venueId: string) {
    setExpanded(venueId);
  }

  const renderCard = (venue: Venue, index: number) => (
    <FadeIn key={venue.id} delay={Math.min(index, 8) * 60}>
      <MapVenueCard
        v={venue}
        isExpanded={expanded === venue.id}
        beenCount={been[venue.id] ?? venue.beenHere}
        marked={been[venue.id] !== undefined}
        onToggle={() => setExpanded(expanded === venue.id ? null : venue.id)}
        onMarkBeen={() =>
          setBeen((current) => ({ ...current, [venue.id]: venue.beenHere + 1 }))
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
            <span className={s.fbLabel} id="map-type-label">
              {t("marketing:map.filterBar.typeLabel")}
            </span>
            <FilterChips
              labelledBy="map-type-label"
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
          <LisbonMap
            venues={typeVibeFiltered}
            freguesia={freguesia}
            selectedVenueId={expanded}
            counts={counts}
            onSelectFreguesia={selectFreguesia}
            onSelectVenue={selectVenue}
          />

          <aside className={s.sidebar}>
            <div className={s.sbTop}>
              <div>
                <div className={s.sbHeading}>
                  {freguesia ?? t("marketing:map.sidebar.allVenues")}
                </div>
                <div className={s.sbCount}>
                  <Translation
                    i18nKey="marketing:map.sidebar.venueCount"
                    values={{ count: items.length }}
                    components={{ b: <b /> }}
                  />
                </div>
              </div>
              {freguesia && (
                <button
                  type="button"
                  className={s.clear}
                  onClick={() => selectFreguesia(null)}
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
                ? groups.map((group) => (
                    <div key={group.freguesia}>
                      <div className={s.groupHead}>{group.freguesia}</div>
                      {group.venues.map(renderCard)}
                    </div>
                  ))
                : items.map(renderCard)}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
