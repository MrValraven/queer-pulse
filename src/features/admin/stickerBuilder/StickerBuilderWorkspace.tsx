import { useEffect, useId, useRef, useState } from "react";
import { FiAlertCircle, FiLayers, FiPlus, FiRadio } from "react-icons/fi";
import {
  EmptyState,
  SkeletonLine,
  Tabs,
  tabIds,
  tabPanelProps,
  type Tab,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { StickerPackHeader } from "./StickerPackHeader";
import { StickerPackContents } from "./StickerPackContents";
import { StickerTemplateControls } from "./StickerTemplateControls";
import { StickerHeroPreview } from "./StickerHeroPreview";
import { StickerFlagGrid } from "./StickerFlagGrid";
import { StickerPublishDock } from "./StickerPublishDock";
import { NewStickerPackDialog } from "./NewStickerPackDialog";
import { packStateByFlag } from "./stickerFlags";
import type { useStickerPublish } from "./useStickerPublish";
import type {
  StickerBuilderState,
  StickerBuilderTab,
} from "./useStickerBuilderState";
import type { StickerPackActions } from "./useStickerPackActions";
import styles from "./StickerBuilderWorkspace.module.css";

type StickerPublisher = ReturnType<typeof useStickerPublish>;

/**
 * The selected pack's workspace: its header, then two tabs. "Add stickers"
 * pairs the style controls (sticky on wide screens) with the live preview and
 * the flag grid, and docks the publish bar at the bottom of the viewport, so
 * the one filled button on screen is always the one that does the work. "In
 * this pack" manages what the pack already holds; while a run is writing, the
 * dock stays under that tab too (its running phase has no filled button), so
 * the progress and Cancel never drop out of sight.
 */
export function StickerBuilderWorkspace({
  pack,
  state,
  actions,
  publisher,
}: {
  pack: AdminStickerPackResponse;
  state: StickerBuilderState;
  actions: StickerPackActions;
  publisher: StickerPublisher;
}) {
  const { t } = useTranslation();
  const tabsId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);
  // Set only when a button outside the tab row switches tabs (View pack, Add
  // stickers): that button unmounts with its panel, so focus moves to the new
  // tab and the row scrolls into view. Clicking a tab itself leaves both alone.
  const tabToRevealRef = useRef<StickerBuilderTab | null>(null);
  const { activeTab, setActiveTab } = state;

  useEffect(() => {
    if (tabToRevealRef.current !== activeTab) return;
    tabToRevealRef.current = null;
    document
      .getElementById(tabIds(tabsId, activeTab).tab)
      ?.focus({ preventScroll: true });
    tabsRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeTab, tabsId]);

  function revealTab(tab: StickerBuilderTab) {
    tabToRevealRef.current = tab;
    setActiveTab(tab);
  }

  const { run } = publisher;
  const isRunWritingThisPack = Boolean(
    run?.isRunning && run.packId === pack.id,
  );
  const runStateByFlag = run?.packId === pack.id ? run.stateByFlag : null;
  const isDockVisible = activeTab === "add" || Boolean(run?.isRunning);

  // A run that finishes while "In this pack" is open takes the dock away,
  // and with it the Cancel button that may hold focus. Focus then goes back
  // to the active tab instead of falling to the page body.
  const wasDockVisibleRef = useRef(isDockVisible);
  useEffect(() => {
    const wasDockVisible = wasDockVisibleRef.current;
    wasDockVisibleRef.current = isDockVisible;
    if (!wasDockVisible || isDockVisible) return;
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) return;
    document
      .getElementById(tabIds(tabsId, activeTab).tab)
      ?.focus({ preventScroll: true });
  }, [activeTab, isDockVisible, tabsId]);

  function handleViewPack() {
    // The run may belong to a pack the admin has since left.
    if (run && run.packId !== pack.id) state.selectPack(run.packId);
    revealTab("contents");
  }

  const tabs: Tab[] = [
    { id: "add", label: t("admin:stickerPacks.tabs.add") },
    {
      id: "contents",
      label: t("admin:stickerPacks.tabs.contents"),
      count: pack.stickers.length,
    },
  ];

  return (
    <div className={styles.workspace} data-sticker-workspace="">
      <StickerPackHeader
        pack={pack}
        onRename={actions.handleRename}
        onSetStatus={actions.handleSetStatus}
        onDeletePack={actions.handleDeletePack}
        isMutating={actions.isMutatingPack}
        isRunWriting={isRunWritingThisPack}
      />

      <div ref={tabsRef} className={styles.tabRow}>
        <Tabs
          tabs={tabs}
          active={activeTab}
          onChange={(tabId) =>
            setActiveTab(tabId === "contents" ? "contents" : "add")
          }
          variant="underline"
          className={styles.tabs}
          idPrefix={tabsId}
          label={t("admin:stickerPacks.tabs.label", { name: pack.name })}
        />
      </div>

      {activeTab === "add" ? (
        <div {...tabPanelProps(tabsId, "add")} className={styles.panel}>
          <h2 className="visuallyHidden">{t("admin:stickerPacks.tabs.add")}</h2>
          {/* Preview first, then style, then flags: on one column every
              adjustment lands right under the sticker it redraws. */}
          <div className={styles.addColumns}>
            <div className={styles.heroArea}>
              <StickerHeroPreview
                flagId={state.focusedFlagId}
                params={state.params}
                backdrop={state.backdrop}
                onBackdropChange={state.setBackdrop}
              />
            </div>
            <div className={styles.controlsColumn}>
              <StickerTemplateControls
                params={state.params}
                onParamsChange={state.setParams}
                contrastFlagIds={state.selectedFlagIds}
                packStyle={state.packStyle}
                onLoadPackStyle={state.loadPackStyle}
              />
            </div>
            <div className={styles.flagsArea}>
              <StickerFlagGrid
                params={state.params}
                selectedFlagIds={state.selectedFlagIds}
                onSelectedFlagIdsChange={state.setSelectedFlagIds}
                focusedFlagId={state.focusedFlagId}
                onFocusFlag={state.setFocusedFlagId}
                packStates={packStateByFlag(pack)}
                mode={state.mode}
                runStateByFlag={runStateByFlag}
              />
            </div>
          </div>
        </div>
      ) : (
        <div {...tabPanelProps(tabsId, "contents")} className={styles.panel}>
          <StickerPackContents
            pack={pack}
            onSetCover={actions.handleSetCover}
            onRemoveSticker={actions.handleDeleteSticker}
            onReorder={actions.handleReorder}
            onUpdateSticker={actions.handleUpdateSticker}
            onGoToAddStickers={() => revealTab("add")}
            isMutating={actions.isMutatingContents}
          />
        </div>
      )}

      {isDockVisible && (
        <StickerPublishDock
          pack={pack}
          state={state}
          actions={actions}
          publisher={publisher}
          onViewPack={handleViewPack}
        />
      )}
    </div>
  );
}

