import { useState, type KeyboardEvent } from "react";
import { FiSend } from "react-icons/fi";
import { Button, type ButtonVariant } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  usePieceMessageMutations,
  type PieceThreadSide,
} from "../api/usePieceMessages";
import styles from "./PieceThread.module.css";

export interface PieceThreadComposerProps {
  pieceId: string;
  side: PieceThreadSide;
  /** The Send button's look. The desk peek passes `ghost`, so the desk keeps
   *  one filled coral button per screen (the sidebar's Write). */
  sendVariant?: ButtonVariant;
  /** Seeds the draft once when this composer mounts (the Chase modal's
   *  editable starting message, built from the piece by `chaseDraft.ts`).
   *  A later change to this prop does not touch an in-progress edit; a fresh
   *  draft per piece comes from remounting the composer (key by piece id). */
  initialDraft?: string;
}

/**
 * The reply box under a piece thread: a textarea and Send, where Enter sends
 * and Shift+Enter starts a new line. One composer for every thread (the Chase
 * modal, the writer's message overlay, the desk peek), so a fix lands once.
 *
 * The draft clears only once the send succeeds. A failed send keeps the text
 * where it was and says so, so nothing typed is lost. Enter while an input
 * method is still composing (Japanese, Chinese, Korean) confirms the
 * character; it does not send.
 */
export function PieceThreadComposer({
  pieceId,
  side,
  sendVariant = "primary",
  initialDraft,
}: PieceThreadComposerProps) {
  const { t } = useTranslation();
  const { send } = usePieceMessageMutations(pieceId, side);
  const [draft, setDraft] = useState(() => initialDraft ?? "");
  const isSendBlocked = !draft.trim() || send.isPending;

  function handleSend(): void {
    const trimmed = draft.trim();
    if (!trimmed || send.isPending) return;
    send.mutate(trimmed, {
      // Anything typed while the send was in flight stays in the box.
      onSuccess: () =>
        setDraft((current) => (current.trim() === trimmed ? "" : current)),
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    // Safari reports the Enter that ends a composition with keyCode 229 and
    // `isComposing` already false, so both are checked.
    const isComposing =
      event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229;
    if (event.key === "Enter" && !event.shiftKey && !isComposing) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.composerBlock}>
      <div className={styles.composer}>
        <textarea
          aria-label={t("magazine:pieceThread.composerAria")}
          placeholder={t("magazine:pieceThread.composerPlaceholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <Button
          size="sm"
          variant={sendVariant}
          onClick={handleSend}
          // `aria-disabled`: a real `disabled` right after a click-to-send
          // would drop focus to the page body. `handleSend` guards the press.
          aria-disabled={isSendBlocked}
        >
          <FiSend aria-hidden /> {t("magazine:pieceThread.send")}
        </Button>
      </div>
      {send.isError && (
        <p className={styles.sendError} role="alert">
          {t("magazine:pieceThread.sendError")}
        </p>
      )}
    </div>
  );
}
