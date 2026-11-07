import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import {
  EmptyState,
  FadeIn,
  SkeletonLine,
  tabPanelProps,
} from "../../shared/components/ui";
import type { VjClipDTO, VjPackDTO } from "../../shared/contracts/vj";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../admin/ui/AdminPageHeader";
import { useVjClips } from "./api/useVjClips";
import { useVjDemoLibrarySync } from "./api/useVjDemoLibrarySync";
import { useVjPackClips } from "./api/useVjPackClips";
import { useVjPacks } from "./api/useVjPacks";
import { VjClipGrid } from "./library/VjClipGrid";
import { VjLibraryActions } from "./library/VjLibraryActions";
import { VjPackHeader } from "./library/VjPackHeader";
import { VjPackList } from "./library/VjPackList";
import { VjPackManageSheet } from "./library/VjPackManageSheet";
import { VjPackPicker } from "./library/VjPackPicker";
import { VjPreviewBackfillPanel } from "./library/VjPreviewBackfillPanel";
import { VjUploadRows } from "./library/VjUploadRows";
import { VjUploadZone } from "./library/VjUploadZone";
import {
  VJ_LIBRARY_VIEW_TABS_ID,
  VjLibraryViewTabs,
} from "./library/VjLibraryViewTabs";
import { VjShowLibrary } from "./library/show/VjShowLibrary";
import { useVjLibrarySelection } from "./library/useVjLibrarySelection";
import {
  useVjLibraryView,
  type VjLibraryView,
} from "./library/useVjLibraryView";
import {
  useVjClipUploads,
  vjPreviewingClipIdsOf,
  type VjClipUploads,
} from "./upload/useVjClipUploads";
import {
  useVjPreviewBackfill,
  type VjPreviewBackfill,
} from "./upload/useVjPreviewBackfill";
import { useVjUploadLeaveGuard } from "./upload/useVjUploadLeaveGuard";
import { vjErrorKeyOf } from "./vjErrors";
import css from "./AdminVj.module.css";

/** The `.frame` width at which the packs rail sits beside the main column
 *  (the `@container` rule in `AdminVj.module.css` uses the same number). */
const VJ_WIDE_FRAME_MIN_PX = 880;
const FADE_SECONDS = 0.18;
const SKELETON_CARD_COUNT = 6;
const SKELETON_PACK_ROW_COUNT = 4;

/**
 * True while the library frame is wide enough for the packs rail. Measured
 * before paint; a frame with no width yet (not laid out) keeps the last
 * answer, so the rail is the starting layout.
 */
function useIsVjFrameWide(frameRef: RefObject<HTMLDivElement | null>): boolean {
  const [isWide, setIsWide] = useState(true);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const apply = (width: number) => {
      if (width > 0) setIsWide(width >= VJ_WIDE_FRAME_MIN_PX);
    };
    apply(frame.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) apply(entry.contentRect.width);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frameRef]);
  return isWide;
}

/** Fades its content in and out. A skeleton passes `isExitInstant` so it
 *  leaves at once and the content fades in with no blank frame between. */
function VjFade({
  children,
  isExitInstant = false,
}: {
  children: ReactNode;
  isExitInstant?: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: isExitInstant ? { duration: 0 } : undefined,
      }}
      transition={{ duration: reducedMotion ? 0 : FADE_SECONDS }}
    >
      {children}
    </m.div>
  );
}

function VjLoadError({
  error,
  isRetrying,
  onRetry,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertCircle aria-hidden />}
      title={t("vj:page.loadErrorTitle")}
      description={<span role="alert">{t(vjErrorKeyOf(error))}</span>}
      headingLevel={2}
      action={{
        label: t("vj:page.retryCta"),
        onClick: isRetrying ? undefined : onRetry,
        isBusy: isRetrying,
      }}
    />
  );
}

/** The loading look of the open section: the Clips layout (rail, header,
 *  grid), or the Scenes and set lists rows. */
