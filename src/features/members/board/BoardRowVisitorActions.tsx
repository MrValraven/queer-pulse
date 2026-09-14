import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import { ApiError } from "../../../shared/api/client";
import { useRespondToBoardItem } from "../api/useRespondToBoardItem";
import type { BoardItem } from "../data/members";
import styles from "./BoardSection.module.css";

/**
 * A visitor's side of a board row: offer to help, with an optional line,
 * or say a quick hello, alongside it.
 *
 * The two are independent actions server-side: the unique index is on
 * (post, responder, KIND), not just (post, responder), so a visitor can
 * do both, and each tracks its own "already done" state rather than one
 * flag hiding the whole row. "Offer to help" keeps its note, which is
 * where the detail a post has no body field for gets exchanged; "Say
 * hello" is the lower-friction wave that needs none of that, so it sends
 * on the first click rather than opening a confirm step.
 *
 * A repeat response of either kind answers 409 from the backend, a state
 * to report ("you already did this") rather than a failure. Anything
 * else — a dropped connection, a 403 — is a genuine failure and must not
 * collapse into that same message: only the 409 is a deliberate no-op the
 * member already lived through, so it is the only status this narrows on.
 */
export function BoardRowVisitorActions({
  item,
  memberSlug,
  memberFirst,
}: {
  item: BoardItem;
  memberSlug: string;
  memberFirst: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const respond = useRespondToBoardItem();
  const [respondingNote, setRespondingNote] = useState<string | null>(null);
  const [hasOffered, setHasOffered] = useState(false);
  const [hasSaidHello, setHasSaidHello] = useState(false);

  async function sendHelp() {
    try {
      await respond.mutateAsync({
        memberSlug,
        postSlug: item.slug,
        kind: "help",
        note: respondingNote?.trim() || undefined,
      });
      setHasOffered(true);
      setRespondingNote(null);
      showToast(
        t("members:content.board.respondSuccess", { name: memberFirst }),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setHasOffered(true);
        setRespondingNote(null);
        showToast(t("members:content.board.respondAlready"));
        return;
      }
      showToast(t("shared:social.genericError"), "error");
    }
  }

  async function sendHello() {
    try {
      await respond.mutateAsync({
        memberSlug,
        postSlug: item.slug,
        kind: "hello",
      });
      setHasSaidHello(true);
      showToast(
        t("members:content.board.respondSuccess", { name: memberFirst }),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setHasSaidHello(true);
        showToast(t("members:content.board.helloAlready"));
        return;
      }
      showToast(t("shared:social.genericError"), "error");
    }
  }

  if (respondingNote !== null) {
    return (
      <div className={styles.respondConfirm}>
        <input
          className={styles.respondNoteInput}
          type="text"
          value={respondingNote}
          maxLength={280}
          placeholder={t("members:content.board.respondNotePlaceholder")}
          aria-label={t("members:content.board.respondNoteLabel")}
          onChange={(event) => setRespondingNote(event.target.value)}
        />
        <div className={styles.respondConfirmActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRespondingNote(null)}
          >
            {t("members:content.board.respondCancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={respond.isPending}
            onClick={() => void sendHelp()}
          >
            {t("members:content.board.respondSend")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {hasOffered ? (
        <span className={styles.respondersLine}>
          {t("members:content.board.respondedLabel")}
        </span>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setRespondingNote("")}>
          {t("members:content.board.respondCta")}
        </Button>
      )}
      {hasSaidHello ? (
        <span className={styles.respondersLine}>
          {t("members:content.board.helloSentLabel")}
        </span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={respond.isPending}
          onClick={() => void sendHello()}
        >
          {t("members:content.board.helloCta")}
        </Button>
      )}
    </div>
  );
}
