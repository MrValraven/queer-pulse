import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistInviteView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import type { StudioPlaylistInviteResponse } from "./api/studio.types";
import { useRespondStudioPlaylistInvite } from "./api/useStudioPlaylistEditorMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioLibraryPath } from "./studioPaths";
import { StudioPlaylistPersonAvatar } from "./StudioPlaylistPersonAvatar";
import css from "./StudioPlaylistInviteBanner.module.css";

/**
 * The invitee's banner above the playlist: who invited them, what editors
 * can do, and Accept invite or Decline invite (each names its own pending
 * state while the answer is on its way). Accept turns the page into the editor's
 * view (the banner folds away in its Collapse); Decline leaves for the
 * library, since a private playlist no longer opens for them. After Accept
 * `onAccepted` lets the page move focus out of the folding banner.
 */
export function StudioPlaylistInviteBanner({
  playlist,
  invite,
  onAccepted,
}: {
  playlist: StudioPlaylistView;
  invite: StudioPlaylistInviteView;
  onAccepted: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const respond = useRespondStudioPlaylistInvite();
  const titleId = useId();
  const [answering, setAnswering] =
    useState<StudioPlaylistInviteResponse | null>(null);
  // Set once a decline lands: the page leaves before any render reads the
  // playlist again.
  const isLeavingRef = useRef(false);

  function answer(response: StudioPlaylistInviteResponse) {
    if (respond.isPending || isLeavingRef.current) return;
    setAnswering(response);
    respond.mutate(
      { playlistId: playlist.id, response },
      {
        onSuccess: () => {
          if (response === "accept") {
            showToast(
              t("studio:playlist.invite.acceptedToast", {
                name: playlist.name,
              }),
              "success",
            );
            onAccepted();
            return;
          }
          isLeavingRef.current = true;
          void navigate(studioLibraryPath(), { replace: true });
          showToast(t("studio:playlist.invite.declinedToast"), "info");
        },
        onError: (error) =>
          showToast(t(studioErrorMessageKeyOf(error)), "error"),
        onSettled: () => setAnswering(null),
      },
    );
  }

  return (
    <section className={css.banner} aria-labelledby={titleId}>
      <span className={css.face} aria-hidden>
        <StudioPlaylistPersonAvatar person={invite.invitedBy} size={40} />
      </span>
      <div className={css.text}>
        <h2 id={titleId} className={css.title}>
          {t("studio:playlist.invite.bannerTitle", {
            name: invite.invitedBy.name,
          })}
        </h2>
        <p className={css.body}>{t("studio:playlist.invite.bannerBody")}</p>
      </div>
      <div className={css.actions}>
        <Button
          variant="primary"
          aria-disabled={respond.isPending || undefined}
          aria-busy={answering === "accept" || undefined}
          onClick={() => answer("accept")}
        >
          {answering === "accept" ? (
            <Sending label={t("studio:playlist.invite.acceptingCta")} />
          ) : (
            t("studio:playlist.invite.acceptCta")
          )}
        </Button>
        <Button
          variant="ghost"
          aria-disabled={respond.isPending || undefined}
          aria-busy={answering === "decline" || undefined}
          onClick={() => answer("decline")}
        >
          {answering === "decline" ? (
            <Sending label={t("studio:playlist.invite.decliningCta")} />
          ) : (
            t("studio:playlist.invite.declineCta")
          )}
        </Button>
      </div>
    </section>
  );
}
