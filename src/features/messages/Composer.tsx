// src/features/messages/Composer.tsx
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useReplyPreviewTransition } from "./useReplyPreviewTransition";
import { ComposerBlockedState } from "./ComposerBlockedState";
import { isComposerBlocked } from "./isComposerBlocked";
import { ComposerDropOverlay } from "./ComposerDropOverlay";
import { ComposerInputRow } from "./ComposerInputRow";
import { ComposerLengthCounter } from "./ComposerLengthCounter";
import { ComposerSafetyNotice } from "./ComposerSafetyNotice";
import { ComposerReplyPreview } from "./ComposerReplyPreview";
import { detectContactSafetySignals } from "./contactSafetyDetector";
import { isMessageBodyOverLimit } from "./messageBodyLimit";
import type { AttachmentStaging } from "./useAttachmentStaging";
import { useComposerAutoGrow } from "./useComposerAutoGrow";
import { useComposerFileDrop } from "./useComposerFileDrop";
import { useComposerPopovers } from "./useComposerPopovers";
import { useComposerReplyFocus } from "./useComposerReplyFocus";
import { useComposerSendHandlers } from "./useComposerSendHandlers";
import { useComposerTyping } from "./useComposerTyping";
import { useDraftSync } from "./useDraftSync";
import { useInsertMentionShortcut } from "./useInsertMentionShortcut";
import {
  loadDraftOrServerFallback,
  saveDraft,
  shouldSeedLateServerDraft,
} from "./drafts";
import type { ChatMessage, Conversation } from "./data";
import type { StickerResponse } from "../../shared/contracts/contracts";
import styles from "./MessagesPage.module.css";
import dropStyles from "./ComposerDropOverlay.module.css";

interface ComposerProps {
  active: Conversation;
  conversationId: string;
  /** Sends `body` (the composer's own current text) as a new message. The
   *  composer owns the draft and clears itself in the same frame it calls
   *  this. The caller never reads or writes draft text. */
  onSend: (body: string) => void;
  /** Sends a picked sticker as its own message. Unlike GIFs/images/documents
   *  this never routes through `staging`: a sticker sends the instant it is
   *  picked, with no caption step, so it is threaded straight through from
   *  wherever `sendSticker` originates. Absent = no Sticker entry point on
   *  either surface. */
  onSendSticker?: (sticker: StickerResponse) => void;
  blocked: boolean;
  /** The message currently being quoted for a reply, or null/absent. */
  replyDraft?: ChatMessage | null;
  /** Clears the reply draft (the preview banner's close button). */
  onCancelReply?: () => void;
  /** The message field, lifted to `ConversationComposerDock` so it stays the
   *  SAME ref across a thread switch: `useAttachmentStaging` (also lifted)
   *  returns focus to it once its caption screen closes. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Picked-media staging + background upload (DES-198/DES-199), also lifted
   *  to `ConversationComposerDock` so an item already committed to send
   *  survives a thread switch: see that file and `useAttachmentStaging`. */
  staging: AttachmentStaging;
}

/**
 * Bottom composer: severed into a notice bar for official/blocked threads.
 * Owns the new-message draft text itself (mounted with `key={active.id}` by
 * the caller so it resets per thread). A keystroke here never bubbles state
 * up to the page, so it can't re-render the thread list or the message log.
 * Seeds from, and persists to, the same per-conversation `drafts.ts` store a
 * thread switch used to rely on the controller for, plus (SOC-16) the
 * server's cross-device copy via `useDraftSync`; unrelated to the
 * message-edit inline editor, which owns its own local text entirely.
 * The throttled typing frames (`useComposerTyping`), the mutually-exclusive
 * attach/GIF/shortcut popovers (`useComposerPopovers`), and the reply-quote
 * banner are all split into colocated hooks too, so this stays under the
 * line cap. The picked-media caption staging + background upload
 * (DES-198/DES-199, photos, documents and GIFs all route through it) is
 * lifted one level up, to `ConversationComposerDock`'s `useAttachmentStaging`
 * call, and arrives here already built as the `staging` prop: see that
 * hook's own doc for why a still-uploading, already-committed send needs to
 * outlive this component's own per-thread remount.
 */
