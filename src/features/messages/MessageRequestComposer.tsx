import { useState, type FormEvent } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Avatar, Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSendMessageRequest } from "./api/useMessageRequest";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";
import styles from "./NewMessageModal.module.css";

const MAX_LENGTH = 2000;

interface MessageRequestComposerProps {
  target: StrangerMemberResult;
  onBack: () => void;
  /** Called once the request lands — a real conversation id when the two
   *  turned out to already be connected (the server delivered `body` as an
   *  ordinary message), or null when it seeded a connection request instead
   *  (the conversation only materializes once the recipient accepts). */
  onSent: (conversationId: string | null) => void;
}

/**
 * The compose step `NewMessageModal` swaps in when the picked member isn't an
 * accepted connection yet (MSG-1). Unlike opening an existing thread, a
 * first-contact message needs its body written up front —
 * `POST /messages/request` takes the message WITH the request; there is no
 * empty thread to open and type into afterward.
 */
export function MessageRequestComposer({
  target,
  onBack,
  onSent,
}: MessageRequestComposerProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [body, setBody] = useState("");
  const sendRequest = useSendMessageRequest();
  const canSend = body.trim().length > 0 && !sendRequest.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    sendRequest.mutate(
      { toSlug: target.slug, body: body.trim() },
      {
        onSuccess: (result) => {
          showToast(
            result.conversationId
              ? t("messages:request.sentDirectToast", { name: target.name })
              : t("messages:request.sentToast", { name: target.name }),
            "success",
          );
          onSent(result.conversationId);
        },
        onError: () => {
          showToast(t("messages:request.errorToast"), "error");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.groupIdentity}>
        <Avatar
          initials={target.initials}
          tint={target.tint}
          src={target.avatarUrl}
          alt={target.name}
          size={48}
        />
        <div>
          <div className={styles.groupName}>{target.name}</div>
          <div className={styles.groupSub}>
            {t("messages:request.notConnectedYet")}
          </div>
        </div>
      </div>
      <p className={styles.sub}>{t("messages:request.composeIntro")}</p>
      <textarea
        className={styles.groupNameField}
        rows={4}
        maxLength={MAX_LENGTH}
        autoFocus
        placeholder={t("messages:request.composePlaceholder", {
          name: target.name.split(" ")[0] ?? target.name,
        })}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        aria-label={t("messages:request.composeAria")}
      />
      <div className={styles.renameActions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={sendRequest.isPending}
        >
          <FiArrowLeft aria-hidden /> {t("messages:newMessage.back")}
        </Button>
        <Button type="submit" disabled={!canSend}>
          {sendRequest.isPending ? (
            <Sending label={t("messages:request.sendingLabel")} />
          ) : (
            t("messages:request.sendCta")
          )}
        </Button>
      </div>
    </form>
  );
}
