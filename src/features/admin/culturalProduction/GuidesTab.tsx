import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiBookOpen, FiPlus } from "react-icons/fi";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { FadeListItem, ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState, AdminToolbar } from "../ui";
import { useCulturalGuides } from "./api/useCulturalGuides";
import { CulturalLoadError } from "./CulturalLoadError";
import { GuideCard } from "./GuideCard";
import { GuideFormDialog } from "./GuideFormDialog";
import {
  GUIDE_SKELETON_CARD_COUNT,
  sortGuidesForLanguage,
} from "./guidesTab.data";
import styles from "./Guides.module.css";

const GUIDES_PREFIX = "admin:culturalProduction.guides";

type GuidesViewName = "loading" | "error" | "empty" | "list";

/** The card outlines the tab shows while the guides load. */
function GuidesSkeleton() {
  return (
    <ul className={styles.grid} aria-busy="true">
      {Array.from({ length: GUIDE_SKELETON_CARD_COUNT }, (_, index) => (
        <li key={index} className={styles.skeletonCard}>
          <SkeletonLine width="40%" height={20} />
          <SkeletonLine width="64%" height={26} />
          <SkeletonLine height={16} />
          <SkeletonLine width="52%" height={14} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The Guides tab: how each kind of event is run, one card per guide, the
 * viewer's app language first. "Add guide" opens the add dialog, which
 * opens the new guide's page in its editor. The list swaps between its
 * loading, failed, empty and filled views with one fade while the panel
 * eases to the new height.
 */
export function GuidesTab() {
  const { t, language } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const { data, error, isError, isFetching, refetch } = useCulturalGuides();
  const guides = data ? sortGuidesForLanguage(data.items, language) : [];
  const viewName: GuidesViewName = data
    ? guides.length === 0
      ? "empty"
      : "list"
    : isError
      ? "error"
      : "loading";

  const addButton = (
    <Button size="sm" onClick={() => setIsAdding(true)}>
      <FiPlus aria-hidden />
      {t(`${GUIDES_PREFIX}.addCta`)}
    </Button>
  );

  return (
    <div className={styles.tab}>
      <AdminToolbar
        label={t(`${GUIDES_PREFIX}.toolbarLabel`)}
        end={addButton}
        className={styles.toolbar}
      >
        {null}
      </AdminToolbar>
      <MeasuredHeightFrame>
        <div className={styles.viewStage}>
          <AnimatePresence mode="popLayout" initial={false}>
            <ViewFade key={viewName}>
              {viewName === "loading" && <GuidesSkeleton />}
              {viewName === "error" && (
                <CulturalLoadError
                  error={error}
                  isRetrying={isFetching}
                  onRetry={() => void refetch()}
                  titleKey={`${GUIDES_PREFIX}.loadError.title`}
                  retryKey={`${GUIDES_PREFIX}.loadError.retryCta`}
                />
              )}
              {viewName === "empty" && (
                <AdminEmptyState
                  icon={FiBookOpen}
                  title={t(`${GUIDES_PREFIX}.empty.title`)}
                  body={t(`${GUIDES_PREFIX}.empty.body`)}
                />
              )}
              {viewName === "list" && (
                <ul className={styles.grid}>
                  <AnimatePresence initial={false}>
                    {guides.map((guide) => (
                      <FadeListItem key={guide.id}>
                        <GuideCard guide={guide} />
                      </FadeListItem>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </ViewFade>
          </AnimatePresence>
        </div>
      </MeasuredHeightFrame>
      {isAdding && <GuideFormDialog onClose={() => setIsAdding(false)} />}
    </div>
  );
}
