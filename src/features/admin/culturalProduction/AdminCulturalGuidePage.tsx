import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiArrowLeft, FiBookOpen } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Button, FadeIn, SkeletonLine } from "../../../shared/components/ui";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminEmptyState, AdminPageHeader } from "../ui";
import {
  culturalReasonOf,
  type CulturalGuideDTO,
} from "./api/culturalProduction.types";
import { useCulturalGuide } from "./api/useCulturalGuides";
import { CreateTasksFromGuideDialog } from "./CreateTasksFromGuideDialog";
import { culturalTabHref } from "./culturalProductionPaths";
import { CulturalLoadError } from "./CulturalLoadError";
import { GuideEditor } from "./GuideEditor";
import { GuidePageHeader } from "./GuidePageHeader";
import { GuideReadView } from "./GuideReadView";
import { isEditingFromRouterState } from "./guidesTab.data";
import styles from "./GuidePage.module.css";

const PAGE_PREFIX = "admin:culturalProduction.guides.page";

/** The admin chrome around one guide: "Admin / Cultural Production /
 *  <guide title>" in the topbar, with Cultural Production back on the
 *  Guides tab and the Guides tab label as the title until the guide loads,
 *  and "Back to guides" above the body, which stays put while the body
 *  swaps. It reads the guide from the same query as the body. */
function GuideFrame({
  guideId,
  children,
}: {
  guideId: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { data: guide } = useCulturalGuide(guideId);
  const guidesHref = culturalTabHref("guides");
  return (
    <AdminShell
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        { label: t("admin:culturalProduction.title"), to: guidesHref },
      ]}
      title={guide?.title ?? t("admin:culturalProduction.tabs.guides")}
    >
      <Link to={guidesHref} className={styles.backLink}>
        <FiArrowLeft aria-hidden />
        {t(`${PAGE_PREFIX}.backCta`)}
      </Link>
      {children}
    </AdminShell>
  );
}

/** A state with no guide to name heads the page with the section's title. */
function GuideStateHeader() {
  const { t } = useTranslation();
  return <AdminPageHeader title={t("admin:culturalProduction.title")} />;
}

function GuideSkeleton() {
  return (
    <div className={styles.skeletonPage} aria-busy="true">
      <SkeletonLine width="22%" height={14} />
      <SkeletonLine width="46%" height={36} />
      <SkeletonLine width="64%" height={16} />
      <SkeletonLine height={180} />
      <SkeletonLine height={140} />
    </div>
  );
}

/** One guide, read first; Edit guide swaps the read view for the editor
 *  in place, and Create tasks for an event opens its dialog. */
function GuideContent({
  guide,
  isInitiallyEditing,
}: {
  guide: CulturalGuideDTO;
  isInitiallyEditing: boolean;
}) {
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  // Set when the editor closes, so focus lands back on Edit guide once the
  // read view's actions have mounted, and the editor's controls never leave
  // focus on the body.
  const shouldRestoreEditFocusRef = useRef(false);

  useEffect(() => {
    if (isEditing || !shouldRestoreEditFocusRef.current) return;
    shouldRestoreEditFocusRef.current = false;
    editButtonRef.current?.focus();
  }, [isEditing]);

  const closeEditor = () => {
    shouldRestoreEditFocusRef.current = true;
    setIsEditing(false);
  };

  return (
    <div className={styles.page}>
      <GuidePageHeader
        guide={guide}
        isEditing={isEditing}
        editButtonRef={editButtonRef}
        onEdit={() => setIsEditing(true)}
        onCreateTasks={() => setIsCreatingTasks(true)}
      />
      <div className={styles.viewStage}>
        <AnimatePresence mode="popLayout" initial={false}>
          {isEditing ? (
            <ViewFade key="edit">
              <GuideEditor guide={guide} onDone={closeEditor} />
            </ViewFade>
          ) : (
            <ViewFade key="read">
              <GuideReadView guide={guide} />
            </ViewFade>
          )}
        </AnimatePresence>
      </div>
      {isCreatingTasks && (
        <CreateTasksFromGuideDialog
          guide={guide}
          onClose={() => setIsCreatingTasks(false)}
        />
      )}
    </div>
  );
}

function GuideBody({
  guideId,
  isInitiallyEditing,
}: {
  guideId: string;
  isInitiallyEditing: boolean;
}) {
  const { t } = useTranslation();
  const {
    data: guide,
    error,
    isError,
    isFetching,
    refetch,
  } = useCulturalGuide(guideId);

  // "Not found" wins over a guide still in the cache: a write refused
  // because the guide was deleted elsewhere reads it again, and lands here.
  if (culturalReasonOf(error) === "CULTURAL_GUIDE_NOT_FOUND") {
    return (
      <FadeIn key="notFound" className={styles.statePage}>
        <GuideStateHeader />
        <AdminEmptyState
          icon={FiBookOpen}
          title={t(`${PAGE_PREFIX}.notFound.title`)}
          body={t(`${PAGE_PREFIX}.notFound.body`)}
          action={
            <Button to={culturalTabHref("guides")}>
              {t(`${PAGE_PREFIX}.backCta`)}
            </Button>
          }
        />
      </FadeIn>
    );
  }
  if (guide) {
    return (
      <FadeIn key={`guide-${guide.id}`}>
        <GuideContent guide={guide} isInitiallyEditing={isInitiallyEditing} />
      </FadeIn>
    );
  }
  if (isError) {
    return (
      <FadeIn key="error" className={styles.statePage}>
        <GuideStateHeader />
        <CulturalLoadError
          error={error}
          isRetrying={isFetching}
          onRetry={() => void refetch()}
          titleKey={`${PAGE_PREFIX}.loadError.title`}
          retryKey={`${PAGE_PREFIX}.loadError.retryCta`}
        />
      </FadeIn>
    );
  }
  return (
    <FadeIn key="loading">
      <GuideSkeleton />
    </FadeIn>
  );
}

/**
 * One guide (`/admin/cultural-production/guides/:guideId`): how a kind of
 * event is run, as a document with a contents list, each section's text
 * and its checklist. The add dialog opens a new guide here in its editor
 * (router state `{ isEditing: true }`). The state is read once per guide,
 * kept with the guide id it was read for, and then cleared, so a reload
 * or a move to another guide opens the read view.
 */
export function AdminCulturalGuidePage() {
  const { guideId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [openedGuide, setOpenedGuide] = useState(() => ({
    guideId,
    isEditing: isEditingFromRouterState(location.state),
  }));
  // A move to another guide on the same route reads that guide's router
  // state, before the effect below clears it.
  if (openedGuide.guideId !== guideId) {
    setOpenedGuide({
      guideId,
      isEditing: isEditingFromRouterState(location.state),
    });
  }
  const isInitiallyEditing =
    openedGuide.guideId === guideId && openedGuide.isEditing;

  useEffect(() => {
    if (!isEditingFromRouterState(location.state)) return;
    void navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
  }, [location.pathname, location.search, location.state, navigate]);

  return (
    <GuideFrame guideId={guideId}>
      <GuideBody
        key={guideId}
        guideId={guideId}
        isInitiallyEditing={isInitiallyEditing}
      />
    </GuideFrame>
  );
}
