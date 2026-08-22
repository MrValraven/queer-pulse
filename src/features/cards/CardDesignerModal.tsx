import { useState } from "react";
import { Button, ConfirmDialog, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useCardProgram,
  useIssueAllCards,
  useUpsertCardProgram,
} from "./api/useCardProgram";
import type { CardSkin } from "./api/cards.api";
import { CardDesignerFields } from "./CardDesignerFields";
import { CardDesignerPreview } from "./CardDesignerPreview";
import { useCardDesignerDraft } from "./useCardDesignerDraft";
import styles from "./CardDesignerModal.module.css";

export function CardDesignerModal({
  slug,
  communityName,
  onClose,
}: {
  slug: string;
  communityName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { name: viewerName, photo: viewerPhoto } = useAccountIdentity();
  const { program } = useCardProgram(slug);
  const upsert = useUpsertCardProgram(slug);
  const issueAll = useIssueAllCards(slug);
  const { draft, set, isDirty } = useCardDesignerDraft(program);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  // A programme that does not exist yet has nobody holding a card, so its
  // first save is also the moment the roster gets one — there is nothing to
  // surprise anyone with. Editing an EXISTING programme only saves the
  // design; issuing stays a deliberate, separately-confirmed act in
  // `ModToolsCardSection`, because a bulk issue touches real members.
  const isFirstSave = !program;
  const isSaving = upsert.isPending || issueAll.isPending;

  const requestClose = () => {
    if (isDirty && !isSaving) {
      setIsConfirmingDiscard(true);
      return;
    }
    onClose();
  };

  const save = async () => {
    try {
      // Editing must not silently flip a paused programme back on. A
      // programme that doesn't exist yet defaults to enabled (there is
      // nothing to pause); an existing one keeps whatever enabled state it
      // already had, and only ModToolsCardSection's dedicated pause/resume
      // toggle changes that.
      const isEnabled = program?.isEnabled ?? true;
      await upsert.mutateAsync({
        isEnabled,
        skin: draft.skin,
        accentToken: draft.accentToken,
        cardName: draft.cardName.trim() || t("cards:designer.defaultCardName"),
        validityMonths: draft.validityMonths,
        // Only sent when the owner actually touched the crest: the backend
        // treats an absent field as "leave it alone" and an explicit null as
        // "clear it", so sending it unconditionally would wipe a crest set
        // from anywhere else.
        ...(draft.crestKey !== draft.savedCrestKey
          ? { crestMediaKey: draft.crestKey || null }
          : {}),
        // The ground, on the same absent-vs-null contract. The backend clears
        // whichever of the two is not written, so a card always has exactly
        // one ground.
        ...(draft.backgroundPreset !== (program?.backgroundPreset ?? null)
          ? { backgroundPreset: draft.backgroundPreset }
          : {}),
        ...(draft.backgroundKey !== draft.savedBackgroundKey
          ? { backgroundMediaKey: draft.backgroundKey || null }
          : {}),
        // Phase 1 has no profile badge to gate (spec §J is Phase 3); the DTO
        // still requires the field, so this keeps sending the value the
        // backend already stores rather than exposing a control for a
        // feature that does not exist yet.
        allowsPublicBadge: program?.allowsPublicBadge ?? true,
        allowsMemberPhoto: draft.allowsMemberPhoto,
        photoStyle: draft.photoStyle,
      });

      // First save on a live programme: hand the roster its cards, since
      // that is what starting a card programme means.
      if (isFirstSave && isEnabled) {
        const result = await issueAll.mutateAsync();
        showToast(
          t("cards:designer.saved", { count: result.issued }),
          "success",
        );
      } else if (!isEnabled) {
        showToast(t("cards:designer.savedPaused"), "success");
      } else {
        showToast(t("cards:designer.savedDesign"), "success");
      }
      onClose();
    } catch {
      // Both calls carry the global error toast on failure via the query
      // client's default handling in most flows, but this sequence has no
      // caller left to show it once the modal unmounts on success — surface
      // it here explicitly instead.
      showToast(t("common:toast.saveFailed"), "error");
    }
  };

  return (
    <>
      <Modal
        title={t("cards:designer.ariaLabel")}
        onClose={requestClose}
        className={styles.dialog}
        footer={
          <>
            <Button variant="ghost" onClick={requestClose} disabled={isSaving}>
              {t("communities:edit.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => void save()}
              disabled={isSaving}
            >
              {isSaving
                ? t("communities:edit.saving")
                : isFirstSave
                  ? t("cards:designer.save")
                  : t("cards:designer.saveDesign")}
            </Button>
          </>
        }
      >
        <div className={styles.body}>
          <CardDesignerPreview
            communityName={communityName}
            cardName={draft.cardName || t("cards:designer.defaultCardName")}
            skin={draft.skin}
            accentToken={draft.accentToken}
            // Cleared, freshly picked, or as saved — in that order. Falling
            // straight back to the saved crest would keep drawing a crest the
            // owner has just removed.
            crestUrl={
              draft.crestKey === ""
                ? null
                : (draft.crestPreviewUrl ?? program?.crestUrl ?? null)
            }
            backgroundPreset={draft.backgroundPreset}
            // Same order as the crest above: cleared, freshly picked, or as
            // saved.
            backgroundUrl={
              draft.backgroundKey === ""
                ? null
                : (draft.backgroundPreviewUrl ?? program?.backgroundUrl ?? null)
            }
            validityMonths={draft.validityMonths}
            serialPrefix={program?.serialPrefix}
            holderName={viewerName}
            allowsMemberPhoto={draft.allowsMemberPhoto}
            photoStyle={draft.photoStyle}
            // The owner's own avatar, so turning photos on previews a real
            // face rather than a placeholder the members will never see.
            holderAvatarUrl={viewerPhoto ?? null}
          />

          <CardDesignerFields
            cardName={draft.cardName}
            onCardNameChange={(value) => set({ cardName: value })}
            skin={draft.skin}
            onSkinChange={(value: CardSkin) => set({ skin: value })}
            accentToken={draft.accentToken}
            onAccentChange={(value) => set({ accentToken: value })}
            validityMonths={draft.validityMonths}
            onValidityChange={(value) => set({ validityMonths: value })}
            crestKey={draft.crestKey}
            onCrestChange={(key) => set({ crestKey: key })}
            onCrestPreviewChange={(url) => set({ crestPreviewUrl: url })}
            backgroundPreset={draft.backgroundPreset}
            onBackgroundPresetChange={(preset) =>
              set({ backgroundPreset: preset })
            }
            backgroundKey={draft.backgroundKey}
            onBackgroundChange={(key) => set({ backgroundKey: key })}
            onBackgroundPreviewChange={(url) =>
              set({ backgroundPreviewUrl: url })
            }
            allowsMemberPhoto={draft.allowsMemberPhoto}
            onAllowsMemberPhotoChange={(allows) =>
              set({ allowsMemberPhoto: allows })
            }
            photoStyle={draft.photoStyle}
            onPhotoStyleChange={(style) => set({ photoStyle: style })}
          />
        </div>
      </Modal>

      {/* Escape, the backdrop and the X all reach `requestClose` first, so an
          in-progress design can never be thrown away by a stray click. */}
      <ConfirmDialog
        open={isConfirmingDiscard}
        onClose={() => setIsConfirmingDiscard(false)}
        onConfirm={onClose}
        tone="destructive"
        title={t("cards:designer.discard.title")}
        description={t("cards:designer.discard.body")}
        confirmLabel={t("cards:designer.discard.confirm")}
        cancelLabel={t("cards:designer.discard.cancel")}
      />
    </>
  );
}
