import { useState } from "react";
import { ModalSheet } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEndorsement, useMyEndorsement } from "./api/useEndorsement";
import { EndorseForm, EndorseSuccess } from "./EndorseSubprofileModalParts";

/**
 * Endorse a persona with an optional note. Renders through the shared
 * {@link ModalSheet} (bottom-sheet on mobile, centred dialog on desktop) so it
 * inherits scroll-lock, Escape-to-close, initial focus, a Tab focus-trap, and
 * focus-restore-on-close for free — its `success` prop turns the whole sheet
 * plum for the done state. Note only — no relationship radios, anonymous
 * toggle, or skill chips (endorse has no such backend concept).
 *
 * Create mode (`!viewerEndorsed`): optional note → primary "Endorse" → the
 * plum-panel success state → the user closes. Edit mode (`viewerEndorsed`):
 * the note is lazily prefilled from `useMyEndorsement`, the primary action
 * becomes "Save note" (re-endorse updates the note in place, no duplicate
 * event/count), and a "Withdraw endorsement" secondary action appears. Both
 * edit paths close with a confirmation toast rather than the success panel.
 * Self-contained: owns its form state (it's only rendered when open).
 */
export function EndorseSubprofileModal({
  subprofileId,
  endorsementCount,
  personaName,
  personaAvatarUrl,
  viewerEndorsed,
  onClose,
}: {
  subprofileId: string;
  endorsementCount: number;
  personaName: string;
  personaAvatarUrl: string | null;
  viewerEndorsed: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { endorse, withdraw } = useEndorsement(subprofileId);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "done">("form");
  const pending = endorse.isPending || withdraw.isPending;

  // Edit mode only: lazily read the viewer's existing note to prefill.
  const { data: mine, isFetching: mineFetching } = useMyEndorsement(
    subprofileId,
    { enabled: viewerEndorsed },
  );
  // Seed the textarea from the fetched note exactly once, adjusting state during
  // render (React's recommended pattern over a setState-in-effect). Gate on
  // `!mineFetching` — NOT `isLoading` — so a warm-cache re-open waits for the
  // background refetch to settle before latching, never grabbing a stale note
  // (which "Save note" would then re-persist). The field is disabled while the
  // refetch is in flight, so the user can only start editing after the (fresh)
  // prefill lands; the `prefilled` latch then keeps a later refetch from
  // clobbering their in-progress edits.
  const [prefilled, setPrefilled] = useState(false);
  if (!prefilled && viewerEndorsed && !mineFetching && mine?.note) {
    setNote(mine.note);
    setPrefilled(true);
  }

  const submit = () => {
    if (pending) return;
    endorse.mutate(
      { note: note.trim() || undefined, currentEndorsementCount: endorsementCount },
      {
        onSuccess: () => {
          if (viewerEndorsed) {
            showToast(
              t("subprofiles:hero.endorse.modal.savedToast"),
              "success",
            );
            onClose();
          } else {
            setStatus("done");
          }
        },
        onError: () => showToast(t("subprofiles:hero.endorse.error"), "error"),
      },
    );
  };

  const remove = () => {
    if (pending) return;
    withdraw.mutate(
      { currentEndorsementCount: endorsementCount },
      {
        onSuccess: () => {
          showToast(
            t("subprofiles:hero.endorse.modal.withdrawnToast"),
            "success",
          );
          onClose();
        },
        onError: () => showToast(t("subprofiles:hero.endorse.error"), "error"),
      },
    );
  };

  return (
    <ModalSheet
      onClose={onClose}
      success={status === "done"}
      ariaLabel={t("subprofiles:hero.endorse.modal.ariaLabel", {
        name: personaName,
      })}
    >
      {status === "done" ? (
        <EndorseSuccess
          personaName={personaName}
          personaAvatarUrl={personaAvatarUrl}
          onClose={onClose}
        />
      ) : (
        <EndorseForm
          personaName={personaName}
          personaAvatarUrl={personaAvatarUrl}
          viewerEndorsed={viewerEndorsed}
          note={note}
          setNote={setNote}
          noteLoading={viewerEndorsed && mineFetching}
          isPending={pending}
          onClose={onClose}
          onSubmit={submit}
          onWithdraw={remove}
        />
      )}
    </ModalSheet>
  );
}
