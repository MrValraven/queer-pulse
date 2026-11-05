import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../../shared/hooks";
import { useLightboxDialog } from "../useLightboxDialog";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import type { SkinFamily } from "../subprofile-skins";
import { PoemReaderContent } from "./PoemReaderContent";
import { PoemReaderPager } from "./PoemReaderPager";
import { PoemReaderTopBar } from "./PoemReaderTopBar";
import { useIsScrolledOutOfView } from "./useIsScrolledOutOfView";
import { usePoemReaderSwipe } from "./usePoemReaderSwipe";
import styles from "./PoemReaderModal.module.css";

export interface PoemReaderModalProps {
  item: SubprofileItemView;
  /** The persona's display name, the byline under the title. */
  authorName: string;
  /** The persona's skin family. The page skin dresses the reader in its own
   *  ground and ink so opening a poem keeps the page's colours; every other
   *  skin reads on the app's cream and ink. */
  skin: SkinFamily;
  /** Every poem in page order, and where `item` sits in it (-1 when it is
   *  not in the list, which hides Previous/Next). */
  poems: SubprofileItemView[];
  poemIndex: number;
  /** Swap the reader to `poems[index]`. */
  onGoTo: (index: number) => void;
  /** Absolute, deep-linkable URL for this exact poem (persona share URL +
   *  `?poem=<slug>`), copied by the "Copy link" affordance. `null` when the
   *  persona has no public address yet, which drops the affordance rather
   *  than copying a link that resolves nowhere. */
  shareUrl: string | null;
  onClose: () => void;
}

/**
 * The poem reader: a centred panel on wider screens and a full-screen sheet
 * on phones. Portaled `role="dialog"` with the shared focus-trap and keyboard
 * behaviour (`useLightboxDialog`): Escape closes, the arrow keys move to the
 * previous or next poem, and so does a sideways swipe on the poem. Moving
 * scrolls back to the top and fades the new poem in; `prefers-reduced-motion`
 * drops every transition in the CSS modules.
 */
export function PoemReaderModal({
  item,
  authorName,
  skin,
  poems,
  poemIndex,
  onGoTo,
  shareUrl,
  onClose,
}: PoemReaderModalProps) {
  useScrollLock();
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const move = useCallback(
    (delta: number) => {
      if (poemIndex < 0) return;
      const targetIndex = poemIndex + delta;
      if (targetIndex >= 0 && targetIndex < poems.length) onGoTo(targetIndex);
    },
    [poemIndex, poems.length, onGoTo],
  );
  useLightboxDialog(dialogRef, { onClose, onMove: move });
  usePoemReaderSwipe(scrollerRef, move);
  const isTitleScrolledAway = useIsScrolledOutOfView(
    titleRef,
    scrollerRef,
    item.id,
  );

  // A new poem starts at its title, before the browser paints it.
  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  // Moving can unmount the focused control (a version tab of the old poem,
  // or Next on reaching the last poem). Hand focus back to the dialog so the
  // focus trap keeps holding it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  }, [item.id]);

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        data-persona-skin={skin}
      >
        <PoemReaderTopBar
          title={item.title}
          isTitleShown={isTitleScrolledAway}
          onClose={onClose}
        />
        <div ref={scrollerRef} className={styles.scroller}>
          <div key={item.id} className={styles.poemFade}>
            <PoemReaderContent
              item={item}
              authorName={authorName}
              shareUrl={shareUrl}
              titleRef={titleRef}
            />
          </div>
          <PoemReaderPager
            poems={poems}
            poemIndex={poemIndex}
            onGoTo={onGoTo}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