function VjLibrarySkeleton({ view }: { view: VjLibraryView }) {
  if (view === "show") {
    return (
      <div className={css.skeletonShow} aria-hidden>
        {Array.from({ length: SKELETON_PACK_ROW_COUNT }, (_, rowIndex) => (
          <SkeletonLine key={rowIndex} height={56} />
        ))}
      </div>
    );
  }
  return (
    <div className={css.frame} aria-hidden>
      <div className={css.body}>
        <div className={css.rail}>
          <div className={css.skeletonRows}>
            {Array.from({ length: SKELETON_PACK_ROW_COUNT }, (_, rowIndex) => (
              <SkeletonLine key={rowIndex} height={44} />
            ))}
          </div>
        </div>
        <div className={css.main}>
          <SkeletonLine width="40%" height={28} />
          <SkeletonLine height={96} />
          <div className={css.skeletonGrid}>
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, cardIndex) => (
              <SkeletonLine key={cardIndex} height={140} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * True once the library can show in full: the packs are in and, in the Clips
 * section, the open view's clips have settled (an error counts, so the grid's
 * error shows). The page skeleton covers both loads, and the clips query is
 * in the cache when the grid mounts. Once true it stays true, so a later pack
 * switch shows the grid's own skeleton.
 */
function useIsVjLibraryReady(
  packs: VjPackDTO[] | undefined,
  view: VjLibraryView,
): boolean {
  const [hasShownLibrary, setHasShownLibrary] = useState(false);
  const { selectedPackId } = useVjLibrarySelection(packs);
  const libraryClips = useVjClips();
  const packClips = useVjPackClips(selectedPackId);
  const openViewQuery = selectedPackId === null ? libraryClips : packClips;
  const isOpenViewSettled = view !== "clips" || !openViewQuery.isPending;
  const isReady = packs !== undefined && (hasShownLibrary || isOpenViewSettled);
  if (isReady && !hasShownLibrary) setHasShownLibrary(true);
  return isReady;
}

/** The clips of the open view: the pack's clips in pack order, or every clip
 *  newest first for All clips. */
function useVjViewClips(selectedPackId: string | null) {
  const libraryClips = useVjClips();
  const packClips = useVjPackClips(selectedPackId);
  const viewQuery = selectedPackId === null ? libraryClips : packClips;
  const clips: VjClipDTO[] =
    selectedPackId === null
      ? (libraryClips.data ?? [])
      : (packClips.data?.items ?? []);
  return {
    clips,
    libraryClipCount: libraryClips.data?.length ?? null,
    isLoading: viewQuery.isPending,
    isError: viewQuery.isError,
    error: viewQuery.error,
    isRetrying: viewQuery.isFetching,
    retry: () => void viewQuery.refetch(),
  };
}

function VjLibraryMain({
  packs,
  selectedPack,
  uploads,
  backfill,
  onPackDeleted,
}: {
  packs: VjPackDTO[];
  selectedPack: VjPackDTO | null;
  uploads: VjClipUploads;
  backfill: VjPreviewBackfill;
  onPackDeleted: (packId: string) => void;
}) {
  const selectedPackId = selectedPack?.id ?? null;
  const view = useVjViewClips(selectedPackId);
  // Make previews runs library wide, so its rows name clips of every pack.
  const libraryClips = useVjClips().data;
  const clipsById = useMemo(
    () =>
      new Map<string, VjClipDTO>(
        (libraryClips ?? []).map((clip) => [clip.id, clip]),
      ),
    [libraryClips],
  );
  const packNameOf = (packId: string | null) =>
    packs.find((pack) => pack.id === packId)?.name ?? null;

  return (
    <div className={css.main}>
      <VjPackHeader
        pack={selectedPack}
        libraryClipCount={view.libraryClipCount}
        onPackDeleted={onPackDeleted}
      />
      <VjPreviewBackfillPanel backfill={backfill} clipsById={clipsById} />
      <VjUploadZone
        uploads={uploads}
        packId={selectedPackId}
        packName={selectedPack?.name ?? null}
      />
      <VjUploadRows uploads={uploads} packNameOf={packNameOf} />
      <AnimatePresence mode="wait" initial={false}>
        {view.isError ? (
          <VjFade key="clips-error">
            <VjLoadError
              error={view.error}
              isRetrying={view.isRetrying}
              onRetry={view.retry}
            />
          </VjFade>
        ) : (
          <VjFade key="clips">
            <VjClipGrid
              packId={selectedPackId}
              packName={selectedPack?.name ?? null}
              clips={view.clips}
              packs={packs}
              isLoading={view.isLoading}
            />
          </VjFade>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The Clips section: the packs rail (or the phone pack picker and its
 *  manage sheet) beside the pack header, Make previews, uploads and the grid. */
function VjClipsView({
  packs,
  uploads,
  backfill,
}: {
  packs: VjPackDTO[];
  uploads: VjClipUploads;
  backfill: VjPreviewBackfill;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const isFrameWide = useIsVjFrameWide(frameRef);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const { selectedPackId, select } = useVjLibrarySelection(packs);
  const libraryClipCount = useVjClips().data?.length ?? null;
  const selectedPack = packs.find((pack) => pack.id === selectedPackId) ?? null;

  // The rail replaces the sheet once the frame widens.
  if (isFrameWide && isManageOpen) setIsManageOpen(false);

  const listProps = {
    packs,
    selectedPackId,
    libraryClipCount,
    onSelect: select,
  };
  const handlePackDeleted = (deletedPackId: string) => {
    const remainingPack = packs.find((pack) => pack.id !== deletedPackId);
    select(remainingPack?.id ?? null);
  };

  return (
    <div ref={frameRef} className={css.frame}>
      <div className={css.body}>
        {isFrameWide ? (
          <div className={css.rail}>
            <VjPackList {...listProps} />
          </div>
        ) : (
          <VjPackPicker {...listProps} onManage={() => setIsManageOpen(true)} />
        )}
        <VjLibraryMain
          packs={packs}
          selectedPack={selectedPack}
          uploads={uploads}
          backfill={backfill}
          onPackDeleted={handlePackDeleted}
        />
      </div>
      <AnimatePresence>
        {!isFrameWide && isManageOpen && (
          <VjPackManageSheet
            {...listProps}
            onClose={() => setIsManageOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The open section's panel, faded over the other on a switch. Uploads and a
 * Make previews run live on the page, so they carry on behind Scenes and set
 * lists and their rows are there again on the way back.
 */
function VjLibraryBody({
  view,
  packs,
  uploads,
  backfill,
}: {
  view: VjLibraryView;
  packs: VjPackDTO[];
  uploads: VjClipUploads;
  backfill: VjPreviewBackfill;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === "show" ? (
        <VjFade key="show">
          <div
            {...tabPanelProps(VJ_LIBRARY_VIEW_TABS_ID, "show")}
            className={css.panel}
          >
            <VjShowLibrary packs={packs} />
          </div>
        </VjFade>
      ) : (
        <VjFade key="clips">
          <div
            {...tabPanelProps(VJ_LIBRARY_VIEW_TABS_ID, "clips")}
            className={css.panel}
          >
            <VjClipsView packs={packs} uploads={uploads} backfill={backfill} />
          </div>
        </VjFade>
      )}
    </AnimatePresence>
  );
}

/**
 * The VJ library (`/admin/vj`, Admin or `vj_operator`): packs, the clip grid,
 * uploads and clip edits in the Clips section, scenes and set lists in the other
 * (`?view=show`), with Open screen and Open remote in the header. It attaches
 * to no socket; live reads again on mount and focus, demo follows other tabs'
 * writes through `useVjDemoLibrarySync`. Uploads and Make previews live here
 * so their rows survive a pack or section switch, and leaving while either
 * runs asks first.
 */
export function AdminVjPage() {
  const { t } = useTranslation();
  const packsQuery = useVjPacks();
  const uploads = useVjClipUploads();
  const backfill = useVjPreviewBackfill(
    useVjClips().data,
    vjPreviewingClipIdsOf(uploads.rows),
  );
  const { view, select: selectView } = useVjLibraryView();
  // Leaving unmounts the queues and stops their work, so leaving asks first.
  useVjUploadLeaveGuard({
    hasPendingUploads: uploads.isBusy,
    isMakingPreviews: backfill.isRunning,
  });
  useVjDemoLibrarySync();
  const packs = packsQuery.data;
  const isLibraryReady = useIsVjLibraryReady(packs, view);

  return (
    <AdminShell
      title={t("vj:page.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:common.adminBreadcrumb")}
          title={t("vj:page.title")}
          sub={t("vj:page.intro")}
          actions={<VjLibraryActions />}
        />
      </FadeIn>
      <div className={css.page}>
        <VjLibraryViewTabs
          className={css.tabs}
          view={view}
          onChange={selectView}
        />
        <AnimatePresence mode="wait" initial={false}>
          {packs && isLibraryReady ? (
            <VjFade key="library">
              <VjLibraryBody
                view={view}
                packs={packs}
                uploads={uploads}
                backfill={backfill}
              />
            </VjFade>
          ) : !packs && packsQuery.isError ? (
            <VjFade key="error">
              <VjLoadError
                error={packsQuery.error}
                isRetrying={packsQuery.isFetching}
                onRetry={() => void packsQuery.refetch()}
              />
            </VjFade>
          ) : (
            <VjFade key="loading" isExitInstant>
              <VjLibrarySkeleton view={view} />
            </VjFade>
          )}
        </AnimatePresence>
      </div>
    </AdminShell>
  );
}
