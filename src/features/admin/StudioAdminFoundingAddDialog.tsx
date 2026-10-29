import { useRef } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAddFoundingArtist } from "./api/useStudioAdminLandingMutations";
import { StudioAdminPersonaSearch } from "./StudioAdminPersonaSearch";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";

/** The add dialog: the shared persona search, where an artist already on the
 *  list cannot be picked. */
export function StudioAdminFoundingAddDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const add = useAddFoundingArtist();
  const searchInputRef = useRef<HTMLInputElement>(null);
  return (
    <Modal
      title={t("admin:studioAdmin.founding.addTitle")}
      onClose={onClose}
      initialFocusRef={searchInputRef}
    >
      <StudioAdminPersonaSearch
        inputRef={searchInputRef}
        isPickable={(option) => !option.isFoundingArtist}
        onPick={(option) => {
          if (add.isPending) return;
          add.mutate(
            { subprofileId: option.artist.id },
            {
              onSuccess: () => {
                showToast(
                  t("admin:studioAdmin.founding.added", {
                    name: option.artist.name,
                  }),
                  "success",
                );
                onClose();
              },
              onError: (cause) =>
                showToast(t(studioAdminSaveErrorKeyOf(cause)), "error"),
            },
          );
        }}
      />
    </Modal>
  );
}
