import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Modal, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { connectionToRecipient } from "./forwardRecipient.helpers";
import { ForwardChipStrip } from "./ForwardChipStrip";
import { ForwardMessagePreview } from "./ForwardMessagePreview";
import { ForwardRecipientList } from "./ForwardRecipientList";
import {
  MAX_FORWARD_RECIPIENTS,
  useForwardSelection,
} from "./useForwardSelection";
import { useForwardSend } from "./useForwardSend";
import type { MessageForwarding } from "./useMessageForwarding";
import type { ChatMessage, Conversation } from "./data";
import styles from "./ForwardPickerModal.module.css";

interface ForwardPickerModalProps {
  /** The message being forwarded, rendered as a preview and carried,
   *  unchanged, into every recipient's own `forwardMessage` call. */
  message: ChatMessage;
  /** Active group conversations, shown as a "Groups" section below People. */
  groups: Conversation[];
  forwardMessage: MessageForwarding["forwardMessage"];
  onClose: () => void;
}

/**
 * WhatsApp-style forward picker (DES-206): a message preview, a capped
 * multi-select of connections + live groups (checkbox rows + a
 * selected-count chip strip), and an explicit Send that confirms the whole
 * batch at once, rather than sending the moment a row is picked. The
 * member's own view never changes (see `useMessageForwarding`'s doc); a
 * partial failure keeps exactly the failed recipients selected so a retry
 * only re-sends to them. Built on the shared `Modal`
 * (scroll-lock/focus-trap/Escape via `useDismiss`), reusing
 * `NewMessageModal`'s own connection-pool data hooks.
 */
export function ForwardPickerModal({
  message,
  groups,
  forwardMessage,
  onClose,
}: ForwardPickerModalProps) {
  const { t } = useTranslation();
  const { isBlocked } = useSocial();
  const staffMap = useStaffMap();
  const [query, setQuery] = useState("");
  const { selected, isSelected, isAtCap, toggle, remove, keepOnly } =
    useForwardSelection();
  const { send, isSending, failedRecipientIds } = useForwardSend(
    message,
    forwardMessage,
  );
  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");
  const capNoticeId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // A picker with a search box must see EVERY connection, not just the first
  // page. Drain the remaining pages while open (mirrors NewMessageModal).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // After a partial failure, only the recipients that actually failed stay
  // selected. A retry then only re-sends to them, never double-sends to the
  // ones that already went through.
  useEffect(() => {
    if (failedRecipientIds.size > 0) keepOnly(failedRecipientIds);
  }, [failedRecipientIds, keepOnly]);

  // Initial focus lands on the search field, not the modal's own close
  // button (`useDismiss`'s default first-focusable, which is the X in the
  // header): the field is what the member actually wants to start typing
  // into.
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const candidates = useMemo(
    () =>
      views.filter((view) => !isBlocked(view.slug)).map(connectionToRecipient),
    [views, isBlocked],
  );

  const people = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? candidates.filter((candidate) =>
          candidate.name.toLowerCase().includes(needle),
        )
      : candidates;
  }, [query, candidates]);

  const groupResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const activeGroups = groups.filter((group) => group.isGroup);
    return needle
      ? activeGroups.filter((group) =>
          group.name.toLowerCase().includes(needle),
        )
      : activeGroups;
  }, [query, groups]);

  function handleClose() {
    if (isSending) return;
    onClose();
  }

  function handleSend() {
    if (selected.length === 0 || isSending) return;
    send(selected, onClose);
  }

  const selectedCount = selected.length;

  return (
    <Modal
      title={t("messages:forward.title")}
      sub={t("messages:forward.pickerSub", { max: MAX_FORWARD_RECIPIENTS })}
      onClose={handleClose}
      footer={
        <Button
          variant="primary"
          disabled={selectedCount === 0 || isSending}
          onClick={handleSend}
        >
          {selectedCount === 0
            ? t("messages:forward.sendCtaEmpty")
            : t("messages:forward.sendCta", { count: selectedCount })}
        </Button>
      }
    >
      <ForwardMessagePreview message={message} />
      <ForwardChipStrip
        selected={selected}
        isSending={isSending}
        remove={remove}
        searchInputRef={searchInputRef}
      />
      <p id={capNoticeId} className={styles.capNotice} aria-live="polite">
        {isAtCap
          ? t("messages:forward.capReached", { max: MAX_FORWARD_RECIPIENTS })
          : ""}
      </p>
      <SearchInput
        className={styles.searchField}
        inputRef={searchInputRef}
        value={query}
        onChange={setQuery}
        placeholder={t("messages:newMessage.searchPlaceholder")}
        ariaLabel={t("messages:newMessage.searchAria")}
      />
      <ForwardRecipientList
        people={people}
        groupResults={groupResults}
        staffMap={staffMap}
        loading={loading}
        candidatesCount={candidates.length}
        query={query}
        isSelected={isSelected}
        isAtCap={isAtCap}
        isSending={isSending}
        capNoticeId={capNoticeId}
        onToggle={toggle}
      />
    </Modal>
  );
}
