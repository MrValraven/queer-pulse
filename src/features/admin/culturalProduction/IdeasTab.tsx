import { type Ref, useState } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiFilter, FiPlus, FiZap } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { Button, Collapse, SkeletonCard } from "../../../shared/components/ui";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState } from "../ui";
import type { CulturalIdeaListItemDTO } from "./api/culturalProduction.types";
import { useCulturalIdeas } from "./api/useCulturalIdeas";
import { CulturalLoadError } from "./CulturalLoadError";
import { IdeaCard } from "./IdeaCard";
import { IdeaFormDialog } from "./IdeaFormDialog";
import { IdeasToolbar } from "./IdeasToolbar";
import { useCulturalProductionUrl } from "./useCulturalProductionUrl";
import { useEntranceViewKey } from "./useEntranceViewKey";
import styles from "./Ideas.module.css";

const IDEAS_PREFIX = "admin:culturalProduction.ideas";
const SKELETON_CARD_KEYS = ["first", "second", "third"] as const;

/** The card timings match the panel's view fade (ViewFade): a leaving card
 *  clears quickly, an entering one starts as the leaving one is mostly gone,
 *  and the cards that stay glide to their new cells with the grid's height. */
const CARD_FADE_OUT_SECONDS = 0.14;
const CARD_FADE_IN_SECONDS = 0.22;
const CARD_FADE_IN_DELAY_SECONDS = 0.06;
const CARD_GLIDE_SECONDS = 0.25;
const CARD_EASE = [0.22, 0.68, 0.16, 1] as const;

type IdeasViewKind = "loading" | "error" | "empty" | "emptyFiltered" | "list";

/** One card of the grid. A filter change fades the cards it adds in and the
 *  ones it drops out (lifted out of the grid, so the rest move at once), and
 *  the cards that stay glide to their new cells. */
function IdeaGridItem({
  idea,
  onOpen,
  ref,
}: {
  idea: CulturalIdeaListItemDTO;
  onOpen: (ideaId: string) => void;
  /** `AnimatePresence mode="popLayout"` measures a leaving card through
   *  this ref. */
  ref?: Ref<HTMLLIElement>;
}) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.li
      ref={ref}
      layout={isReducedMotion ? false : "position"}
      className={styles.gridItem}
      inert={!isPresent || undefined}
      initial={{ opacity: 0, y: isReducedMotion ? 0 : 6 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: isReducedMotion ? 0 : CARD_FADE_IN_SECONDS,
          delay: isReducedMotion ? 0 : CARD_FADE_IN_DELAY_SECONDS,
          ease: CARD_EASE,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: isReducedMotion ? 0 : CARD_FADE_OUT_SECONDS,
          ease: CARD_EASE,
        },
      }}
      transition={{
        layout: {
          duration: isReducedMotion ? 0 : CARD_GLIDE_SECONDS,
          ease: CARD_EASE,
        },
      }}
    >
      <IdeaCard idea={idea} onOpen={onOpen} />
    </m.li>
  );
}

/** Card-shaped placeholders while the ideas load. */
function IdeasSkeleton() {
  return (
    <ul className={styles.grid} aria-hidden>
      {SKELETON_CARD_KEYS.map((skeletonKey) => (
        <li key={skeletonKey} className={styles.gridItem}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  );
}

/**
 * The Ideas tab: the filter bar, then the card grid of the ideas the
 * filters keep, newest first. The loading, failed, empty, filtered-empty and
 * filled views swap with a fade, keyed by the kind of view alone: a filter
 * change keeps the grid mounted, so only the cards it adds or drops fade,
 * and the grid's height eases once. Ideas that land while the tab is still
 * fading in take the loading view's place under that fade
 * (`useEntranceViewKey`). A new idea opens in its drawer once it is added.
 */
export function IdeasTab({
  onOpenIdea,
}: {
  onOpenIdea: (ideaId: string) => void;
}) {
  const { t } = useTranslation();
  const url = useCulturalProductionUrl();
  const ideasQuery = useCulturalIdeas();
  const [isAdding, setIsAdding] = useState(false);
  const allIdeas = ideasQuery.data?.items ?? null;
  const shownIdeas =
    allIdeas?.filter(
      (idea) =>
        (url.ideaStatus === null || idea.status === url.ideaStatus) &&
        (url.eventType === null || idea.eventType === url.eventType),
    ) ?? null;
  const openAdd = () => setIsAdding(true);

  const viewKind: IdeasViewKind =
    shownIdeas === null
      ? ideasQuery.isError
        ? "error"
        : "loading"
      : allIdeas?.length === 0
        ? "empty"
        : shownIdeas.length === 0
          ? "emptyFiltered"
          : "list";
  const viewKey = useEntranceViewKey(viewKind);

  function renderView() {
    if (viewKind === "loading") return <IdeasSkeleton />;
    if (viewKind === "error")
      return (
        <CulturalLoadError
          error={ideasQuery.error}
          isRetrying={ideasQuery.isFetching}
          onRetry={() => void ideasQuery.refetch()}
          titleKey={`${IDEAS_PREFIX}.loadError.title`}
          retryKey={`${IDEAS_PREFIX}.loadError.retryCta`}
        />
      );
    if (viewKind === "empty")
      return (
        <AdminEmptyState
          icon={FiZap}
          title={t(`${IDEAS_PREFIX}.empty.title`)}
          body={t(`${IDEAS_PREFIX}.empty.body`)}
          action={
            <Button onClick={openAdd}>
              <FiPlus aria-hidden />
              {t(`${IDEAS_PREFIX}.addCta`)}
            </Button>
          }
        />
      );
    if (viewKind === "emptyFiltered")
      return (
        <AdminEmptyState
          icon={FiFilter}
          title={t(`${IDEAS_PREFIX}.emptyFiltered.title`)}
          action={
            <Button onClick={() => url.clearIdeaFilters()}>
              {t(`${IDEAS_PREFIX}.clearFilters`)}
            </Button>
          }
        />
      );
    return (
      <ul className={styles.grid}>
        <AnimatePresence mode="popLayout" initial={false}>
          {(shownIdeas ?? []).map((idea) => (
            <IdeaGridItem key={idea.id} idea={idea} onOpen={onOpenIdea} />
          ))}
        </AnimatePresence>
      </ul>
    );
  }

  return (
    <div className={styles.tab}>
      <IdeasToolbar
        url={url}
        shownCount={shownIdeas === null ? null : shownIdeas.length}
        onAdd={openAdd}
      />
      <MeasuredHeightFrame>
        <div className={styles.viewStage}>
          <AnimatePresence mode="popLayout" initial={false}>
            <ViewFade key={viewKey}>{renderView()}</ViewFade>
          </AnimatePresence>
        </div>
      </MeasuredHeightFrame>
      <Collapse isOpen={ideasQuery.data?.isTruncated === true}>
        <p className={styles.truncated}>{t(`${IDEAS_PREFIX}.truncated`)}</p>
      </Collapse>
      <AnimatePresence>
        {isAdding ? (
          <IdeaFormDialog
            key="add-idea"
            mode="add"
            onClose={() => setIsAdding(false)}
            onCreated={(idea) => onOpenIdea(idea.id)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