/** Stands in for the workspace while the pack list loads. */
function WorkspaceSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden>
      <div className={styles.skeletonHeader}>
        <SkeletonLine width={56} height={56} />
        <div className={styles.skeletonText}>
          <SkeletonLine width="40%" height={22} />
          <SkeletonLine width="60%" height={14} />
        </div>
      </div>
      <SkeletonLine width={240} height={36} />
      <div className={styles.skeletonColumns}>
        <SkeletonLine height={420} />
        <SkeletonLine height={420} />
      </div>
    </div>
  );
}

/**
 * What the workspace column shows with no pack to work on: a skeleton while
 * the list loads, the reason when it cannot load (said only here, the rail
 * keeps quiet), else an invitation to create the first pack. With no packs
 * this is the page's one call to action, so its New pack is the filled
 * primary and the rail offers none of its own.
 */
export function StickerWorkspacePlaceholder({
  packs,
  isLoading,
  isError,
  isForbidden,
  isDemo,
  isRetrying,
  onRetry,
  isCreatingPack,
  onCreatePack,
}: {
  packs: AdminStickerPackResponse[];
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  isDemo: boolean;
  /** A retry of a failed load is in flight. */
  isRetrying: boolean;
  onRetry: () => void;
  isCreatingPack: boolean;
  onCreatePack: (body: { slug: string; name: string }) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isDemo) {
    return (
      <EmptyState
        className={styles.placeholder}
        icon={<FiRadio />}
        title={t("admin:stickerPacks.page.demo.title")}
        description={t("admin:stickerPacks.page.demo.body")}
      />
    );
  }
  if (isLoading) return <WorkspaceSkeleton />;
  if (isForbidden) {
    // A retry cannot lift a missing permission, so this one has no button.
    return (
      <EmptyState
        className={styles.placeholder}
        icon={<FiAlertCircle />}
        title={t("admin:stickerPacks.page.error.title")}
        description={t("admin:common.panelForbidden")}
      />
    );
  }
  if (isError) {
    // The button stays put while the retry runs (its label says so), so
    // focus is never dropped on the page body.
    return (
      <EmptyState
        className={styles.placeholder}
        icon={<FiAlertCircle />}
        title={t("admin:stickerPacks.page.error.title")}
        description={t("admin:stickerPacks.page.error.body")}
        action={{
          label: isRetrying
            ? t("admin:stickerPacks.page.error.retrying")
            : t("admin:stickerPacks.page.error.retry"),
          onClick: () => {
            if (!isRetrying) onRetry();
          },
        }}
      />
    );
  }

  return (
    <>
      <EmptyState
        className={styles.placeholder}
        icon={<FiLayers />}
        title={t("admin:stickerPacks.page.empty.title")}
        description={t("admin:stickerPacks.page.empty.body")}
        action={{
          label: (
            <>
              <FiPlus aria-hidden />
              {t("admin:stickerPacks.rail.newCta")}
            </>
          ),
          onClick: () => setIsDialogOpen(true),
        }}
      />
      {isDialogOpen && (
        <NewStickerPackDialog
          packs={packs}
          isCreatingPack={isCreatingPack}
          onCreatePack={onCreatePack}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}
