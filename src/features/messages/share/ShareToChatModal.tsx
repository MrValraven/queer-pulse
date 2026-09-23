import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  EmptyState,
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useConversations } from "../api/useConversations";
import { usePersonalMailboxScope } from "../mailboxes/useActiveMailbox";
import { useSendToConversations } from "./useSendToConversations";
import {
  buildShareBody,
  isConversationShareable,
  toAbsoluteShareUrl,
  type ShareableKind,
} from "./shareToChat.helpers";
import { ShareToChatPreview } from "./ShareToChatPreview";
import styles from "./ShareToChatModal.module.css";

const MAX_RECIPIENTS = 5;
const MAX_NOTE_LENGTH = 300;

export interface ShareToChatModalProps {
  url: string;
  title: string;
  kind: ShareableKind;
  onClose: () => void;
}

/**
 * "Send in a message" picker: any card or detail surface drops this in with
 * a `{ url, title, kind }` and gets the member's recent conversations (DMs +
 * groups, from the same `["conversations"]` cache the inbox reads), a filter
 * box, up to 5 recipients, an optional note, and Send. Sending posts one
 * idempotent message per picked conversation (`useSendToConversations`) whose
 * body is the note plus the absolute URL; the existing link-preview pipeline
 * unfurls it on the recipient's side, so the URL itself carries the title.
 *
 * Personal threads only, whatever mailbox is active on `/messages`: a share
 * send carries no identity, so the server would refuse one into a business
 * thread.
 *
 * Two columns on desktop: the picker and note on the left, and on the right a
 * live preview of the bubble as it will land (`ShareToChatPreview`), fed the
 * same body Send posts so the two cannot disagree.
 */
export function ShareToChatModal({
  url,
  title,
  kind,
  onClose,
}: ShareToChatModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const personalScope = usePersonalMailboxScope();
  const { data: conversations = [] } = useConversations(personalScope);
  const { sendToMany } = useSendToConversations();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  const shareable = useMemo(
    () => conversations.filter(isConversationShareable),
    [conversations],
  );
  // Adapt each conversation into the shape `MemberSelectList` already knows
  // how to render, reusing the same searchable multi-select the new-group
  // picker uses rather than forking a second one (PRD-347). A group's
  // secondary line is its member count (mirroring the forward picker's
  // `ForwardRecipientRow`); a DM's is the counterpart's pronouns.
  const people = useMemo<MemberSelectPerson[]>(
    () =>
      shareable.map((conversation) => ({
        slug: conversation.id,
        name: conversation.name,
        avatarUrl: conversation.avatarUrl,
        pronouns: conversation.isGroup
          ? t("messages:group.memberCount", {
              count:
                conversation.memberCount ?? conversation.members?.length ?? 0,
            })
          : (conversation.pronouns ?? undefined),
      })),
    [shareable, t],
  );
  // Picked conversations in pick order (a Set keeps insertion order), for the
  // preview's "To" line.
  const recipients = useMemo(
    () =>
      [...selected].flatMap((conversationId) =>
        shareable.filter((conversation) => conversation.id === conversationId),
      ),
    [selected, shareable],
  );
  const shareBody = buildShareBody(note, toAbsoluteShareUrl(url));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_RECIPIENTS) next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (selected.size === 0 || isSending) return;
    setIsSending(true);
    const targetIds = [...selected];
    const results = await sendToMany(targetIds, shareBody);
    setIsSending(false);
    const sentIds = results
      .filter((result) => result.ok)
      .map((result) => result.conversationId);
    const failed = shareable.filter(
      (conversation) =>
        targetIds.includes(conversation.id) &&
        !sentIds.includes(conversation.id),
    );
    if (sentIds.length === 0) {
      showToast(t("messages:share.errorToast"), "error");
      return;
    }
    if (failed.length > 0) {
      showToast(
        t("messages:share.partialToast", {
          sentCount: sentIds.length,
          totalCount: targetIds.length,
          failedNames: failed
            .map((conversation) => conversation.name)
            .join(", "),
        }),
        "warning",
      );
      onClose();
      return;
    }
    showToast(
      t("messages:share.successToast", { count: sentIds.length }),
      "success",
      undefined,
      sentIds.length === 1
        ? {
            label: t("messages:share.openThreadCta"),
            onClick: () => void navigate(`${routes.messages}?c=${sentIds[0]}`),
          }
        : undefined,
    );
    onClose();
  }

  if (shareable.length === 0) {
    return (
      <Modal
        title={t("messages:share.modalTitle")}
        eyebrow={title}
        onClose={onClose}
      >
        <EmptyState
          title={t("messages:share.emptyTitle")}
          description={t("messages:share.emptyDescription")}
          action={{ label: t("messages:share.emptyCta"), to: routes.messages }}
        />
      </Modal>
    );
  }

  const kindLabel = t(`messages:share.kind.${kind}`);

  return (
    <Modal
      title={t("messages:share.modalTitle")}
      eyebrow={title}
      sub={t("messages:share.modalSub", { cap: MAX_RECIPIENTS })}
      onClose={onClose}
      className={styles.dialog}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("messages:share.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSend()}
            disabled={selected.size === 0 || isSending}
          >
            {isSending
              ? t("messages:share.sendingCta")
              : t("messages:share.sendCta")}
          </Button>
        </>
      }
    >
      <p className={styles.srOnly} aria-live="polite">
        {t("messages:share.selectedCount", { count: selected.size })}
      </p>
      <div className={styles.layout}>
        <div className={styles.pickerColumn}>
          <MemberSelectList
            people={people}
            selected={selected}
            onToggle={toggle}
            cap={MAX_RECIPIENTS}
            searchPlaceholder={t("messages:share.searchPlaceholder")}
            searchAriaLabel={t("messages:share.searchAriaLabel")}
          />
          {selected.size >= MAX_RECIPIENTS && (
            <p className={styles.capNote}>
              {t("messages:share.capReached", { cap: MAX_RECIPIENTS })}
            </p>
          )}
          <label className={styles.noteLabel} htmlFor="share-to-chat-note">
            {t("messages:share.noteLabel")}
          </label>
          <textarea
            id="share-to-chat-note"
            className={styles.noteField}
            rows={2}
            maxLength={MAX_NOTE_LENGTH}
            placeholder={t("messages:share.notePlaceholder", {
              kind: kindLabel,
            })}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <span className={styles.noteCounter}>
            {t("messages:share.noteCounter", {
              count: note.length,
              max: MAX_NOTE_LENGTH,
            })}
          </span>
        </div>
        <div className={styles.previewColumn}>
          <ShareToChatPreview recipients={recipients} body={shareBody} />
        </div>
      </div>
    </Modal>
  );
}
