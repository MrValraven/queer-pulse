import { useState } from "react";
import { FiBookmark, FiEdit2, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  DESK_VIEWS_PER_OWNER_MAX,
  type DeskView,
  type DeskViewQuery,
} from "../api/deskViews.api";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";
import { DeskViewsManageModal } from "./DeskViewsManageModal";
import { DeskViewsSaveModal } from "./DeskViewsSaveModal";
import { isSameDeskViewQuery } from "./deskViewQuery";
import viewStyles from "./DeskViews.module.css";
import styles from "./DeskWorkbar.module.css";

export interface DeskViewsMenuProps {
  /** The editor's saved views, in list order (`useDeskViews().views`). */
  views: DeskView[];
  isLoading: boolean;
  /** The desk as it stands (`readDeskViewQuery`): what Save stores, and
   *  what marks a view as the one on screen. */
  currentQuery: DeskViewQuery;
  /** Puts the view back on the desk (`applyDeskView`). */
  onApply: (view: DeskView) => void;
  /** Resolve on success; reject with the request's `ApiError` so the dialog
   *  can say what went wrong next to the field. */
  onCreate: (name: string, query: DeskViewQuery) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

type OpenDialog = "save" | "manage" | null;

function doNothing(): void {}

/**
 * The workbar's Views menu: one click back to a desk setup the editor uses
 * often (scope, focus chips, filters, sort, grouping).
 *
 * The view on screen is ticked and named on the trigger, so a saved setup is
 * recognisable without opening anything. Saving and managing open small
 * dialogs from the menu; both need a text field or a confirmation, which a
 * menu cannot hold.
 */
export function DeskViewsMenu({
  views,
  isLoading,
  currentQuery,
  onApply,
  onCreate,
  onRename,
  onRemove,
}: DeskViewsMenuProps) {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const activeView = views.find((view) =>
    isSameDeskViewQuery(view.query, currentQuery),
  );
  const isListFull = views.length >= DESK_VIEWS_PER_OWNER_MAX;

  const viewItems: DeskMenuItem[] = isLoading
    ? [
        {
          kind: "action",
          id: "loading",
          label: t("magazine:desk.views.loading"),
          isDisabled: true,
          onSelect: doNothing,
        },
      ]
    : views.length === 0
      ? [
          {
            kind: "action",
            id: "empty",
            label: t("magazine:desk.views.empty"),
            description: t("magazine:desk.views.emptyHint"),
            isDisabled: true,
            onSelect: doNothing,
          },
        ]
      : views.map((view): DeskMenuItem => ({
          kind: "radio",
          id: `view:${view.id}`,
          label: view.name,
          isChecked: view.id === activeView?.id,
          onSelect: () => onApply(view),
        }));

  const items: DeskMenuItem[] = [
    { kind: "heading", id: "views", label: t("magazine:desk.views.heading") },
    ...viewItems,
    { kind: "separator", id: "actions" },
    {
      kind: "action",
      id: "save",
      label: t("magazine:desk.views.save"),
      icon: <FiPlus aria-hidden />,
      // A full list says why Save rests, and Manage below is the way out.
      description: isListFull
        ? t("magazine:desk.savedViews.limitReached", {
            count: DESK_VIEWS_PER_OWNER_MAX,
          })
        : undefined,
      isDisabled: isLoading || isListFull,
      onSelect: () => setOpenDialog("save"),
    },
    ...(views.length > 0
      ? [
          {
            kind: "action" as const,
            id: "manage",
            label: t("magazine:desk.views.manage"),
            icon: <FiEdit2 aria-hidden />,
            onSelect: () => setOpenDialog("manage"),
          },
        ]
      : []),
  ];

  const closeDialog = () => setOpenDialog(null);

  return (
    <>
      <DeskMenu
        label={t("magazine:desk.views.heading")}
        items={items}
        align="end"
        minWidth="md"
        renderTrigger={(triggerProps) => (
          <Button
            {...triggerProps}
            variant="ghost"
            size="sm"
            className={styles.menuTrigger}
          >
            <FiBookmark aria-hidden />
            <span className={viewStyles.triggerLabel}>
              {t("magazine:desk.views.trigger")}
            </span>
            {activeView && (
              <span className={`${styles.triggerValue} ${viewStyles.viewName}`}>
                {activeView.name}
              </span>
            )}
          </Button>
        )}
      />
      {openDialog === "save" && (
        <DeskViewsSaveModal
          views={views}
          onClose={closeDialog}
          onSave={(name) => onCreate(name, currentQuery)}
        />
      )}
      {openDialog === "manage" && (
        <DeskViewsManageModal
          views={views}
          onClose={closeDialog}
          onRename={onRename}
          onRemove={onRemove}
        />
      )}
    </>
  );
}
