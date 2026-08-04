import { useEffect, useState } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AdminCat, AdminChip, AdminDrawer } from "../../ui";
import { SkeletonLine } from "../../../../shared/components/ui";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { RoadmapItemWriteBody } from "../../api/roadmapAdmin.types";
import { useItemDrawer } from "../state/useItemDrawer";
import {
  buildDraftDefaults,
  COLUMN_CHIP_TONE,
  daysSince,
  resolveCategoryLabel,
} from "./itemDrawer.data";
import { useItemDrawerHandlers } from "./useItemDrawerHandlers";
import { DrawerHeaderFields } from "./DrawerHeaderFields";
import { DrawerFooter } from "./DrawerFooter";
import { DrawerSections } from "./DrawerSections";
import styles from "./ItemDrawer.module.css";

/**
 * The drawer's real body, mounted only while `openId !== null` (keyed by
 * `openId` from the thin `ItemDrawer.tsx` wrapper, so switching between two
 * items — or between an item and create mode — fully resets local state
 * instead of an effect trying to sync it). `"new"` means create mode: edits
 * accumulate in a local `draft` and `createItem` fires once, on Save.
 * Otherwise every field edit writes straight through `updateItem` (see
 * `useItemDrawerHandlers`, which owns every write path this body triggers).
 */
export function ItemDrawerBody({ openId }: { openId: string }) {
  const { close } = useItemDrawer();
  const { items, team, loading } = useAdminRoadmap();
  const { createItem, updateItem, deleteItem, updateDeps, archiveItem, pending } =
    useAdminRoadmapMutations();
  const { t } = useTranslation();

  const isCreate = openId === "new";
  const existingItem = isCreate
    ? null
    : (items.find((item) => item.id === openId) ?? null);

  const [draft, setDraft] = useState<RoadmapItemWriteBody>(() =>
    buildDraftDefaults(items),
  );

  useEffect(() => {
    if (!isCreate && !loading && !existingItem) close();
  }, [isCreate, loading, existingItem, close]);

  const {
    handleFieldChange,
    handleTargetQuarterChange,
    handlePublicToggle,
    handleSave,
    handleArchive,
    handleDelete,
    modals,
  } = useItemDrawerHandlers({
    isCreate,
    draft,
    setDraft,
    editItem: existingItem,
    close,
    createItem,
    updateItem,
    deleteItem,
    archiveItem,
  });

  const currentItem = isCreate ? draft : existingItem;
  if (!currentItem) {
    return (
      <AdminDrawer
        label={t("admin:roadmap.drawer.eyebrow")}
        onClose={close}
        head={<div className={styles.headTop}>{t("admin:roadmap.drawer.eyebrow")}</div>}
      >
        <div aria-busy="true">
          <SkeletonLine width="50%" height={20} />
          <SkeletonLine height={120} style={{ marginTop: 16, borderRadius: 16 }} />
        </div>
      </AdminDrawer>
    );
  }
  // Derived from `existingItem` (not `currentItem`) so TS keeps its real
  // `AdminRoadmapItemDTO | null` type — `currentItem` is a union with the
  // create-mode draft and doesn't carry id/updatedAt/deps/etc.
  const editItem = isCreate ? null : existingItem;

  return (
    <AdminDrawer
      label={currentItem.name || t("admin:roadmap.drawer.eyebrow")}
      onClose={close}
      head={
        <div className={styles.headTop}>
          <AdminCat tone="coral">
            {resolveCategoryLabel(currentItem.category, t)}
          </AdminCat>
          <AdminChip tone={COLUMN_CHIP_TONE[currentItem.column]}>
            {t(`admin:roadmap.board.column.${currentItem.column}`)}
          </AdminChip>
          {editItem && (
            <span className={styles.headTouched}>
              {t("admin:roadmap.drawer.touchedLabel", {
                days: daysSince(editItem.updatedAt),
              })}
            </span>
          )}
        </div>
      }
      foot={
        <DrawerFooter
          isCreate={isCreate}
          pending={pending}
          canSave={currentItem.name.trim().length > 0}
          itemName={currentItem.name}
          onSave={handleSave}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      }
    >
      <DrawerHeaderFields
        name={currentItem.name}
        category={currentItem.category}
        column={currentItem.column}
        targetQuarter={currentItem.targetQuarter}
        ownerId={currentItem.ownerId}
        priority={currentItem.priority}
        items={items}
        team={team}
        onNameChange={(value) => handleFieldChange({ name: value })}
        onFieldChange={handleFieldChange}
        onTargetQuarterChange={handleTargetQuarterChange}
      />

      <DrawerSections
        currentItem={currentItem}
        editItem={editItem}
        items={items}
        team={team}
        onFieldChange={handleFieldChange}
        onPublicToggle={handlePublicToggle}
        onAddDep={(body) => editItem && updateDeps({ id: editItem.id, body })}
        onRemoveDep={(body) => editItem && updateDeps({ id: editItem.id, body })}
        onNotify={() => editItem && modals.open("notify", { itemId: editItem.id })}
        onOpenAudit={() => modals.open("audit")}
      />
    </AdminDrawer>
  );
}
