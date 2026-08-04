import { useState } from "react";
import { Button, BulkActionBar } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { describeError } from "../../../shared/api/errorMessage";
import { useAdminRoadmapMutations } from "../api/useAdminRoadmapMutations";
import type { RoadmapBulkAction, RoadmapColumn } from "../api/roadmapAdmin.types";
import { AdminModal } from "../ui";
import { useRoadmapSelection } from "./state/useRoadmapSelection";
import styles from "./RoadmapChrome.module.css";

const MOVE_TARGETS: RoadmapColumn[] = [
  "backlog",
  "planned",
  "building",
  "shipped",
];

/** One `roadmap.toasts.bulk*` key per action, `count`/`column`-interpolated. */
const SUCCESS_TOAST_KEY: Record<RoadmapBulkAction, string> = {
  move: "admin:roadmap.toasts.bulkMoved",
  show: "admin:roadmap.toasts.bulkPublished",
  hide: "admin:roadmap.toasts.bulkHidden",
  archive: "admin:roadmap.toasts.bulkArchived",
  delete: "admin:roadmap.toasts.bulkDeleted",
};

/**
 * Bulk-action bar for the Board/Timeline multi-select
 * (`useRoadmapSelection()`), built on the shared inline `BulkActionBar` — the
 * page renders it unconditionally and the shared bar renders nothing once
 * `count` hits 0, matching `ItemDrawer`/`RoadmapModalsHost`'s own "always
 * mounted, renders nothing when inactive" shape. Every action shares
 * `useAdminRoadmapMutations().bulkItems`, the one endpoint the backend
 * exposes for all 5 actions (`RoadmapBulkItemsBody`).
 *
 * Delete alone is gated behind a confirm dialog — it's the only
 * irreversible one of the 5 (archive can be undone from the Archive view;
 * show/hide/move are one click either way), matching the design system's
 * "confirm destructive actions" rule and the listings bulk bar's own
 * `BulkRemoveConfirmModal` precedent.
 */
export function BulkBar() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { selected, clear, count } = useRoadmapSelection();
  const { bulkItems, pending } = useAdminRoadmapMutations();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const ids = Array.from(selected);

  function runBulk(action: RoadmapBulkAction, column?: RoadmapColumn) {
    bulkItems(
      { ids, action, column },
      {
        onSuccess: () => {
          showToast(
            t(SUCCESS_TOAST_KEY[action], {
              count,
              column: column
                ? t(`admin:roadmap.board.column.${column}`)
                : undefined,
            }),
            "info",
          );
          clear();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:roadmap.bulkBar.selectedLabel", { count }),
              error,
            ),
            "error",
          ),
      },
    );
  }

  return (
    <>
      <BulkActionBar
        variant="inline"
        count={count}
        label={t("admin:roadmap.bulkBar.selectedLabel", { count })}
        ariaLabel={t("admin:roadmap.bulkBar.selectedLabel", { count })}
        onClear={clear}
        clearLabel={t("admin:roadmap.bulkBar.clear")}
      >
        <select
          className={`${styles.select} ${styles.bulkSelect}`}
          value=""
          disabled={pending}
          aria-label={t("admin:roadmap.bulkBar.moveToPlaceholder")}
          onChange={(event) => {
            const column = event.target.value as RoadmapColumn | "";
            if (column) runBulk("move", column);
          }}
        >
          <option value="">
            {t("admin:roadmap.bulkBar.moveToPlaceholder")}
          </option>
          {MOVE_TARGETS.map((column) => (
            <option key={column} value={column}>
              {t(`admin:roadmap.board.column.${column}`)}
            </option>
          ))}
        </select>

        <Button variant="jade" onClick={() => runBulk("show")} disabled={pending}>
          {t("admin:roadmap.bulkBar.showPublicly")}
        </Button>
        <Button
          variant="ghost-dark"
          onClick={() => runBulk("hide")}
          disabled={pending}
        >
          {t("admin:roadmap.bulkBar.hide")}
        </Button>
        <Button
          variant="ghost-dark"
          onClick={() => runBulk("archive")}
          disabled={pending}
        >
          {t("admin:roadmap.bulkBar.archive")}
        </Button>
        <Button
          variant="danger"
          onClick={() => setConfirmingDelete(true)}
          disabled={pending}
        >
          {t("admin:roadmap.bulkBar.delete")}
        </Button>
      </BulkActionBar>

      {confirmingDelete && (
        <AdminModal
          title={t("admin:roadmap.bulkBar.confirmDelete.title", { count })}
          onClose={() => setConfirmingDelete(false)}
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
              >
                {t("admin:common.cancel")}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => {
                  setConfirmingDelete(false);
                  runBulk("delete");
                }}
              >
                {t("admin:roadmap.bulkBar.confirmDelete.confirmCta")}
              </Button>
            </>
          }
        >
          <p>{t("admin:roadmap.bulkBar.confirmDelete.body", { count })}</p>
        </AdminModal>
      )}
    </>
  );
}
