import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryEnquiryModal } from "./DirectoryEnquiryModal";
import {
  DirectoryVisitCardContext,
  type DirectoryVisitCardState,
} from "./directoryVisitCardContext";

interface Props {
  place: DirectoryPlace;
  children: ReactNode;
}

/**
 * Holds the visit card's state above the two columns it can sit in, and
 * renders the enquiry composer from here (see `directoryVisitCardContext`).
 *
 * The composer is a portalled modal, so rendering it at this level changes
 * nothing about where it appears; it only means the draft the member is typing
 * stays mounted while the card underneath it moves to the other column.
 *
 * Focus return: the modal hands focus back to the element that opened it. When
 * the card moved while the modal was open, that element is gone, focus falls
 * to the document body, and the trigger in the card that replaced it takes it
 * instead.
 */
export function DirectoryVisitCardProvider({ place, children }: Props) {
  const [composerFollowUpAwaitsReply, setComposerFollowUpAwaitsReply] =
    useState<boolean | null>(null);
  const [capReason, setCapReason] = useState<string | null>(null);
  const enquiryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const carriedFocusRef = useRef<number | null>(null);
  const isComposerOpen = composerFollowUpAwaitsReply !== null;
  const isComposerPreviouslyOpenRef = useRef(false);

  // Runs after the modal's own unmount cleanup, which has already tried the
  // original opener; only a focus that landed on the body is picked up here.
  useEffect(() => {
    const hasJustClosed =
      isComposerPreviouslyOpenRef.current && !isComposerOpen;
    isComposerPreviouslyOpenRef.current = isComposerOpen;
    if (!hasJustClosed) return;
    const activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      enquiryTriggerRef.current?.focus();
    }
  }, [isComposerOpen]);

  const openComposer = useCallback((followUpAwaitsReply: boolean) => {
    setComposerFollowUpAwaitsReply(followUpAwaitsReply);
  }, []);

  const state = useMemo<DirectoryVisitCardState>(
    () => ({ capReason, openComposer, enquiryTriggerRef, carriedFocusRef }),
    [capReason, openComposer],
  );

  return (
    <DirectoryVisitCardContext.Provider value={state}>
      {children}
      {composerFollowUpAwaitsReply !== null && (
        <DirectoryEnquiryModal
          slug={place.slug}
          placeName={place.name}
          followUpAwaitsReply={composerFollowUpAwaitsReply}
          onClose={() => setComposerFollowUpAwaitsReply(null)}
          onCapReached={setCapReason}
        />
      )}
    </DirectoryVisitCardContext.Provider>
  );
}
