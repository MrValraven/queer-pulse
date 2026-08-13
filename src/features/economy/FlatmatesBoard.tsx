import { useState } from "react";
import { FiArrowRight, FiHome } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  FeatureHelp,
  Outro,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { matchesBudget, type ListingType } from "./flatmates.data";
import { useFlatmateProfiles } from "./api/useFlatmateProfiles";
import { FlatmateCard } from "./FlatmateCard";
import { FlatmateDiscovery } from "./FlatmateDiscovery";
import { FlatmateSkeleton } from "./FlatmateSkeleton";
import { FlatmatesFilterBar } from "./FlatmatesFilterBar";
import { FlatmateViewToggle, type FlatmateView } from "./FlatmateViewToggle";
import { PostProfileModal } from "./PostProfileModal";
import styles from "./FlatmatesPage.module.css";

export function FlatmatesBoard() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [type, setType] = useState<ListingType | "all">("all");
  const [neighbourhood, setNeighbourhood] = useState("all");
  const [budget, setBudget] = useState("all");
  const [movein, setMovein] = useState("all");
  const [tags, setTags] = useState<string[]>([]);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<FlatmateView>("list");

  const { data: source = [], isFetching } = useFlatmateProfiles();
  // Skeleton while the simulated demo beat runs OR (live) the query is in
  // flight — otherwise a slow live fetch flashes the empty-board CTA.
  const loading = useSimulatedLoad() || (!demoMode && isFetching);
  // With nothing on the board, the filters have nothing to act on — hide them
  // and let the empty state carry the single call to action.
  const boardEmpty = source.length === 0;

  const filtered = source.filter((p) => {
    if (type !== "all" && p.type !== type) return false;
    if (neighbourhood !== "all" && p.neighbourhood !== neighbourhood)
      return false;
    if (!matchesBudget(p, budget)) return false;
    if (movein !== "all" && p.moveinKey !== movein) return false;
    if (tags.length > 0 && !tags.every((tag) => p.tags.includes(tag)))
      return false;
    return true;
  });

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((existing) => existing !== tag)
        : [...prev, tag],
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
                {t("economy:flatmates.count", { count: filtered.length })}{" "}
                <FeatureHelp id="housing.flatmates" />
              </div>
              <div className={styles.topActions}>
                <FlatmateViewToggle view={view} setView={setView} />
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
                  {t("economy:flatmates.postProfileCta")}
                </button>
              </div>
            </div>
          )}
          {!boardEmpty && !loading && view === "discovery" ? (
            <FlatmateDiscovery
              key={[type, neighbourhood, budget, movein, tags.join(",")].join(
                "|",
              )}
              profiles={filtered}
              onSayHello={(profileId) =>
                setSent((prev) => new Set(prev).add(profileId))
              }
            />
          ) : (
          <div className={styles.grid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, skeletonIndex) => (
                <FlatmateSkeleton key={skeletonIndex} />
              ))
            ) : boardEmpty ? (
              <EmptyState
                className={styles.empty}
                icon={<FiHome />}
                title={t("economy:flatmates.empty.title")}
                description={t("economy:flatmates.empty.description")}
                action={{
                  label: t("economy:flatmates.postProfileCta"),
                  onClick: () => setModalOpen(true),
                }}
              />
            ) : (
              <>
                {filtered.length === 0 && (
                  <EmptyState
                    className={styles.empty}
                    icon={<FiHome />}
                    title={t("economy:flatmates.empty.filteredTitle")}
                    description={t(
                      "economy:flatmates.empty.filteredDescription",
                    )}
                    action={{
                      label: t("economy:flatmates.empty.clearFilters"),
                      onClick: clearFilters,
                    }}
                  />
                )}
                {filtered.map((profile, profileIndex) => (
                  <FadeIn
                    key={profile.id}
                    delay={Math.min(profileIndex, 8) * 60}
                  >
                    <FlatmateCard
                      p={profile}
                      sent={sent.has(profile.id)}
                      onSayHello={() =>
                        setSent((prev) => new Set(prev).add(profile.id))
                      }
                    />
                  </FadeIn>
                ))}
              </>
            )}
          </div>
          )}
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="economy:flatmates.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:flatmates.outro.sub")}
      >
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => setModalOpen(true)}
        >
          {t("economy:flatmates.postProfileCta")}
        </Button>
        <Button to={routes.forum} variant="ghost-dark" size="lg">
          {t("economy:flatmates.outro.askForum")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Outro>

      {modalOpen && <PostProfileModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
