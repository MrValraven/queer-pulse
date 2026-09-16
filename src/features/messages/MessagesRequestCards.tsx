import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardHead } from "../connect/ConnectionCards";
import { reasonLabel } from "../connect/connectModal.data";
import type { ConnectionView } from "../connect/connections.data";
import connectStyles from "../connect/ConnectionsPage.module.css";
import { FirstContactComposer } from "./FirstContactComposer";

/**
 * PRD-344: the Requests tab's INBOUND card. A near-twin of `IncomingCard`
 * (same info, same `connectStyles` classes for visual parity with the
 * Connections page), extended with a THIRD action: `IncomingCard`'s own
 * Accept/Decline pair has no way to also open the thread, and this tab is
 * specifically where "answer it right now" matters most. Kept as its own
 * component rather than widening `IncomingCard`'s props, since that component
 * is shared with the Connections page's Incoming tab, where "message" isn't a
 * request-answering action at all (the conversation doesn't exist yet there
 * either way).
 *
 * PRD-340: Reply no longer pre-accepts and hands off to an empty composer.
 * It expands the shared `FirstContactComposer` (door="reply") right here, so
 * the member writes their OWN reply first: sending it is what accepts the
 * request, the way WhatsApp/Instagram treat a typed reply as consent. See
 * `useMessageRequestReply.ts`, which owns this state at the panel level.
 */
export function MessagesInboundRequestCard({
  view,
  onAccept,
  onDecline,
  isBusy,
  isReplying,
  replyDraft,
  onReplyDraftChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
}: {
  view: ConnectionView;
  onAccept: () => void;
  onDecline: () => void;
  isBusy: boolean;
  /** True while THIS card's reply composer is expanded. */
  isReplying: boolean;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
}) {
  const { t } = useTranslation();
  const { mutuals, sentAgo, requestMessage, requestReason } = view.meta;
  const reason = reasonLabel(requestReason, t);

  if (isReplying) {
    return (
      <div className={`${connectStyles.card} ${connectStyles.pending}`}>
        <CardHead view={view} more />
        <FirstContactComposer
          door="reply"
          target={{
            name: view.name,
            initials: view.initials,
            tint: view.tint,
            avatarUrl: view.photo,
          }}
          requestMessage={requestMessage}
          message={replyDraft}
          onMessageChange={onReplyDraftChange}
          isSending={isBusy}
          onSubmit={onSubmitReply}
          onBack={onCancelReply}
          backLabel={t("messages:firstContact.cancelReply")}
        />
      </div>
    );
  }

  return (
    <div className={`${connectStyles.card} ${connectStyles.pending}`}>
      <CardHead view={view} more />
      <div className={connectStyles.meta}>
        {mutuals != null && mutuals > 0 ? (
          <Translation
            i18nKey="connect:card.mutuals"
            components={{ b: <b /> }}
            values={{ count: mutuals }}
          />
        ) : (
          <span className={connectStyles.metaMuted}>
            {t("connect:card.noMutuals")}
          </span>
        )}
        {sentAgo && (
          <Translation
            i18nKey="connect:card.sentAgo"
            components={{ b: <b /> }}
            values={{ sentAgo }}
          />
        )}
      </div>
      {reason && (
        <p className={connectStyles.reqReason}>
          <Translation
            i18nKey="connect:card.reason"
            components={{ b: <b /> }}
            values={{ reason }}
          />
        </p>
      )}
      {requestMessage && (
        <p className={connectStyles.reqMessage}>{requestMessage}</p>
      )}
      <div className={connectStyles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onDecline}
          disabled={isBusy}
        >
          {t("connect:card.decline")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onStartReply}
          disabled={isBusy}
        >
          {t("messages:requests.replyCta")}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onAccept}
          disabled={isBusy}
        >
          {t("connect:card.accept")}
        </Button>
      </div>
    </div>
  );
}

/**
 * PRD-344: the Requests tab's OUTBOUND card, the member's OWN pending
 * message request, previously visible only under Connections > Sent. Shows
 * what `SentCard` doesn't (the written message), since re-reading what you
 * wrote is the whole point of surfacing it here. Also shows whether it has
 * been read, via `view.meta.requestRead`. `null` covers both "not
 * applicable" and "withheld by the addressee's read-receipts preference",
 * deliberately indistinguishable here, same as on any other read receipt in
 * the app.
 */
export function MessagesOutboundRequestCard({
  view,
  onWithdraw,
  isBusy,
}: {
  view: ConnectionView;
  onWithdraw: () => void;
  isBusy: boolean;
}) {
  const { t } = useTranslation();
  const { requestRead } = view.meta;
  return (
    <div className={connectStyles.card}>
      <CardHead view={view} more />
      <div className={connectStyles.meta}>
        <span className={connectStyles.metaMuted}>
          {view.meta.sentAgo ? (
            <Translation
              i18nKey="connect:card.awaitingReplySince"
              components={{ b: <b /> }}
              values={{ sentAgo: view.meta.sentAgo }}
            />
          ) : (
            t("connect:card.awaitingReply")
          )}
        </span>
        {requestRead != null && (
          <span className={connectStyles.metaMuted}>
            {requestRead ? (
              <>
                <FiCheck aria-hidden /> {t("messages:requests.readStatusRead")}
              </>
            ) : (
              t("messages:requests.readStatusUnread")
            )}
          </span>
        )}
      </div>
      {view.meta.requestMessage && (
        <p className={connectStyles.reqMessage}>{view.meta.requestMessage}</p>
      )}
      <div className={connectStyles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onWithdraw}
          disabled={isBusy}
        >
          {t("connect:card.withdraw")}
        </Button>
      </div>
    </div>
  );
}
