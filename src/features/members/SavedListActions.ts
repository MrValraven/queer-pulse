import type { useToast } from "../../shared/components/feedback/useToast";
import type { useTranslation } from "../../shared/i18n/useTranslation";
import type { SavedItem } from "../../app/providers/useSaved";
import { savedItemToBody } from "./api/saved.api";
import type { useSavedListMutations } from "./api/SavedLists.queries";

interface UseSavedListActionsParams {
  t: ReturnType<typeof useTranslation>["t"];
  showToast: ReturnType<typeof useToast>["showToast"];
  mutations: ReturnType<typeof useSavedListMutations>;
  closeModal: () => void;
}

/**
 * The write handlers behind the saved-lists surfaces. Split out of
 * `useSavedListsController` so neither ends up over the repo's 200-line rule:
 * this owns the mutation call and the toast for each action, the controller
 * owns state shape and derived reads.
 *
 * Every handler returns a promise the caller can await, and rejects after
 * toasting rather than swallowing the failure, so a form can stay open with the
 * member's typing in it instead of showing success for something that never
 * happened.
 */
export function useSavedListActions({
  t,
  showToast,
  mutations,
  closeModal,
}: UseSavedListActionsParams) {
  const { create, rename, remove, share, unshare, addItem, removeItem } =
    mutations;

  const createList = async (name: string): Promise<void> => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    try {
      await create.mutateAsync(trimmedName);
    } catch (error) {
      showToast(t("members:savedLists.toast.createError"), "error");
      throw error;
    }
    closeModal();
    showToast(t("members:savedLists.toast.created"), "success");
  };

  const renameList = async (listId: string, name: string): Promise<void> => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    try {
      await rename.mutateAsync({ listId, name: trimmedName });
    } catch (error) {
      showToast(t("members:savedLists.toast.renameError"), "error");
      throw error;
    }
    showToast(t("members:savedLists.toast.renamed"), "success");
  };

  const deleteList = async (listId: string): Promise<void> => {
    try {
      await remove.mutateAsync(listId);
    } catch (error) {
      showToast(t("members:savedLists.toast.deleteError"), "error");
      throw error;
    }
    closeModal();
    showToast(t("members:savedLists.toast.deleted"), "success");
  };

  /** Turn the share link on. An explicit act, always: the member has just read
   *  what a link means and pressed the button that makes one. */
  const shareList = async (listId: string): Promise<void> => {
    try {
      await share.mutateAsync(listId);
    } catch (error) {
      showToast(t("members:savedLists.toast.shareError"), "error");
      throw error;
    }
    showToast(t("members:savedLists.toast.shared"), "success");
  };

  /** Turn it off. Every copy of the URL anyone holds stops working the moment
   *  this lands, which is the whole reason the token is a stored secret. */
  const revokeShare = async (listId: string): Promise<void> => {
    try {
      await unshare.mutateAsync(listId);
    } catch (error) {
      showToast(t("members:savedLists.toast.revokeError"), "error");
      throw error;
    }
    showToast(t("members:savedLists.toast.revoked"), "success");
  };

  /** File an already-saved item into a list. The API saves and files in one
   *  call, so the item cannot end up in a list that does not hold it. */
  const fileItem = async (listId: string, item: SavedItem): Promise<void> => {
    try {
      await addItem.mutateAsync({
        listId,
        ref: item.id,
        body: savedItemToBody(item),
      });
    } catch (error) {
      showToast(t("members:savedLists.toast.fileError"), "error");
      throw error;
    }
  };

  /** Take an item out of one list. It stays saved and stays in every other
   *  list it is in. Refused by the API on the default list, where unsaving is
   *  the honest way to remove something. */
  const unfileItem = async (listId: string, ref: string): Promise<void> => {
    try {
      await removeItem.mutateAsync({ listId, ref });
    } catch (error) {
      showToast(t("members:savedLists.toast.unfileError"), "error");
      throw error;
    }
    showToast(t("members:savedLists.toast.unfiled"), "success");
  };

  return {
    createList,
    renameList,
    deleteList,
    shareList,
    revokeShare,
    fileItem,
    unfileItem,
  };
}
