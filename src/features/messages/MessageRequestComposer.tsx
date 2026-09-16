import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FirstContactComposer } from "./FirstContactComposer";
import { messageRequestErrorKey } from "./api/firstContactError";
import { useSendMessageRequest } from "./api/useMessageRequest";
import type { StrangerMemberResult } from "./api/useStrangerMemberSearch";

interface MessageRequestComposerProps {
  target: StrangerMemberResult;
  onBack: () => void;
  /** Called once the request lands: a real conversation id when the two
   *  turned out to already be connected (the server delivered `body` as an
   *  ordinary message), or null when it seeded a connection request instead
   *  (the conversation only materializes once the recipient accepts). */
  onSent: (conversationId: string | null) => void;
}

/**
 * The compose step `NewMessageModal` swaps in when the picked member isn't an
 * accepted connection yet (MSG-1). Unlike opening an existing thread, a
 * first-contact message needs its body written up front:
 * `POST /messages/request` takes the message WITH the request; there is no
 * empty thread to open and type into afterward.
 *
 * The interaction/copy/safety-notice/counter/footer are ALL owned by the
 * shared `FirstContactComposer` (PRD-340, door="messageRequest"); this
 * component is just the door's own data wiring (state, mutation, toasts).
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

  function handleSubmit() {
    if (sendRequest.isPending) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    sendRequest.mutate(
      { toSlug: target.slug, body: trimmed },
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
        onError: (error) => {
          // PRD-365/366: a coded refusal (daily or pending cap, a paused
          // account, a recipient who only hears from connections) gets its
          // own warm, specific copy; anything else keeps the generic retry.
          showToast(
            t(messageRequestErrorKey(error) ?? "messages:request.errorToast", {
              name: target.name.split(" ")[0] ?? target.name,
            }),
            "error",
          );
        },
      },
    );
  }

  return (
    <FirstContactComposer
      door="messageRequest"
      target={{
        name: target.name,
        initials: target.initials,
        tint: target.tint,
        avatarUrl: target.avatarUrl,
      }}
      message={body}
      onMessageChange={setBody}
      isSending={sendRequest.isPending}
      onSubmit={handleSubmit}
      onBack={onBack}
      backLabel={t("messages:newMessage.back")}
    />
  );
}
