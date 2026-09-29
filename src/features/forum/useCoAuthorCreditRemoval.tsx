import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Thread } from "./forum.data";
import { useRemoveCoAuthorCredit } from "./api/useForumMutations";
import type { PostMenuAction } from "./usePostAuthorSafety";

/**
 * The one control that lets the credited co-author take their own name off a
 * thread (PRD-408), as an item for the opening post's ⋯ menu plus the confirm
 * it opens. Same `{ action, dialog }` shape as `usePostAuthorSafety`.
 *
 * It lives in the menu because it is rare and irreversible: a bordered pill in
 * the byline outweighed the author's own name. The item label names the
 * co-author credit itself, so it still makes sense on an anonymous or official
 * thread, where the server withholds the co-author block (`coAuthor: null`)
 * and the viewer's own name appears nowhere on the page.
 *
 * The action follows `viewerIsCoAuthor` alone. Demo threads never set the flag,
 * so demo never offers it and never reaches the API.
 *
 * The confirm names the author only on a byline that names a person the
 * co-author can address. Every other byline gets copy that names nobody.
 *
 * Focus: the menu item that opened the confirm is gone by the time it closes,
 * so the dialog's own hand-back lands on <body>. Once it closes, focus moves to
 * `bylineRef`, the byline row that stays put, whether the member confirmed
 * (the item is gone for good) or kept their name.
 */
export function useCoAuthorCreditRemoval({
  thread,
  bylineRef,
}: {
  thread: Thread;
  /** A stable, focusable element (tabIndex -1) to hand focus to once the
   *  confirm closes. */
  bylineRef?: RefObject<HTMLElement | null>;
}): { action: PostMenuAction | null; dialog: ReactNode } {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeCredit = useRemoveCoAuthorCredit();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const shouldFocusBylineRef = useRef(false);
  const threadSlug = thread.slug;
  const canRemoveOwnName = !!thread.viewerIsCoAuthor && !!threadSlug;
  // Any byline that names nobody the co-author can address: an anonymous
  // thread, the QueerPulse account, or an erased author, whose handle is empty
  // and whose name is a placeholder. Wider than `isMaskedByline()`, which only
  // decides how the byline itself is drawn.
  const isBylineMasked =
    !!thread.isAnonymous || !!thread.author.official || !thread.author.slug;

  // Runs after the dialog's own unmount cleanup has handed focus back.
  useEffect(() => {
    if (isConfirmOpen || !shouldFocusBylineRef.current) return;
    shouldFocusBylineRef.current = false;
    bylineRef?.current?.focus();
  }, [isConfirmOpen, bylineRef]);

  function closeConfirm() {
    shouldFocusBylineRef.current = true;
    setIsConfirmOpen(false);
  }

  function confirmRemoval() {
    if (!threadSlug) return;
    removeCredit.mutate(
      { slug: threadSlug },
      {
        onSuccess: () => {
          closeConfirm();
          showToast(t("forum:threadPage.coAuthor.removedToast"), "success");
        },
        onError: () => {
          closeConfirm();
          showToast(t("forum:threadPage.coAuthor.removeFailed"), "error");
        },
      },
    );
  }

  const action: PostMenuAction | null = canRemoveOwnName
    ? {
        key: "remove-co-author",
        label: t("forum:threadPage.coAuthor.menuItem"),
        run: () => setIsConfirmOpen(true),
        danger: true,
      }
    : null;

  const dialog = isConfirmOpen ? (
    <ConfirmDialog
      open
      tone="destructive"
      loading={removeCredit.isPending}
      onClose={closeConfirm}
      onConfirm={confirmRemoval}
      title={t("forum:threadPage.coAuthor.confirmTitle")}
      description={
        isBylineMasked
          ? t("forum:threadPage.coAuthor.confirmBodyMasked")
          : t("forum:threadPage.coAuthor.confirmBody", {
              author: thread.author.name,
            })
      }
      confirmLabel={t("forum:threadPage.coAuthor.confirmCta")}
      cancelLabel={t("forum:threadPage.coAuthor.cancel")}
    />
  ) : null;

  return { action, dialog };
}
