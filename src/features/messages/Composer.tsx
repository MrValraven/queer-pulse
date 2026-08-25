// src/features/messages/Composer.tsx
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReplyPreviewTransition } from "./useReplyPreviewTransition";
import { ComposerInputRow } from "./ComposerInputRow";
import { ComposerSafetyNotice } from "./ComposerSafetyNotice";
import { ComposerReplyPreview } from "./ComposerReplyPreview";
import { ComposerSeveredNotice } from "./ComposerSeveredNotice";
import { detectContactSafetySignals } from "./contactSafetyDetector";
import { useComposerAutoGrow } from "./useComposerAutoGrow";
import { useComposerPopovers } from "./useComposerPopovers";
import { useComposerTyping } from "./useComposerTyping";
import { clearDraft, loadDraft, saveDraft } from "./drafts";
import type { GifAttachment } from "../../shared/api/gifs";
import type { ChatMessage, Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerProps {
  active: Conversation;
  conversationId: string;
  /** Sends `body` (the composer's own current text) as a new message. The
   *  composer owns the draft and clears itself in the same frame it calls
   *  this — the caller never reads or writes draft text. */
  onSend: (body: string) => void;
  blocked: boolean;
  /** The message currently being quoted for a reply, or null/absent. */
  replyDraft?: ChatMessage | null;
  /** Clears the reply draft (the preview banner's close button). */
  onCancelReply?: () => void;
  /** Sends a picked GIF as its own message. When absent, the GIF button is
   *  hidden (e.g. surfaces that don't wire the picker). */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Sends an uploaded image as its own message. When absent, the photo
   *  attach button is hidden (e.g. surfaces that don't wire uploads). */
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
}

/**
 * Bottom composer: severed into a notice bar for official/blocked threads.
 *
 * Owns the new-message draft text itself (mounted with `key={active.id}` by
 * the caller so it resets per thread) — a keystroke here never bubbles state
 * up to the page, so it can't re-render the thread list or the message log.
 * Seeds from, and persists to, the same per-conversation `drafts.ts` store a
 * thread switch used to rely on the controller for; unrelated to the
 * message-edit inline editor, which owns its own local text entirely (see
 * `InlineEditField`) and is untouched by this component.
 *
 * The throttled typing frames (`useComposerTyping`), the mutually-exclusive
 * GIF/shortcut popovers (`useComposerPopovers`), and the reply-quote banner
 * (`ComposerReplyPreview`) are split into colocated files so this component
 * stays under the line cap.
 */
export function Composer({
  active,
  conversationId,
  onSend,
  blocked,
  replyDraft,
  onCancelReply,
  onSendGif,
  onSendImage,
}: ComposerProps) {
  const { t } = useTranslation();
  const firstName = active.name.split(" ")[0]!;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { notifyTyping, stopTyping } = useComposerTyping(conversationId);
  // The new-message draft, local to this component instance. Seeded once from
  // the persisted per-conversation store; the caller remounts this component
  // (via `key={active.id}`) on thread switch, so this lazy initializer re-runs
  // per thread instead of needing an effect to resync it.
  const [draft, setDraft] = useState(() => loadDraft(conversationId));
  // Advisory-only, recomputed per keystroke — see `ComposerSafetyNotice`.
  const safetySignals = useMemo(
    () => detectContactSafetySignals(draft),
    [draft],
  );
  // Keeps the reply-preview banner's content mounted through its collapse/
  // fade-out so dismissing it (✕ or post-send clear) actually animates
  // instead of snapping away — see the hook for why `ComposerReplyPreview`
  // is always rendered rather than conditionally on `replyDraft`.
  const { previewMessage, open: replyPreviewOpen } =
    useReplyPreviewTransition(replyDraft);
  // Exactly one composer popover (GIF picker or the shortcut hint) is open at a
  // time — see `useComposerPopovers`.
  const { openPopover, popoverGroupRef, togglePopover, closePopover } =
    useComposerPopovers();
  useComposerAutoGrow(textareaRef, draft);

  /** Drops a mention sigil into the draft (with a leading space when needed so
   *  the sigil sits at a word boundary — where `detectTrigger` fires), then
   *  focuses the input with the caret at the end so typeahead opens as the
   *  member types. Closes the popover so the screen stays uncluttered. */
  function insertShortcut(sigil: string) {
    const needsSpace = draft.length > 0 && !/\s$/.test(draft);
    const next = `${draft}${needsSpace ? " " : ""}${sigil}`;
    setDraft(next);
    saveDraft(conversationId, next);
    closePopover();
    requestAnimationFrame(() => {
      const node = textareaRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    });
  }

  /** Enter-to-send and the send button both funnel through here so a send
   *  always clears the idle timer and tells the counterpart we've stopped.
   *  Clears the composer's own text (and its persisted draft) in the same
   *  frame the message is handed up, so the input empties instantly. */
  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    stopTyping(true);
    onSend(body);
    setDraft("");
    clearDraft(conversationId);
  }

  function handleBlur() {
    stopTyping(false);
  }

  function handleChange(nextValue: string) {
    setDraft(nextValue);
    saveDraft(conversationId, nextValue);
    notifyTyping();
  }

  /** Enter-to-send (desktop, non-touch) — passed through to `MentionTextarea`,
   *  which invokes this only when the mention suggestion popup is closed, so
   *  Enter with the popup open still inserts the highlighted mention instead. */
  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (event.key === "Enter" && !event.shiftKey && !isCoarsePointer) {
      event.preventDefault();
      handleSend();
    }
  }

  // Official thread, blocked counterpart, or a group the member has left —
  // see `ComposerSeveredNotice`'s own doc for what each notice says.
  if (active.official || blocked || (active.isGroup && active.hasLeft)) {
    return (
      <ComposerSeveredNotice
        active={active}
        blocked={blocked}
        firstName={firstName}
      />
    );
  }
  const composerPlaceholder = active.isGroup
    ? t("messages:conversation.composerGroupPlaceholder")
    : t("messages:conversation.composerPlaceholder", { name: firstName });

  return (
    <div className={styles.composer}>
      {/* Advisory, non-blocking safety hint (P0.7) — phone/email/banking/
          external-payment content in the draft. Never gates `handleSend`. */}
      <ComposerSafetyNotice signals={safetySignals} />
      <ComposerReplyPreview
        previewMessage={previewMessage}
        open={replyPreviewOpen}
        isGroup={active.isGroup}
        activeName={active.name}
        onCancelReply={onCancelReply}
      />
      <ComposerInputRow
        textareaRef={textareaRef}
        popoverGroupRef={popoverGroupRef}
        openPopover={openPopover}
        onTogglePopover={togglePopover}
        onClosePopover={closePopover}
        onSendGif={onSendGif}
        onSendImage={onSendImage}
        onInsertShortcut={insertShortcut}
        placeholder={composerPlaceholder}
        draft={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleComposerKeyDown}
        onSend={handleSend}
        sendLabel={t("messages:conversation.send")}
      />
    </div>
  );
}
