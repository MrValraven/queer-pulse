import { useMemo, useState } from "react";
import { FiRepeat } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro, Reveal, SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { BARTERS, MODES, CATS, PRINCIPLES, type Barter, type Mode } from "./barter.data";
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
  const loading = useSimulatedLoad();
  const [mode, setMode] = useState<"all" | Mode>("all");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  // Swaps posted in this session, prepended to the board.
  const [posted, setPosted] = useState<Barter[]>([]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...posted, ...BARTERS].filter((b) => {
      if (mode === "offering" && b.mode === "seeking") return false;
      if (mode === "seeking" && b.mode === "offering") return false;
      if (cat !== "all" && b.cat !== cat) return false;
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
  }, [mode, cat, query, posted]);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Queer skill exchange
          </Reveal>
          <Reveal as="h1" delay={60}>
            Trade what you <em>know.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            A structured barter board — skills for skills, expertise for
            expertise. No money, no platform fees. Post what you can offer and
            what you're hoping for in return.
          </Reveal>
          <div className={styles.principle}>
            {PRINCIPLES.map((p, index) => (
              <Reveal
                key={p.title}
                className={styles.principleItem}
                delay={180 + index * 70}
              >
                <strong>{p.title}</strong>
                <span>{p.body}</span>
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
              placeholder="Search the exchange…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.modeTabs}>
              {MODES.map((m) => (
                <button
                  key={m.value}
                  className={[
                    styles.modeTab,
                    mode === m.value && styles.modeTabActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setMode(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className={styles.count}>
              <b>{items.length}</b> post{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className={styles.cats}>
            {CATS.map((c) => (
              <button
                key={c.value}
                className={[styles.chip, cat === c.value && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setCat(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <BarterSkeleton key={i} />)
            ) : (
              <>
                {items.length === 0 && (
                  <EmptyState
                    icon={<FiRepeat />}
                    title="Nothing matches your filters"
                    description="No swaps fit that combination just yet. Try broadening your search — or post what you're offering and let the right trade find you."
                    action={{
                      label: "Clear filters",
                      onClick: () => {
                        setMode("all");
                        setCat("all");
                        setQuery("");
                      },
                    }}
                  />
                )}
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
        title={<>Skills are <em>the currency.</em></>}
        sub="QueerPulse Barter is open to all members. The more you offer, the more you can ask for."
      >
        <Button to={routes.requestInvite} size="lg">
          Join the network
        </Button>
      </Outro>
    </PageShell>
  );
}
