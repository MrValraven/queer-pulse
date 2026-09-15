// src/features/messages/useAttachmentStaging.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AttachmentCaptionScreen } from "./AttachmentCaptionScreen";
import type { GifAttachment } from "../../shared/api/gifs";

/** A picked image or GIF sitting in the WhatsApp-style caption screen, not yet
 *  sent. The upload (for an image) has already happened by the time this
 *  exists, since staging only defers the SEND, never the upload. Closing the
 *  screen discards the staged item but leaves the already-uploaded object in
 *  place, same as an abandoned/failed send today. */
export type StagedAttachment =
  | {
      kind: "image";
      attachment: GifAttachment;
      localAttachment?: GifAttachment;
    }
  | { kind: "gif"; attachment: GifAttachment };

export interface AttachmentStaging {
  /** Wired to `ComposerInputRow`'s `onSendGif`, stages instead of sending
   *  immediately. Gated to `undefined` exactly when the caller didn't wire a
   *  real GIF send path, so the attach menu's GIF row stays hidden precisely
   *  as it did before staging existed. */
  onSendGif?: (attachment: GifAttachment) => void;
  /** Wired to `ComposerInputRow`'s `onSendImage`, stages instead of sending
   *  immediately. Gated the same way as `onSendGif` above. */
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** The caption screen itself, already wired to send/discard, or `null`
   *  while nothing is staged. Render it directly wherever `Composer` mounts
   *  the rest of the input row. `null` (never a mounted-but-empty component)
   *  matters here: `AttachmentCaptionScreen` calls `useDismiss`, which locks
   *  scroll and joins the shared modal stack for as long as it is MOUNTED, so
   *  it must only ever be mounted while a caption screen is actually open. */
  screen: ReactNode;
}

/**
 * Defers a picked GIF or uploaded image behind a full-screen caption step
 * (WhatsApp Web-style) instead of sending it the instant it's picked. Holds
 * the staged item, produces gated `onSendGif`/`onSendImage` replacements for
 * `Composer` to hand down to `ComposerInputRow`, and renders the caption
 * screen itself so `Composer` only needs to place `screen` in its tree.
 *
 * Documents keep their instant-send behaviour (`DocumentComposerButton` is
 * untouched, and its `onSendDocument` never routes through here).
 */
export function useAttachmentStaging({
  onSendGif,
  onSendImage,
  textareaRef,
}: {
  onSendGif?: (attachment: GifAttachment) => void;
  onSendImage?: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
  /** The composer's message field, which takes focus back once the screen
   *  closes (sent or discarded), the same way `EmojiComposerButton` returns
   *  focus after its picker. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}): AttachmentStaging {
  const [staged, setStaged] = useState<StagedAttachment | null>(null);
  const wasStagedRef = useRef(false);

  // Runs AFTER the unmounted screen's `useDismiss` cleanup has restored focus
  // to whichever attach row opened it (React runs a removed child's effect
  // cleanups before the parent's own passive effects), so this focus call is
  // the one that sticks. Watching the open-to-closed transition rather than
  // focusing inside `sendStaged`/`discard` is what makes that ordering hold.
  useEffect(() => {
    if (wasStagedRef.current && staged === null) {
      textareaRef.current?.focus();
    }
    wasStagedRef.current = staged !== null;
  }, [staged, textareaRef]);

  const stageGif = useCallback((attachment: GifAttachment) => {
    setStaged({ kind: "gif", attachment });
  }, []);

  const stageImage = useCallback(
    (attachment: GifAttachment, localAttachment?: GifAttachment) => {
      setStaged({ kind: "image", attachment, localAttachment });
    },
    [],
  );

  const discard = useCallback(() => setStaged(null), []);

  // Sends the staged item through the ORIGINAL `onSendGif`/`onSendImage` with
  // `caption` merged onto the attachment (never an empty string, since the
  // bubble tests truthiness), then discards.
  const sendStaged = useCallback(
    (caption: string | undefined) => {
      if (!staged) return;
      if (staged.kind === "gif") {
        onSendGif?.({ ...staged.attachment, caption });
      } else {
        onSendImage?.(
          { ...staged.attachment, caption },
          staged.localAttachment
            ? { ...staged.localAttachment, caption }
            : undefined,
        );
      }
      setStaged(null);
    },
    [staged, onSendGif, onSendImage],
  );

  return {
    onSendGif: onSendGif ? stageGif : undefined,
    onSendImage: onSendImage ? stageImage : undefined,
    screen: staged && (
      <AttachmentCaptionScreen
        staged={staged}
        onSend={sendStaged}
        onClose={discard}
      />
    ),
  };
}
