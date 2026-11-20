import { useState } from "react";
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
import styles from "./Ideas.module.css";

const IDEAS_PREFIX = "admin:culturalProduction.ideas";
const SKELETON_CARD_KEYS = ["first", "second", "third"] as const;

/** One card of the grid, faded and lifted in and out. */
function IdeaGridItem({
  idea,
  onOpen,
}: {
  idea: CulturalIdeaListItemDTO;
  onOpen: (ideaId: string) => void;
}) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.li
      layout={isReducedMotion ? false : "position"}
      className={styles.gridItem}
      inert={!isPresent || undefined}
      initial={{ opacity: 0, y: isReducedMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isReducedMotion ? 0 : 0.2 }}
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
 * filled views swap with a fade; cards added or removed in place fade in and
 * out. A new idea opens in its drawer once it is added.
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

  const viewKey =
    shownIdeas === null
      ? ideasQuery.isError
        ? "error"
        : "loading"
      : allIdeas?.length === 0
        ? "empty"
        : shownIdeas.length === 0
          ? "emptyFiltered"
          : `list-${url.ideaStatus ?? "all"}-${url.eventType ?? "all"}`;

  function renderView() {
    if (viewKey === "loading") return <IdeasSkeleton />;
    if (viewKey === "error")
      return (
        <CulturalLoadError
          error={ideasQuery.error}
          isRetrying={ideasQuery.isFetching}
          onRetry={() => void ideasQuery.refetch()}
          titleKey={`${IDEAS_PREFIX}.loadError.title`}
          retryKey={`${IDEAS_PREFIX}.loadError.retryCta`}
        />
      );
    if (viewKey === "empty")
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
    if (viewKey === "emptyFiltered")
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
        <AnimatePresence initial={false}>
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
