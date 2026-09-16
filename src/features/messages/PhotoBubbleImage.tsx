// src/features/messages/PhotoBubbleImage.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useChatImageViewer } from "./ChatImageViewerContext";
import { PHOTO_RETRY_EVENT, retryIfPhotoFailed } from "./photoRetry";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** The tappable image inside a photo/GIF bubble: a keyboard-reachable
 *  `<span role="button">` wrapping the `<img>`. Deliberately a span, not a
 *  `<button>`: a real button is treated as an interactive target by
 *  `isInteractiveTarget` in `useMessageGestures`, which would suppress
 *  long-press, right-click and swipe-to-reply on every photo bubble.
 *
 *  No `onClick` here on purpose. Pointer/touch/mouse activation already flows
 *  through the bubble wrap's `onActivate` (see `MessageBubble`), which is the
 *  path that correctly arbitrates against swipe-to-reply and long-press; a
 *  click handler on this span would fire a SECOND time for the same physical
 *  tap, since nothing on the pointer path calls `preventDefault()` to stop
 *  the synthesized click. Keyboard activation is `onKeyDown` alone, which
 *  never goes through the pointer path, so it stays exactly one call.
 *
 *  The span holds a sized frame so the bubble keeps its box before decode (a
 *  bare lazy `<img>` inside this fit-content chain measures 0x0 until then).
 *  Until the first `load` the frame shows a loading wash; on `error` the image
 *  is swapped for a fallback in the same frame, and activating it (by either
 *  path, through `retryIfPhotoFailed`) remounts the `<img>` for one more try
 *  instead of opening the viewer. */
export function PhotoBubbleImage({
  message,
  senderName,
  url,
  width,
  height,
  aspectRatio,
  imageAlt,
  contentLabelId,
  openLabel,
  onKeyboardOpenActions,
}: {
  message: ChatMessage;
  senderName: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  imageAlt: string;
  /** Id the bubble's `aria-labelledby` points at: the `<img>` (its alt), or
   *  the fallback's text while the photo is unavailable. */
  contentLabelId: string;
  /** The opener's name while the photo is showing. Defaults to "Open photo
   *  from <sender>"; an album tile passes its "Photo, 2 of 5" position. */
  openLabel?: string;
  /** Opens the message's action overlay from the keyboard (the Menu key or
   *  Shift+F10) when the opener has no focusable wrapper that does it, as in
   *  an album tile. Absent leaves those keys alone. */
  onKeyboardOpenActions?: () => void;
}) {
  const { t } = useTranslation();
  const { openImage } = useChatImageViewer();
  const openerRef = useRef<HTMLSpanElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  // Keyed to the url that failed, so a new url (an optimistic `blob:` preview
  // swapped for the server copy at ack) gets its own fresh attempt.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isFailed = failedUrl === url;

  useEffect(() => {
    const opener = openerRef.current;
    if (!opener) return;
    function retryLoad() {
      setFailedUrl(null);
      setRetryCount((count) => count + 1);
    }
    opener.addEventListener(PHOTO_RETRY_EVENT, retryLoad);
    return () => opener.removeEventListener(PHOTO_RETRY_EVENT, retryLoad);
  }, []);

  // A photo already decoded from cache is `complete` the moment it mounts,
  // while its `load` event still lands a task later. Marking it loaded here,
  // during commit, keeps the wash from flashing for a single frame.
  const handleImageNode = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setHasLoaded(true);
  }, []);

  const frameStyle = {
    aspectRatio: String(aspectRatio),
    "--photo-natural-width": width > 0 ? `${width}px` : undefined,
  } as CSSProperties;

  return (
    <span
      ref={openerRef}
      className={styles.photoOpener}
      role="button"
      tabIndex={0}
      // How the pointer path finds this exact node to animate the viewer out
      // of (see `MessageBubble`). A marker rather than a `querySelector("img")`
      // hop: a bubble can carry other images (a reply preview, a link unfurl
      // card), and picking the wrong one would fly the photo to the wrong box
      // with no type error and nothing failing.
      data-photo-opener=""
      data-photo-state={isFailed ? "failed" : undefined}
      // While failed, the visible fallback text is the name ("Photo
      // unavailable, Try again"), since activating it no longer opens.
      aria-label={
        isFailed
          ? undefined
          : (openLabel ?? t("messages:viewer.open", { sender: senderName }))
      }
      aria-keyshortcuts={
        onKeyboardOpenActions ? "Shift+F10 ContextMenu" : undefined
      }
      onKeyDown={(event) => {
        const isActionsKey =
          event.key === "ContextMenu" ||
          (event.key === "F10" && event.shiftKey);
        if (onKeyboardOpenActions && isActionsKey) {
          event.preventDefault();
          event.stopPropagation();
          // A held key auto-repeats; open once per press.
          if (!event.repeat) onKeyboardOpenActions();
          return;
        }
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        if (retryIfPhotoFailed(event.currentTarget)) return;
        openImage(message, event.currentTarget);
      }}
    >
      <span
        className={[
          styles.photoFrame,
          !hasLoaded && !isFailed && styles.photoFrameLoading,
        ]
          .filter(Boolean)
          .join(" ")}
        style={frameStyle}
      >
        {isFailed ? (
          // Same stand-in styling as the restored-outbox "unavailable" state
          // (`AttachmentPreviewUnavailable`), stretched to fill this frame.
          <span
            className={[styles.imagePreviewUnavailable, styles.photoFallback]
              .filter(Boolean)
              .join(" ")}
          >
            <FiImage aria-hidden size={20} />
            <span id={contentLabelId}>
              {t("messages:attachments.photoLoadFailed")}
            </span>
            <span className={styles.photoFallbackRetry}>
              {t("messages:attachments.photoRetry")}
            </span>
          </span>
        ) : (
          <img
            // Bumped by a retry so React mounts a fresh element, which is what
            // makes the browser request the image again.
            key={retryCount}
            ref={handleImageNode}
            id={contentLabelId}
            className={styles.photoFrameImage}
            src={url}
            width={width || undefined}
            height={height || undefined}
            loading="lazy"
            alt={imageAlt}
            onLoad={() => setHasLoaded(true)}
            onError={() => setFailedUrl(url)}
          />
        )}
      </span>
    </span>
  );
}
