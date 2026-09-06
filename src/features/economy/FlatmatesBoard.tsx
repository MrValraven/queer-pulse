import { useMemo, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  FeatureHelp,
  LoadErrorState,
  Outro,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  budgetCeilingFor,
  matchesBudget,
  type ListingType,
} from "./flatmates.data";
import { useFlatmateProfiles } from "./api/useFlatmateProfiles";
import { FlatmateDiscovery } from "./FlatmateDiscovery";
import { FlatmatesFilterBar } from "./FlatmatesFilterBar";
import { FlatmatesGrid } from "./FlatmatesGrid";
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

  // Send every filter the directory understands to the server, so live results
  // are filtered and match-ranked across the whole board rather than within
  // whatever happened to land on page one. `budgetMax` is a ceiling, so the
  // server answers with a superset that `matchesBudget` below narrows to the
  // chosen band; move-in stays client-side (its options are month keys the API
  // has no equivalent for).
  const serverFilters = useMemo(
    () => ({
      type: type === "all" ? undefined : type,
      neighbourhood: neighbourhood === "all" ? undefined : neighbourhood,
      budgetMax: budgetCeilingFor(budget),
      tags: tags.length > 0 ? tags : undefined,
    }),
    [type, neighbourhood, budget, tags],
  );
  const {
    profiles: source,
    isFetching,
    isError: hasProfilesError,
    refetch: refetchProfiles,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFlatmateProfiles(serverFilters);
  // Skeleton while the simulated demo beat runs OR (live) the query is in
  // flight — otherwise a slow live fetch flashes the empty-board CTA. A
  // "Load more" fetch keeps the loaded cards on screen instead.
  //
  // `useSimulatedLoad` is a DEMO device (ENG-172). Demo profiles resolve from a
  // local registry in the same tick, so the short fake beat is the only thing
  // keeping the board from popping in. Live mode has a real loading state, and
  // the fake 600ms sat on top of it, painting a skeleton over profiles that had
  // already arrived, so it is gated to demo mode.
  const isSimulatedLoading = useSimulatedLoad();
  const loading = demoMode
    ? isSimulatedLoading
    : isFetching && !isFetchingNextPage;
  const isAnyFilterActive =
    type !== "all" ||
    neighbourhood !== "all" ||
    budget !== "all" ||
    movein !== "all" ||
    tags.length > 0;
  // With nothing on the board, the filters have nothing to act on — hide them
  // and let the empty state carry the single call to action. A filtered search
  // that comes back empty is a different state (the server now does the
  // filtering, so an empty result no longer means an empty board) and keeps the
  // filter bar plus its own "clear filters" empty state.
  const boardEmpty = source.length === 0 && !isAnyFilterActive;

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

  // A failed fetch leaves `source` empty, which the board would otherwise read
  // as "nobody has posted a profile yet" and answer with the post-your-profile
  // CTA. Say the board could not load, and offer a retry instead (DES-22).
  if (hasProfilesError && !loading) {
    return (
      <div className={styles.body}>
        <div className="wrap">
          <LoadErrorState
            title={t("economy:flatmates.loadError.title")}
            description={t("economy:flatmates.loadError.description")}
            onRetry={() => void refetchProfiles()}
          />
        </div>
      </div>
    );
  }

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
            <FlatmatesGrid
              loading={loading}
              boardEmpty={boardEmpty}
              profiles={filtered}
              sentIds={sent}
              onSayHello={(profileId) =>
                setSent((prev) => new Set(prev).add(profileId))
              }
              onPostProfile={() => setModalOpen(true)}
              onClearFilters={clearFilters}
            />
          )}

          {!loading && !boardEmpty && hasNextPage && (
            <div className={styles.loadMoreRow}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {t(
                  isFetchingNextPage
                    ? "economy:flatmates.loadingMore"
                    : "economy:flatmates.loadMore",
                )}
              </Button>
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
          {t("economy:flatmates.outro.askForum")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>

      {modalOpen && <PostProfileModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
