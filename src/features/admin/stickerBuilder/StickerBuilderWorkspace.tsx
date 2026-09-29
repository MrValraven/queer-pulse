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
import { StickerHeroPreview } from "./StickerHeroPreview";
import { StickerItemGrid } from "./StickerItemGrid";
import { StickerPublishDock } from "./StickerPublishDock";
import { NewStickerPackDialog } from "./NewStickerPackDialog";
import { BUILDER_TEMPLATES } from "./templates/builderTemplates";
import { StickerTemplatePicker } from "./templates/StickerTemplatePicker";
import { packStateByItem } from "./stickerItems";
import { summarizeRun, type useStickerPublish } from "./useStickerPublish";
import type {
  StickerBuilderState,
  StickerBuilderTab,
} from "./useStickerBuilderState";
import type { StickerPackActions } from "./useStickerPackActions";
import styles from "./StickerBuilderWorkspace.module.css";

type StickerPublisher = ReturnType<typeof useStickerPublish>;

/**
 * The selected pack's workspace: its header, then two tabs. "Add stickers"
 * pairs the template picker and style controls (sticky on wide screens) with
 * the live preview and the item grid, and docks the publish bar at the
 * bottom of the viewport, so the one filled button on screen is always the
 * one that does the work. "In this pack" manages what the pack already
 * holds; while a run is writing, the dock stays under that tab too (its
 * running phase has no filled button), so the progress and Cancel never drop
 * out of sight.
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

  const { Controls: TemplateControls } = BUILDER_TEMPLATES[state.template.id];
  const { run } = publisher;
  const isRunWritingThisPack = Boolean(
    run?.isRunning && run.packId === pack.id,
  );
  // A run's tiles and retries belong to the template it was drawn with, so
  // they show only while the builder is on that same template.
  const runStateByItem =
    run?.packId === pack.id && run.templateId === state.template.id
      ? run.stateByItem
      : null;
  // While this pack's run is writing, or its finished run still has failed
  // items to retry, the template stays put: Retry failed redraws with the
  // run's own template, and the grid keeps showing that run's states.
  const hasFailedRunOnThisPack =
    run?.packId === pack.id && summarizeRun(run).failedCount > 0;
  // The run's own template only, so a run left writing an empty pack under
  // one template never locks a different template the admin later shows for
  // that same pack.
  const isRunOnShownTemplate = run?.templateId === state.template.id;
  const isDockVisible = activeTab === "add" || Boolean(run?.isRunning);

  // A run that finishes while "In this pack" is open takes the dock away,
  // and with it the Cancel button that may hold focus. Focus then goes back
  // to the active tab, so it stays in the workspace.
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
        onRenamePt={actions.handleRenamePt}
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
          {/* Preview first, then template and style, then items: on one
              column every adjustment lands right under the sticker it
              redraws. */}
          <div className={styles.addColumns}>
            <div className={styles.heroArea}>
              <StickerHeroPreview
                template={state.template}
                style={state.style}
                itemId={state.focusedItemId}
                backdrop={state.backdrop}
                onBackdropChange={state.setBackdrop}
              />
            </div>
            <div className={styles.controlsColumn}>
              <StickerTemplatePicker
                template={state.template}
                isLocked={
                  state.isTemplateLocked ||
                  (isRunWritingThisPack && isRunOnShownTemplate) ||
                  (hasFailedRunOnThisPack && isRunOnShownTemplate)
                }
                onChoose={state.chooseTemplate}
              />
              <TemplateControls
                key={state.template.id}
                style={state.style}
                onStyleChange={state.setStyle}
                selectedItemIds={state.selectedItemIds}
                packStyle={state.packStyle}
                onLoadPackStyle={state.loadPackStyle}
              />
            </div>
            <div className={styles.flagsArea}>
              <StickerItemGrid
                template={state.template}
                style={state.style}
                selectedItemIds={state.selectedItemIds}
                onSelectedItemIdsChange={state.setSelectedItemIds}
                focusedItemId={state.focusedItemId}
                onFocusItem={state.setFocusedItemId}
                packStates={packStateByItem(pack, state.template)}
                mode={state.mode}
                runStateByItem={runStateByItem}
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
  onCreatePack: (body: {
    slug: string;
    name: string;
    namePt?: string;
  }) => Promise<boolean>;
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
