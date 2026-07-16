import { useState } from "react";
import { FiHome } from "react-icons/fi";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { PROFILES, matchesBudget, type ListingType } from "./flatmates.data";
import { FlatmateCard } from "./FlatmateCard";
import { FlatmateSkeleton } from "./FlatmateSkeleton";
import { FlatmatesFilterBar } from "./FlatmatesFilterBar";
import { PostProfileModal } from "./PostProfileModal";
import styles from "./FlatmatesPage.module.css";

export function FlatmatesBoard() {
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [type, setType] = useState<ListingType | "all">("all");
  const [neighbourhood, setNeighbourhood] = useState("all");
  const [budget, setBudget] = useState("all");
  const [movein, setMovein] = useState("all");
  const [tags, setTags] = useState<string[]>([]);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  // The flatmate board has no live backend yet, so real member profiles only
  // exist in demo mode ("Populate platform"). Live mode shows the empty board
  // rather than mock members' profiles.
  const source = demoMode ? PROFILES : [];
  // With nothing on the board, the filters have nothing to act on — hide them
  // and let the empty state carry the single call to action.
  const boardEmpty = source.length === 0;

  const filtered = source.filter((p) => {
    if (type !== "all" && p.type !== type) return false;
    if (neighbourhood !== "all" && p.neighbourhood !== neighbourhood)
      return false;
    if (!matchesBudget(p, budget)) return false;
    if (movein !== "all" && p.moveinKey !== movein) return false;
    if (tags.length > 0 && !tags.every((t) => p.tags.includes(t))) return false;
    return true;
  });

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const clearFilters = () => {
    setType("all");
    setNeighbourhood("all");
    setBudget("all");
    setMovein("all");
    setTags([]);
  };

  return (
    <>
      {!boardEmpty && (
        <FlatmatesFilterBar
          type={type}
          setType={setType}
          neighbourhood={neighbourhood}
          setNeighbourhood={setNeighbourhood}
          budget={budget}
          setBudget={setBudget}
          movein={movein}
          setMovein={setMovein}
          tags={tags}
          toggleTag={toggleTag}
        />
      )}

      <div className={styles.body}>
        <div className="wrap">
          {!boardEmpty && (
            <div className={styles.top}>
              <div className={styles.count}>
                <b>{filtered.length}</b> profiles active this week
              </div>
              <button
                type="button"
                className={styles.postBtn}
                onClick={() => setModalOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Post your profile
              </button>
            </div>
          )}
          <div className={styles.grid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <FlatmateSkeleton key={i} />
              ))
            ) : boardEmpty ? (
              <EmptyState
                className={styles.empty}
                icon={<FiHome />}
                title="The flatmate board is quiet right now"
                description="No profiles are posted yet. When members share what they're looking for — a room, a flatmate, a neighbourhood, a budget — they'll show up here. Check back soon, or post a profile of your own."
                action={{
                  label: "Post your profile",
                  onClick: () => setModalOpen(true),
                }}
              />
            ) : (
              <>
                {filtered.length === 0 && (
                  <EmptyState
                    className={styles.empty}
                    icon={<FiHome />}
                    title="No profiles match those filters"
                    description="No one fits that exact combination right now. Try widening your filters — or post your own profile and let the right flatmate find you."
                    action={{ label: "Clear filters", onClick: clearFilters }}
                  />
                )}
                {filtered.map((p, i) => (
                  <FadeIn key={p.id} delay={Math.min(i, 8) * 60}>
                    <FlatmateCard
                      p={p}
                      sent={sent.has(p.id)}
                      onSayHello={() =>
                        setSent((prev) => new Set(prev).add(p.id))
                      }
                    />
                  </FadeIn>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            A home where <em>you belong.</em>
          </>
        }
        sub="The right flatmate can make a city feel like home. Take your time, trust your gut, and use the community."
      >
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => setModalOpen(true)}
        >
          Post your profile
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          Ask the forum →
        </Button>
      </Outro>

      {modalOpen && <PostProfileModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
