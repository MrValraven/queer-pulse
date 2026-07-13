import { useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal } from "../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import { routes } from "../../../app/routeMap";
import { spotlightCommunities } from "./Communities.data";
import { useCommunityFilters } from "./useCommunityFilters";
import { CommunitiesToolbar } from "./CommunitiesToolbar";
import { CommunityRail } from "./CommunityRail";
import { CommunitySpotlight } from "./CommunitySpotlight";
import styles from "./Communities.module.css";

const SKELETON_MS = 340;

export function Communities() {
  const { state, patch, clear, visible, total, langOptions, hoodOptions } =
    useCommunityFilters();
  const reduce = usePrefersReducedMotion();

  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(
    spotlightCommunities[0]?.anchor ?? null,
  );
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Derive the effective selection during render (no syncing effect): if the
  // picked community has been filtered out, fall back to the first visible one.
  const activeAnchor =
    selectedAnchor && visible.some((d) => d.anchor === selectedAnchor)
      ? selectedAnchor
      : (visible[0]?.anchor ?? null);

  const previewCommunity = (anchor: string) => {
    // Don't let a hover en route to the spotlight steal a deliberate click
    // that's still resolving its skeleton.
    if (loading) return;
    clearTimeout(timer.current);
    setSelectedAnchor(anchor);
  };

  const selectCommunity = (anchor: string) => {
    if (anchor === activeAnchor) return;
    clearTimeout(timer.current);
    setSelectedAnchor(anchor);
    if (reduce) return;
    setLoading(true);
    timer.current = setTimeout(() => setLoading(false), SKELETON_MS);
  };

  const selected =
    spotlightCommunities.find((d) => d.anchor === activeAnchor) ?? null;
  const shown = visible.length;

  return (
    <section className={styles.section} id="communities">
      <div className="wrap">
        <Reveal>
          <div className={styles.head}>
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.live} aria-hidden />
                Communities · Lisboa
              </div>
              <h2 className={styles.title}>
                Step inside, <em>one room at a time.</em>
              </h2>
            </div>
            <div className={styles.headRight}>
              <p className={styles.sub}>
                Search or filter the list, then open any community to see the
                whole room — what it is, what it does, who&apos;s inside, and
                what you unlock by joining.
              </p>
              <Button variant="ghost" to={routes.communities}>
                Browse all communities <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <CommunitiesToolbar
            state={state}
            patch={patch}
            langOptions={langOptions}
            hoodOptions={hoodOptions}
          />
        </Reveal>

        <Reveal>
          <p className={styles.resultCount}>
            {shown === total ? (
              <>
                <b>{total}</b> communities
              </>
            ) : (
              <>
                <b>{shown}</b> of {total} communities
              </>
            )}
          </p>
        </Reveal>

        <Reveal>
          <div className={styles.grid}>
            <CommunityRail
              list={visible}
              selectedAnchor={activeAnchor}
              onSelect={selectCommunity}
              onPreview={previewCommunity}
              onClear={clear}
            />
            <CommunitySpotlight
              key={activeAnchor ?? "empty"}
              community={selected}
              loading={loading}
              onClear={clear}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
