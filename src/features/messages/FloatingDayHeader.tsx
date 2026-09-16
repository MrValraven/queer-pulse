// src/features/messages/FloatingDayHeader.tsx
import { memo, useRef, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { dayHeading } from "./dayHeading";
import { useFloatingDayHeader } from "./useFloatingDayHeader";
import type { MessageRow } from "./messageRows";
import styles from "./MessagesPage.module.css";

export interface FloatingDayHeaderProps {
  areaRef: RefObject<HTMLDivElement | null>;
  /** The open thread: a switch hides a pill still showing from the last one. */
  conversationId: string;
  rows: MessageRow[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

/**
 * The date pill that stays pinned over the top of the log while a member
 * scrolls, showing the day of the topmost visible message, the way WhatsApp
 * and Telegram keep "Yesterday" on screen.
 *
 * `position: sticky` on a day separator row cannot work because rows are
 * absolutely positioned by the virtualizer, so this is a separate zero-height
 * sticky host rendered as the virtualized sizer's first child: it pins to the
 * top of `.area` without occupying any height (nothing shifts, and the sizer's
 * explicit height is unaffected), takes no pointer events, and opts out of
 * scroll anchoring. It repeats the in-flow separator's text, so it is hidden
 * from assistive technology; the separators themselves stay the accessible
 * record of each day.
 */
function FloatingDayHeaderImpl({
  areaRef,
  conversationId,
  rows,
  rowVirtualizer,
}: FloatingDayHeaderProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { day, isVisible } = useFloatingDayHeader(
    areaRef,
    hostRef,
    labelRef,
    conversationId,
    rows,
    rowVirtualizer,
  );
  return (
    <div
      ref={hostRef}
      className={
        isVisible
          ? `${styles.floatingDayHeader} ${styles.floatingDayHeaderVisible}`
          : styles.floatingDayHeader
      }
      aria-hidden="true"
    >
      {/* Always mounted, so the hook can measure the label's real band even
          before the first day resolves; it stays transparent until visible. */}
      <span ref={labelRef} className={styles.floatingDayHeaderLabel}>
        {day !== undefined ? dayHeading(day, t) : null}
      </span>
    </div>
  );
}

export const FloatingDayHeader = memo(FloatingDayHeaderImpl);
