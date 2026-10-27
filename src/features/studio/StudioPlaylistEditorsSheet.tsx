import { useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioPlaylistEditors.module.css";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { useStudioPlaylistEditors } from "./api/useStudioPlaylistEditors";
import { StudioPlaylistCoOwnerChecklist } from "./StudioPlaylistCoOwnerChecklist";
import { StudioPlaylistEditorInviteStep } from "./StudioPlaylistEditorInviteStep";
import { StudioPlaylistEditorRows } from "./StudioPlaylistEditorRows";

type SheetStep = "list" | "invite";

/**
 * Who edits a playlist. The owner of a member-credited playlist sees active
 * editors and pending invites, removes or cancels each one, and invites
 * connections; the owner of a persona-credited playlist ticks which of the
 * persona's co-owners can edit; an editor reads the active list. The shared
 * Modal portals to body and becomes a bottom sheet on phones. Mount it
 * inside AnimatePresence so it plays its exit.
 */
export function StudioPlaylistEditorsSheet({
  playlist,
  onClose,
}: {
  playlist: StudioPlaylistView;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [step, setStep] = useState<SheetStep>("list");
  const isOwner = playlist.role === "owner";
  const isPersonaPick = isOwner && playlist.credit.kind === "persona";
  const editorsResult = useStudioPlaylistEditors(playlist.id, {
    isEnabled: playlist.hasEditRights && !isPersonaPick,
  });
  const isInviting = step === "invite" && !isPersonaPick;
  let subtitle: string;
  if (!isOwner) subtitle = t("studio:playlist.editors.editorSub");
  else if (isPersonaPick)
    subtitle = t("studio:playlist.editors.ownerSubPersona", {
      persona: playlist.credit.name,
    });
  else subtitle = t("studio:playlist.editors.ownerSubMember");
  let body: ReactNode;
  if (isPersonaPick)
    body = <StudioPlaylistCoOwnerChecklist playlist={playlist} />;
  else if (isInviting)
    body = (
      <StudioPlaylistEditorInviteStep
        playlist={playlist}
        editors={editorsResult.editors}
        onBack={() => setStep("list")}
        onSent={() => setStep("list")}
      />
    );
  else
    body = (
      <StudioPlaylistEditorRows
        playlist={playlist}
        editorsResult={editorsResult}
        isOwner={isOwner}
        onInvite={() => setStep("invite")}
      />
    );
  return (
    <Modal
      title={t(
        isInviting
          ? "studio:playlist.editors.invite.title"
          : "studio:playlist.editors.title",
      )}
      sub={subtitle}
      onClose={onClose}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={isPersonaPick ? "pick" : step}
          className={isPersonaPick ? undefined : css.stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
        >
          {body}
        </m.div>
      </AnimatePresence>
    </Modal>
  );
}
