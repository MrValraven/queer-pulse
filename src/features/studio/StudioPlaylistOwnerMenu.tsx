import type { ReactNode } from "react";
import {
  FiEdit2,
  FiEye,
  FiLogOut,
  FiMoreHorizontal,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { IconButton } from "../../shared/components/ui/IconButton";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import {
  useStudioFoldedShareItems,
  type StudioFoldedShare,
} from "./useStudioFoldedShareItem";
import releaseStyles from "./StudioRelease.module.css";

/* A destructive item reads in the danger ink, below a hairline. */
const OWNER_ITEMS = [
  {
    id: "edit",
    labelKey: "studio:playlist.page.editDetails",
    isDestructive: false,
  },
  {
    id: "visibility",
    labelKey: "studio:playlist.page.changeVisibility",
    isDestructive: false,
  },
  {
    id: "manageEditors",
    labelKey: "studio:playlist.page.manageEditors",
    isDestructive: false,
  },
  {
    id: "delete",
    labelKey: "studio:playlist.page.deletePlaylist",
    isDestructive: true,
  },
] as const;
const EDITOR_ITEMS = [
  {
    id: "edit",
    labelKey: "studio:playlist.page.editDetails",
    isDestructive: false,
  },
  {
    id: "leave",
    labelKey: "studio:playlist.page.leavePlaylist",
    isDestructive: true,
  },
] as const;
type OwnerAction =
  (typeof OWNER_ITEMS)[number]["id"] | (typeof EDITOR_ITEMS)[number]["id"];

const ACTION_ICONS: Record<OwnerAction, ReactNode> = {
  edit: <FiEdit2 />,
  visibility: <FiEye />,
  manageEditors: <FiUsers />,
  delete: <FiTrash2 />,
  leave: <FiLogOut />,
};

/** The playlist menu. The owner gets Edit details, Change visibility,
 *  Manage editors and Delete playlist; an editor gets Edit details and Leave
 *  playlist, the last item set apart by a hairline in the danger ink. With
 *  `share` (the hero's Share folded here) every way to share comes before
 *  it, after a hairline. Arrow keys and type-ahead move through the items, Escape
 *  and a press outside close it, and focus returns to the trigger before a
 *  dialog opens. */
export function StudioPlaylistOwnerMenu({
  role,
  onAction,
  share,
}: {
  role: "owner" | "editor";
  onAction: (action: OwnerAction) => void;
  share?: StudioFoldedShare;
}) {
  const { t } = useTranslation();
  const label = t("studio:playlist.page.actionsLabel");
  const foldedShare = useStudioFoldedShareItems(share);
  const shareItems: StudioMenuItem[] =
    foldedShare.items.length > 0
      ? [{ id: "shareSeparator", type: "separator" }, ...foldedShare.items]
      : [];
  const definitions = role === "owner" ? OWNER_ITEMS : EDITOR_ITEMS;
  const items: StudioMenuItem[] = definitions.flatMap(
    (definition): StudioMenuItem[] => {
      const item: StudioMenuItem = {
        id: definition.id,
        label: t(definition.labelKey),
        icon: ACTION_ICONS[definition.id],
        tone: definition.isDestructive ? "danger" : "default",
        onSelect: () => onAction(definition.id),
      };
      return definition.isDestructive
        ? [
            ...shareItems,
            { id: `${definition.id}Separator`, type: "separator" },
            item,
          ]
        : [item];
    },
  );
  return (
    <div className={releaseStyles.overflow}>
      <StudioMenu
        trigger={
          <IconButton
            className={releaseStyles.overflowTrigger}
            aria-label={label}
          >
            <FiMoreHorizontal aria-hidden />
          </IconButton>
        }
        label={label}
        items={items}
      />
      {foldedShare.dialog}
    </div>
  );
}

export type { OwnerAction as StudioPlaylistOwnerAction };