export function Composer({
  active,
  conversationId,
  onSend,
  onSendSticker,
  blocked,
  replyDraft,
  onCancelReply,
  textareaRef,
  staging,
}: ComposerProps) {
  const { t } = useTranslation();
  const firstName = active.name.split(" ")[0]!;
  const { notifyTyping, stopTyping } = useComposerTyping(conversationId);
  const { scheduleSync, syncNow } = useDraftSync(conversationId);
  // Seeded local-first, server-fallback (SOC-16); see `loadDraftOrServerFallback`.
  // Remounted (via `key={active.id}`) on thread switch, so this re-seeds per thread.
  const [draft, setDraft] = useState(() =>
    loadDraftOrServerFallback(conversationId, active.draft),
  );
  const { demoMode } = useDemoMode();
  // SOC-16/ENG-253: `active.draft` (the server's cross-device copy) can
  // resolve AFTER this composer has already mounted, via a separate detail
  // fetch (`useMessagesController`'s `GET /conversations/:id`) the mount-time
  // seed above couldn't wait for. `hasSeededLateServerDraftRef` caps the seed
  // effect below at once per thread: this component remounts via
  // `key={active.id}` on a real thread switch, which resets it; nothing else
  // does, so a refetch or a window refocus of the SAME thread's detail query
  // can't reapply it. `hasMemberTypedRef`, set by `setDraftAndMarkTyped` on
  // every user-driven change (typing, a mention-shortcut insert, or the
  // clear-on-send), guards against clobbering even after a type-then-delete-
  // to-empty, which an empty `draft` alone reads identically to "never
  // typed". See `shouldSeedLateServerDraft` for the full precedence.
  const hasSeededLateServerDraftRef = useRef(false);
  const hasMemberTypedRef = useRef(false);
  const setDraftAndMarkTyped = useCallback((nextValue: string) => {
    hasMemberTypedRef.current = true;
    setDraft(nextValue);
  }, []);
  useEffect(() => {
    if (demoMode) return;
    if (
      !shouldSeedLateServerDraft({
        hasAlreadySeeded: hasSeededLateServerDraftRef.current,
        hasMemberTyped: hasMemberTypedRef.current,
        currentDraft: draft,
        serverDraft: active.draft,
      })
    ) {
      return;
    }
    hasSeededLateServerDraftRef.current = true;
    const seeded = active.draft ?? "";
    setDraft(seeded);
    saveDraft(conversationId, seeded);
    // Reposition the caret only when the field is already focused (untyped
    // but tapped into): never steals focus otherwise, and mirrors the
    // end-of-text convention `useInsertMentionShortcut` already uses when it
    // changes the draft out from under a focused field.
    const node = textareaRef.current;
    if (node && document.activeElement === node) {
      requestAnimationFrame(() =>
        node.setSelectionRange(node.value.length, node.value.length),
      );
    }
  }, [active.draft, conversationId, demoMode, draft, textareaRef]);
  // Advisory-only, recomputed per keystroke; see `ComposerSafetyNotice`.
  const safetySignals = useMemo(
    () => detectContactSafetySignals(draft),
    [draft],
  );
  // Keeps the reply-preview banner's content mounted through its collapse/
  // fade-out so dismissing it (✕ or post-send clear) actually animates
  // instead of snapping away; see the hook for why `ComposerReplyPreview`
  // is always rendered rather than conditionally on `replyDraft`.
  const { previewMessage, open: replyPreviewOpen } =
    useReplyPreviewTransition(replyDraft);
  // Exactly one composer popover (the attach menu, the GIF picker it hands off
  // to, or the shortcut hint) is open at a time; see `useComposerPopovers`.
  const {
    openPopover,
    popoverGroupRef,
    togglePopover,
    showPopover,
    closePopover,
  } = useComposerPopovers();
  useComposerAutoGrow(textareaRef, draft);
  const insertShortcut = useInsertMentionShortcut(
    conversationId,
    draft,
    setDraftAndMarkTyped,
    scheduleSync,
    closePopover,
    textareaRef,
  );
  // DES-202: mirrors the server's own `MESSAGE_BODY_MAX_LENGTH` rejection so
  // `handleSend`/Enter-to-send can no-op before that round-trip; the same
  // helper backs `ComposerLengthCounter` below, so the two never disagree.
  const isOverLimit = isMessageBodyOverLimit(draft);
  // DES-204: paste/drop stage through the SAME `onImagePicked`/
  // `onDocumentPicked` entry points the attach menu's rows call.
  const { isDraggingFiles, containerRef, dropHandlers, onPaste } =
    useComposerFileDrop(staging);
  useComposerReplyFocus(replyDraft?.id, textareaRef);
  // I5: shared between the length counter's visible span and the textarea/
  // send button's `aria-describedby`, so a screen reader reaches the "too
  // long" reason from either control once `isOverLimit` is true.
  const counterId = useId();
  // The send/change/blur/Enter-to-send wiring, split into its own hook to
  // keep this component under the line cap; see that file's own doc.
  const { handleSend, handleBlur, handleChange, handleComposerKeyDown } =
    useComposerSendHandlers({
      conversationId,
      draft,
      setDraft: setDraftAndMarkTyped,
      isOverLimit,
      onSend,
      notifyTyping,
      stopTyping,
      scheduleSync,
      syncNow,
    });

  // `ComposerBlockedState` picks between the severed-thread notices, split
  // out purely to keep THIS component under the line cap; `isComposerBlocked`
  // is the same condition it branches on, so this component can choose
  // between it and the normal input row without evaluating that body twice.
  const isBlocked = isComposerBlocked(active, blocked);
  const composerPlaceholder = active.isGroup
    ? t("messages:conversation.composerGroupPlaceholder")
    : t("messages:conversation.composerPlaceholder", { name: firstName });

  return isBlocked ? (
    <ComposerBlockedState
      active={active}
      blocked={blocked}
      firstName={firstName}
      isBlocked={isBlocked}
      pendingStrip={staging.pendingStrip}
      screen={staging.screen}
    />
  ) : (
    <div
      ref={containerRef}
      className={[styles.composer, dropStyles.composerDropZone].join(" ")}
      {...dropHandlers}
    >
      {/* DES-204: painted OVER the composer while a file is being dragged
          over it, never intercepting the drag itself; see the hook's own
          doc for why the handlers live on this wrapping element rather than
          just the input pill (the whole composer is the drop target). */}
      {isDraggingFiles && <ComposerDropOverlay />}
      {/* Advisory, non-blocking safety hint (P0.7): phone/email/banking/
          external-payment content in the draft. Never gates `handleSend`. */}
      <ComposerSafetyNotice
        signals={safetySignals}
        conversationId={conversationId}
        onDismiss={() => textareaRef.current?.focus()}
      />
      <ComposerReplyPreview
        previewMessage={previewMessage}
        open={replyPreviewOpen}
        isGroup={active.isGroup}
        activeName={active.name}
        onCancelReply={onCancelReply}
      />
      {staging.pendingStrip}
      <ComposerInputRow
        textareaRef={textareaRef}
        popoverGroupRef={popoverGroupRef}
        openPopover={openPopover}
        onTogglePopover={togglePopover}
        onOpenPopover={showPopover}
        onClosePopover={closePopover}
        onSendGif={staging.onSendGif}
        onImagePicked={staging.onImagePicked}
        onDocumentPicked={staging.onDocumentPicked}
        onSendSticker={onSendSticker}
        onInsertShortcut={insertShortcut}
        placeholder={composerPlaceholder}
        draft={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleComposerKeyDown}
        onPaste={onPaste}
        onSend={handleSend}
        sendLabel={t("messages:conversation.send")}
        messageFieldLabel={t("messages:conversation.composeAria")}
        isOverLimit={isOverLimit}
        counterId={counterId}
      />
      <ComposerLengthCounter body={draft} counterId={counterId} />
      {staging.screen}
    </div>
  );
}
