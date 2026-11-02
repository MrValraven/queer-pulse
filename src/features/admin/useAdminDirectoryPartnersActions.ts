import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminDirectoryPartnerDTO } from "../marketing/api/directoryPartners.api";
import {
  useAddDirectoryPartner,
  useRemoveDirectoryPartner,
  useReorderDirectoryPartners,
  useUpdateDirectoryPartnerNote,
} from "./api/useAdminDirectoryPartnerMutations";
import {
  DIRECTORY_PARTNER_ERROR_VALUES,
  directoryPartnerErrorKeyOf,
} from "./adminDirectoryPartners.model";
import { movedIds } from "./studioAdmin.model";

export type AddDirectoryPartnerMutation = ReturnType<
  typeof useAddDirectoryPartner
>;
export type UpdateDirectoryPartnerNoteMutation = ReturnType<
  typeof useUpdateDirectoryPartnerNote
>;

/**
 * The Partners tab's writes. All four mutations live here, so `isBusy` is
 * true while any of them is in flight: every write answers with the full
 * list, and holding the next write until the last one lands means two
 * answers never race. The dialogs get the add and note mutations from here.
 */
export function useAdminDirectoryPartnersActions(
  partners: AdminDirectoryPartnerDTO[],
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const reorder = useReorderDirectoryPartners();
  const removal = useRemoveDirectoryPartner();
  const addPartner = useAddDirectoryPartner();
  const updateNote = useUpdateDirectoryPartnerNote();
  const [noteTarget, setNoteTarget] = useState<AdminDirectoryPartnerDTO | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const isBusy =
    reorder.isPending ||
    removal.isPending ||
    addPartner.isPending ||
    updateNote.isPending;

  const toastError = (cause: unknown) =>
    showToast(
      t(directoryPartnerErrorKeyOf(cause), DIRECTORY_PARTNER_ERROR_VALUES),
      "error",
    );

  function move(partner: AdminDirectoryPartnerDTO, targetIndex: number) {
    const ids = movedIds(
      partners.map((candidate) => candidate.id),
      partner.id,
      targetIndex,
    );
    if (!ids || isBusy) return;
    reorder.mutate(
      { ids },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:directoryPartners.moved", {
              name: partner.name,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  /** Removes the partner, says so, then runs `onRemoved` (the caller moves
   *  focus, since only it knows where focus should land). */
  function remove(partner: AdminDirectoryPartnerDTO, onRemoved: () => void) {
    if (isBusy) return;
    removal.mutate(
      { pickId: partner.id },
      {
        onSuccess: () => {
          showToast(
            t("admin:directoryPartners.toast.removed", { name: partner.name }),
            "success",
          );
          onRemoved();
        },
        onError: toastError,
      },
    );
  }

  return {
    isBusy,
    statusMessage,
    move,
    remove,
    noteTarget,
    openNote: (partner: AdminDirectoryPartnerDTO) => setNoteTarget(partner),
    closeNote: () => setNoteTarget(null),
    addPartner,
    updateNote,
  };
}
