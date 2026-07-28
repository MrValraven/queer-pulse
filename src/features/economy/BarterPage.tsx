import { useMemo, useState } from "react";
import { FiRepeat } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  Reveal,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BARTERS,
  MODES,
  CATS,
  PRINCIPLES,
  type Barter,
  type Mode,
} from "./barter.data";
import { BarterCard } from "./BarterCard";
import { BarterPostStrip } from "./BarterPostStrip";
import styles from "./BarterPage.module.css";

function BarterSkeleton() {
  return (
    <div className={styles.bc} aria-hidden>
      <div className={styles.bcHead}>
        <SkeletonAvatar size={40} />
        <div className={styles.bcMeta}>
          <SkeletonLine width="60%" height={14} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 5 }} />
        </div>
        <SkeletonLine width={68} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={`${styles.bcBlock} ${styles.bcOffer}`}>
        <SkeletonLine width={56} height={10} />
        <SkeletonLine width="75%" height={17} style={{ marginTop: 8 }} />
        <SkeletonLine width="95%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={`${styles.bcBlock} ${styles.bcWant}`}>
        <SkeletonLine width={64} height={10} />
        <SkeletonLine width="70%" height={17} style={{ marginTop: 8 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.btags}>
        <SkeletonLine width={62} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width={78} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.bcFoot}>
        <SkeletonLine width={70} height={12} />
        <SkeletonLine width={110} height={13} />
      </div>
    </div>
  );
}

export function BarterPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [mode, setMode] = useState<"all" | Mode>("all");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  // Swaps posted in this session, prepended to the board.
  const [posted, setPosted] = useState<Barter[]>([]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    // The seeded board is demo-only fiction. In live mode the exchange starts
    // empty and fills with what members actually post this session.
    const seeded = demoMode ? BARTERS : [];
    return [...posted, ...seeded].filter((b) => {
      if (mode === "offering" && b.mode === "seeking") return false;
      if (mode === "seeking" && b.mode === "offering") return false;
      if (cat !== "all" && b.category !== cat) return false;
      if (q) {
        const hay = (
          b.offer +
          b.want +
          b.offerDetail +
          b.wantDetail +
          b.tags.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mode, cat, query, posted, demoMode]);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("economy:barter.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="economy:barter.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("economy:barter.hero.lead")}
          </Reveal>
          <div className={styles.principle}>
            {PRINCIPLES.map((p, index) => (
              <Reveal
                key={p.id}
                className={styles.principleItem}
                delay={180 + index * 70}
              >
                <strong>{t(p.titleKey)}</strong>
                <span>{t(p.bodyKey)}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className="wrap">
          <div className={styles.controlsRow}>
            <input
              className={styles.search}
              type="text"
              placeholder={t("economy:barter.search.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.modeTabs}>
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  className={[
                    styles.modeTab,
                    mode === m.value && styles.modeTabActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setMode(m.value)}
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>
            <span className={styles.count}>
              <Translation
                i18nKey="economy:barter.count"
                values={{ count: items.length }}
                components={{ b: <b /> }}
              />
            </span>
          </div>
          <div className={styles.cats}>
            {CATS.map((c) => (
              <button
                type="button"
                key={c.value}
                className={[styles.chip, cat === c.value && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setCat(c.value)}
              >
                {t(c.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <BarterSkeleton key={i} />
              ))
            ) : (
              <>
                {items.length === 0 &&
                  (demoMode ? (
                    <EmptyState
                      icon={<FiRepeat />}
                      title={t("economy:barter.empty.title")}
                      description={t("economy:barter.empty.description")}
                      action={{
                        label: t("economy:barter.empty.clearFilters"),
                        onClick: () => {
                          setMode("all");
                          setCat("all");
                          setQuery("");
                        },
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={<FiRepeat />}
                      title={t("economy:barter.emptyLive.title")}
                      description={t("economy:barter.emptyLive.description")}
                    />
                  ))}
                {items.map((b, index) => (
                  <FadeIn key={b.id} delay={Math.min(index, 8) * 60}>
                    <BarterCard barter={b} />
                  </FadeIn>
                ))}
              </>
            )}
          </div>

          <BarterPostStrip onPost={(b) => setPosted((prev) => [b, ...prev])} />
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="economy:barter.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:barter.outro.sub")}
      >
        <Button to={routes.requestInvite} size="lg">
          {t("economy:barter.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
