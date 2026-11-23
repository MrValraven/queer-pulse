import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiGift } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Tooltip } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityFlairDTO } from "./api/communityBadges.api";
import { CommunityFlairChip } from "./CommunityFlairChip";
import { CommunityMemberGiftsDialog } from "./CommunityMemberGiftsDialog";
import { useCommunityMemberDecor } from "./useCommunityMemberDecor";
import styles from "./CommunityMemberGifts.module.css";

export interface NameLineMember {
  slug?: string;
  name: string;
  flair?: CommunityFlairDTO | null;
  hasRecentGift?: boolean;
}

export interface CommunityMemberFlairProps {
  communitySlug: string | undefined;
  member: NameLineMember;
}

/** The nearest control a name line sits in (a card link, a row button). */
const FOCUSABLE_ANCESTOR = "a[href], button, [tabindex]";

const stopClick = (event: MouseEvent) => event.stopPropagation();

/**
 * What follows a member's name and role pill inside a community: the worn
 * badge as a chip, then a small gift mark while a recent gift shows. The mark
 * is a button that opens the member's gifts. Renders nothing for a member who
 * wears no badge and got no gift. Demo reads the badges store by member slug,
 * live reads the fields the roster, post and reply data carry
 * (`useCommunityMemberDecor`). The chip and the mark fade in and out when the
 * data changes under a mounted line.
 */
export function CommunityMemberFlair({
  communitySlug,
  member,
}: CommunityMemberFlairProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const decor = useCommunityMemberDecor(communitySlug, member);
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const lineRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLButtonElement>(null);
  const hasGiftMark = decor.hasRecentGift && Boolean(member.slug);
  // The mark is the dialog's opener, so it stays while the dialog is open,
  // even after the last gift was removed.
  const isMarkShown = hasGiftMark || isGiftsOpen;
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0 : 0.18 },
  };
  const latestRef = useRef({ isMarkShown, hasFlair: Boolean(decor.flair) });
  const fallbackAncestorRef = useRef<HTMLElement | null>(null);
  const didDialogCloseRef = useRef(false);

  useEffect(() => {
    latestRef.current = { isMarkShown, hasFlair: Boolean(decor.flair) };
    // Remember the control the name line sits in while the line is mounted,
    // so a fallback still has a target once the line has faded out.
    const line = lineRef.current;
    if (line) {
      fallbackAncestorRef.current =
        line.parentElement?.closest<HTMLElement>(FOCUSABLE_ANCESTOR) ?? null;
    }
  });

  // Focus never lands on the page body when the mark that held it goes away:
  // it moves to the name line if the badge chip keeps it there, else to the
  // control the name line sits in.
  const moveFocusToFallback = () => {
    const target = latestRef.current.hasFlair
      ? lineRef.current
      : fallbackAncestorRef.current;
    if (target?.isConnected) target.focus({ preventScroll: true });
  };

  // The mark is going away while it holds focus (the dialog just closed and
  // handed focus back to it, or the last gift expired under the keyboard).
  useEffect(() => {
    if (isMarkShown) didDialogCloseRef.current = false;
    else if (document.activeElement === markRef.current) moveFocusToFallback();
  }, [isMarkShown]);

  // After a removal the row that held focus folds away, so focus is already on
  // the body when the dialog closes. Once the mark has faded out, a closed
  // dialog moves focus to the fallback, but only from the body or the mark, so
  // focus the member put somewhere else is never taken.
  const handleMarkGone = () => {
    if (latestRef.current.isMarkShown || !didDialogCloseRef.current) return;
    didDialogCloseRef.current = false;
    const active = document.activeElement;
    if (active === document.body || active === markRef.current)
      moveFocusToFallback();
  };

  const openGifts = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    didDialogCloseRef.current = false;
    setIsGiftsOpen(true);
  };

  const closeGifts = () => {
    // Only a mark that is about to fade out (the last gift was removed) needs
    // the focus fallback; a mark that stays keeps its focus handback as is.
    didDialogCloseRef.current = !hasGiftMark;
    setIsGiftsOpen(false);
  };

  return (
    <>
      {/* The chip is not a control: a click on it bubbles to a clickable
          card around the name line, as a click on the name beside it does. */}
      <AnimatePresence initial={false} onExitComplete={handleMarkGone}>
        {(decor.flair || isMarkShown) && (
          <m.span
            key="line"
            ref={lineRef}
            className={styles.nameLine}
            tabIndex={-1}
            {...fade}
          >
            <AnimatePresence initial={false} onExitComplete={handleMarkGone}>
              {decor.flair && (
                <m.span
                  key="chip"
                  className={`${styles.slot} ${styles.chipSlot}`}
                  {...fade}
                >
                  <CommunityFlairChip flair={decor.flair} size="sm" />
                </m.span>
              )}
              {isMarkShown && (
                <m.span
                  key="mark"
                  className={`${styles.slot} ${styles.markSlot}`}
                  {...fade}
                >
                  {/* Portalled: the name line clips its own box (see
                      .nameLine), which would cut an anchored bubble. */}
                  <Tooltip
                    label={t("communities:badges.giftMark.tooltip")}
                    placement="floating-top"
                  >
                    <button
                      ref={markRef}
                      type="button"
                      className={styles.giftMark}
                      data-tap-target
                      aria-label={t("communities:badges.giftMark.aria", {
                        name: member.name,
                      })}
                      onClick={openGifts}
                    >
                      <FiGift aria-hidden />
                    </button>
                  </Tooltip>
                </m.span>
              )}
            </AnimatePresence>
          </m.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isGiftsOpen && communitySlug && member.slug && (
          // Not an interactive control: this only stops a click inside the
          // portalled dialog from bubbling (React bubbles through portals) to
          // a clickable card around the name line. The dialog's own controls
          // are the real buttons, so there is no keyboard or role gap.
          <span key="gifts" role="presentation" onClick={stopClick}>
            <CommunityMemberGiftsDialog
              communitySlug={communitySlug}
              memberSlug={member.slug}
              memberName={member.name}
              onClose={closeGifts}
            />
          </span>
        )}
      </AnimatePresence>
    </>
  );
}
