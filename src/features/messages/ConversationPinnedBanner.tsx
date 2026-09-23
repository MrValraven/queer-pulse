// src/features/messages/ConversationPinnedBanner.tsx
import { useState, type ReactNode } from "react";
import { FiFile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageResponse } from "../../shared/contracts/contracts";
import { PinIcon } from "./messageIcons";
import styles from "./MessagesPage.module.css";
import bannerStyles from "./ConversationPinnedBanner.module.css";

/** The SAME pin glyph as the in-bubble pinned mark (`messageIcons.ts`) so the
 *  two sites cannot drift apart. Decorative; the banner carries its own
 *  accessible name. */
function PinGlyph() {
  return <PinIcon size={14} aria-hidden="true" />;
}

/** The banner's snippet for a pinned `image`/`gif`/`document`/`sticker`
 *  message (DES-224): read from `kind`/`attachment` rather than the server's
 *  raw fallback `body` text, so a pinned photo shows a real thumbnail and a
 *  localized "Photo"/"Foto" label instead of whatever fallback text the
 *  sender's client happened to write. `null` for a text or system message,
 *  which keep rendering the body unchanged. Reuses the SAME kind labels the
 *  attach flow already uses (`attachments.fallbackText`, `viewer.gifBadge`,
 *  `sticker.attachmentLabel`) so the wording can't drift between the
 *  composer and this banner. A sticker's `body` is blanked server-side by
 *  design, so without this branch a pinned sticker rendered a blank snippet
 *  and a blank aria-label. */
function pinnedMediaDescriptor(
  message: MessageResponse,
  t: TFunction,
): { label: string; thumbnail: ReactNode } | null {
  if (message.kind === "image" || message.kind === "gif") {
    const attachment = message.attachment;
    if (!attachment || !("previewUrl" in attachment)) return null;
    return {
      label:
        message.kind === "gif"
          ? t("messages:viewer.gifBadge")
          : t("messages:attachments.fallbackText"),
      thumbnail: (
        <img
          className={bannerStyles.pinnedMediaThumb}
          src={attachment.previewUrl}
          alt=""
        />
      ),
    };
  }
  if (message.kind === "sticker") {
    const attachment = message.attachment;
    if (!attachment || !("previewUrl" in attachment)) return null;
    return {
      label: t("messages:sticker.attachmentLabel"),
      thumbnail: (
        <img
          className={bannerStyles.pinnedMediaThumb}
          src={attachment.previewUrl}
          alt=""
        />
      ),
    };
  }
  if (message.kind === "document") {
    const attachment = message.attachment;
    if (!attachment || !("fileName" in attachment)) return null;
    return {
      label: attachment.fileName,
      thumbnail: (
        <span className={bannerStyles.pinnedDocumentIcon} aria-hidden="true">
          <FiFile size={12} />
        </span>
      ),
    };
  }
  return null;
}

export interface ConversationPinnedBannerProps {
  /** The conversation's SHARED pinned messages, newest-pin-first. */
  pinned: MessageResponse[];
  /** Scrolls to + highlights the given message (reuses the ONE jump mechanism). */
  onJump: (messageId: string) => void;
}

/**
 * Compact banner at the top of the thread showing the conversation's pinned
 * messages (SHARED — both participants see it). Tapping jumps to the pinned
 * message via the existing highlight mechanism; with several pins it advances
 * WhatsApp-style through them on each tap. Renders nothing when there are none.
 */
export function ConversationPinnedBanner({
  pinned,
  onJump,
}: ConversationPinnedBannerProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  if (pinned.length === 0) return null;
  // Clamp against a shrinking list (a pin was removed live).
  const safeIndex = index % pinned.length;
  const current = pinned[safeIndex]!;
  const label =
    pinned.length > 1
      ? t("messages:pinned.bannerCounted", {
          index: safeIndex + 1,
          total: pinned.length,
        })
      : t("messages:pinned.bannerLabel");
  const media = pinnedMediaDescriptor(current, t);
  // Never the raw media fallback body (DES-224): the aria-label announces
  // exactly what the visible snippet says.
  const snippetText = media ? media.label : current.body;

  return (
    <button
      type="button"
      className={styles.pinnedBanner}
      onClick={() => {
        onJump(current.id);
        if (pinned.length > 1) setIndex((value) => (value + 1) % pinned.length);
      }}
      aria-label={t("messages:pinned.jumpAria", {
        snippet: snippetText.slice(0, 80),
      })}
    >
      <span className={styles.pinnedBannerIcon} aria-hidden="true">
        <PinGlyph />
      </span>
      <span className={styles.pinnedBannerText}>
        <span className={styles.pinnedBannerLabel}>{label}</span>
        {media ? (
          <span className={bannerStyles.pinnedBannerMediaRow}>
            {media.thumbnail}
            <span className={styles.pinnedBannerSnippet}>{media.label}</span>
          </span>
        ) : (
          <span className={styles.pinnedBannerSnippet}>{current.body}</span>
        )}
      </span>
    </button>
  );
}
