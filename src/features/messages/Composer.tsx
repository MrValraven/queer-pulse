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
import { ComposerConnectionNotice } from "./ComposerConnectionNotice";
import { ComposerDropOverlay } from "./ComposerDropOverlay";
import { ComposerInputRow } from "./ComposerInputRow";
import { ComposerLengthCounter } from "./ComposerLengthCounter";
import { ComposerSafetyNotice } from "./ComposerSafetyNotice";
import { ComposerReplyPreview } from "./ComposerReplyPreview";
import { ComposerSeveredNotice } from "./ComposerSeveredNotice";
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
import styles from "./MessagesPage.module.css";
import dropStyles from "./ComposerDropOverlay.module.css";

interface ComposerProps {
  active: Conversation;
  conversationId: string;
  /** Sends `body` (the composer's own current text) as a new message. The
   *  composer owns the draft and clears itself in the same frame it calls
   *  this. The caller never reads or writes draft text. */
  onSend: (body: string) => void;
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

  // Official thread, blocked counterpart, or a group the member has left:
  // see `ComposerSeveredNotice`'s own doc for what each notice says. The
  // pending strip still renders above it, so an attachment already
  // committed to send before the thread turned severed stays visible here
  // for the member to watch finish or cancel. F2: `staging.screen` (the
  // caption step) also renders here, since `useAttachmentStaging` exposes no
  // discard-only entry point this component can call to close it on its own
  // when a thread turns severed mid-caption; see the file's own doc. Leaving
  // it unrendered would strand an open caption screen with no way to close
  // it once the notice below replaces the rest of the composer.
  // ENG-243: a DM whose counterpart erased their account has nobody left to
  // read a reply, so it gets the same notice bar as the severed states.
  if (active.isCounterpartErased) {
    return (
      <div className={styles.composer}>
        <div className={styles.officialBar}>
          {t("messages:conversation.formerMemberNotice")}
        </div>
      </div>
    );
  }
  if (active.official || blocked || (active.isGroup && active.hasLeft)) {
    return (
      <div className={styles.composer}>
        {staging.pendingStrip}
        <ComposerSeveredNotice
          active={active}
          blocked={blocked}
          firstName={firstName}
        />
        {staging.screen}
      </div>
    );
  }
  // A cold enquiry (housing/flatmate, etc.) opened this DM between two
  // members who aren't accepted connections (PRD-220): the server's ordinary
  // send path 403s every reply from EITHER side past that first enquiry. Tell
  // the truth and offer the fix in place, rather than rendering a normal
  // composer whose send will fail. Checked after the severed states above:
  // blocked/official/left-group already explain why sending is impossible and
  // outrank this notice if both were somehow true at once. F1: the pending
  // strip still renders here too, so an item already committed to send
  // before the thread required a connection stays visible and cancelable.
  if (active.replyRequiresConnection) {
    return (
      <div className={styles.composer}>
        {staging.pendingStrip}
        <ComposerConnectionNotice active={active} />
      </div>
    );
  }
  const composerPlaceholder = active.isGroup
    ? t("messages:conversation.composerGroupPlaceholder")
    : t("messages:conversation.composerPlaceholder", { name: firstName });

  return (
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
