// src/features/messages/ConversationPinnedBanner.tsx
import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageResponse } from "../../shared/contracts/contracts";
import styles from "./MessagesPage.module.css";

/** A small pin glyph — decorative; the banner carries its own accessible name. */
function PinGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.5 2.5 17.5 7.5M11 4 4 11l1 4 4 1 7-7M8 12l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

  return (
    <button
      type="button"
      className={styles.pinnedBanner}
      onClick={() => {
        onJump(current.id);
        if (pinned.length > 1) setIndex((value) => (value + 1) % pinned.length);
      }}
      aria-label={t("messages:pinned.jumpAria", { snippet: current.body.slice(0, 80) })}
    >
      <span className={styles.pinnedBannerIcon} aria-hidden="true">
        <PinGlyph />
      </span>
      <span className={styles.pinnedBannerText}>
        <span className={styles.pinnedBannerLabel}>{label}</span>
        <span className={styles.pinnedBannerSnippet}>{current.body}</span>
      </span>
    </button>
  );
}
