import type { RefObject } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDeleteStudioPlaylist } from "./api/useStudioPlaylistMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";

/** How long focus waits for the deleted card to leave and the dialog to
 *  close before it gives up. */
const FOCUS_HANDOFF_LIMIT_MS = 3000;

/** A card's title link (StudioMediaCard). */
const CARD_LINK_SELECTOR = "article h3 a[href]";

/** Where focus goes once the card inside `anchor` leaves its list: the next
 *  card's title, else the one before it, else the shelf's heading. */
function focusTargetAfterRemoval(anchor: HTMLElement): HTMLElement | null {
  const list = anchor.closest("ul, ol") ?? anchor.parentElement;
  const ownLink = anchor.querySelector<HTMLElement>(CARD_LINK_SELECTOR);
  const links = list
    ? Array.from(list.querySelectorAll<HTMLElement>(CARD_LINK_SELECTOR))
    : [];
  const index = ownLink ? links.indexOf(ownLink) : -1;
  const neighbour =
    index === -1 ? null : (links[index + 1] ?? links[index - 1] ?? null);
  if (neighbour) return neighbour;
  const heading =
    anchor.closest("section")?.querySelector<HTMLElement>("h2") ??
    document.querySelector<HTMLElement>("main h1");
  if (heading && !heading.hasAttribute("tabindex"))
    heading.setAttribute("tabindex", "-1");
  return heading;
}

/** Hands focus to `target` once the card is gone and no dialog is open,
 *  unless the member has already moved it somewhere. */
function handFocusAfterRemoval(anchor: HTMLElement, target: HTMLElement) {
  const startedAt = performance.now();
  const check = () => {
    const active = document.activeElement;
    // Focus sits in the closing dialog until it hands focus back.
    const isWaiting =
      anchor.isConnected ||
      (active !== null && active.closest('[aria-modal="true"]') !== null);
    if (isWaiting) {
      if (performance.now() - startedAt < FOCUS_HANDOFF_LIMIT_MS)
        requestAnimationFrame(check);
      return;
    }
    const isFocusLost =
      active === null || active === document.body || !active.isConnected;
    if (isFocusLost && target.isConnected) target.focus();
  };
  requestAnimationFrame(check);
}

/** Delete playlist from a card: the card is never the open playlist, so
 *  the page stays where it is, and focus moves to the next card (or the
 *  one before, or the shelf's heading) once the card leaves. `anchorRef`
 *  holds the card. */
export function StudioPlaylistCardDeleteConfirm({
  row,
  anchorRef,
  onClose,
}: {
  row: StudioRailPlaylistRowModel;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const remove = useDeleteStudioPlaylist();
  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (remove.isPending) return;
        remove.mutate(
          { playlistId: row.playlistId },
          {
            onSuccess: () => {
              const anchor = anchorRef.current;
              const target = anchor ? focusTargetAfterRemoval(anchor) : null;
              onClose();
              if (anchor && target) handFocusAfterRemoval(anchor, target);
              showToast(t("studio:playlist.delete.deletedToast"), "success");
            },
            onError: (error) => {
              onClose();
              showToast(t(studioErrorMessageKeyOf(error)), "error");
            },
          },
        );
      }}
      loading={remove.isPending}
      tone="destructive"
      title={t("studio:playlist.delete.title", { name: row.name })}
      description={t("studio:playlist.delete.body")}
      confirmLabel={t("studio:playlist.delete.confirmCta")}
    />
  );
}
