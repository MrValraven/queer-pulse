import { m } from "motion/react";
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  type ReactNode,
  type RefObject,
} from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { STUDIO_FADE, studioStaggerDelay } from "../studioMotion";
import styles from "./StudioShelf.module.css";

export type StudioShelfLayout = "row" | "grid";

export interface StudioShelfProps {
  /** The heading's id; the section is labelled by it. */
  id: string;
  title: ReactNode;
  eyebrow?: ReactNode;
  seeAllHref?: string;
  /** Defaults to "See all". */
  seeAllLabel?: string;
  /** The See all link replaces the history entry (a Show less that folds
   *  the shelf back), so Back leaves the page as expected. */
  seeAllReplace?: boolean;
  /** `row` (default) scrolls sideways with snap; `grid` wraps. */
  layout?: StudioShelfLayout;
  /** One element per item (usually a StudioMediaCard), each with a key. */
  children: ReactNode;
}

const REDUCED_FADE = { duration: 0.12 } as const;

interface StudioShelfEdges {
  /** The first item shows whole, so nothing more lies before it. */
  isAtStart: boolean;
  /** The last item shows whole, so nothing more lies after it. */
  isAtEnd: boolean;
}

const AT_REST: StudioShelfEdges = { isAtStart: true, isAtEnd: true };

/** Share of an edge item that must show for its side to count as reached. */
const WHOLE_RATIO = 0.98;

/**
 * Which ends of a horizontal shelf still hide content, read by an
 * IntersectionObserver on the first and last item with the scroller as root.
 * No scroll listener runs, and it re-arms whenever the items change.
 */
function useStudioShelfEdges(
  listRef: RefObject<HTMLElement | null>,
  itemKeys: string,
  isEnabled: boolean,
): StudioShelfEdges {
  const [edges, setEdges] = useState<StudioShelfEdges>(AT_REST);

  useEffect(() => {
    const list = listRef.current;
    const first = list?.firstElementChild;
    const last = list?.lastElementChild;
    if (!isEnabled || !list || !first || !last) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        setEdges((previous) => {
          let next = previous;
          for (const entry of entries) {
            const isWhole = entry.intersectionRatio >= WHOLE_RATIO;
            if (entry.target === first) next = { ...next, isAtStart: isWhole };
            if (entry.target === last) next = { ...next, isAtEnd: isWhole };
          }
          return next.isAtStart === previous.isAtStart &&
            next.isAtEnd === previous.isAtEnd
            ? previous
            : next;
        });
      },
      { root: list, threshold: [0, WHOLE_RATIO, 1] },
    );
    observer.observe(first);
    if (last !== first) observer.observe(last);
    return () => observer.disconnect();
  }, [listRef, itemKeys, isEnabled]);

  return isEnabled ? edges : AT_REST;
}

/**
 * Brings a card that takes keyboard focus wholly into view, past the edge
 * fade. A native listener, since the list itself is not interactive.
 */
function useFocusedItemIntoView(
  listRef: RefObject<HTMLUListElement | null>,
  isEnabled: boolean,
  reducedMotion: boolean,
) {
  useEffect(() => {
    const list = listRef.current;
    if (!isEnabled || !list) return;
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      // Keyboard focus only: a click already lands on a visible card.
      if (!(target instanceof Element) || !target.matches(":focus-visible"))
        return;
      const item = target.closest("li");
      if (!item || item.parentElement !== list) return;
      item.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };
    list.addEventListener("focusin", handleFocusIn);
    return () => list.removeEventListener("focusin", handleFocusIn);
  }, [listRef, isEnabled, reducedMotion]);
}

/** The heading as plain text, for the scroll buttons' labels. */
function useHeadingText(
  headingRef: RefObject<HTMLHeadingElement | null>,
  title: ReactNode,
): string {
  const [measured, setMeasured] = useState("");
  useLayoutEffect(() => {
    if (typeof title === "string") return;
    const text = headingRef.current?.textContent?.trim() ?? "";
    // A rich title (an <em> inside) only has text once it is in the DOM.
    setMeasured(text);
  }, [headingRef, title]);
  return typeof title === "string" ? title : measured;
}

function ShelfScrollButtons({
  listRef,
  titleText,
  isAtStart,
  isAtEnd,
}: {
  listRef: RefObject<HTMLUListElement | null>;
  titleText: string;
  isAtStart: boolean;
  isAtEnd: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // Pages by the visible width; the snap points settle it on a card edge.
  const page = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const isRtl = getComputedStyle(list).direction === "rtl";
    list.scrollBy({
      left: direction * (isRtl ? -1 : 1) * list.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };
  return (
    <>
      <IconButton
        className={`${styles.scroll} ${styles.scrollStart}`}
        aria-label={t("studio:kit.shelf.scrollLeft", { title: titleText })}
        aria-disabled={isAtStart || undefined}
        data-hidden={isAtStart || undefined}
        onClick={() => {
          if (!isAtStart) page(-1);
        }}
      >
        <FiChevronLeft aria-hidden />
      </IconButton>
      <IconButton
        className={`${styles.scroll} ${styles.scrollEnd}`}
        aria-label={t("studio:kit.shelf.scrollRight", { title: titleText })}
        aria-disabled={isAtEnd || undefined}
        data-hidden={isAtEnd || undefined}
        onClick={() => {
          if (!isAtEnd) page(1);
        }}
      >
        <FiChevronRight aria-hidden />
      </IconButton>
    </>
  );
}

/**
 * A titled Studio shelf. `row` is one swipeable line of cards: snap
 * scrolling, an edge fade only on a side that hides more, round scroll
 * buttons on hover, and 2.3 cards on a phone so the next one peeks in.
 * `grid` wraps the same items. Either way it is a labelled list, and the
 * first eight items arrive in a short stagger.
 */
export function StudioShelf({
  id,
  title,
  eyebrow,
  seeAllHref,
  seeAllLabel,
  seeAllReplace,
  layout = "row",
  children,
}: StudioShelfProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children).filter(isValidElement);
  const isRow = layout === "row";
  const titleText = useHeadingText(headingRef, title);
  const itemKeys = items.map((item) => String(item.key)).join("|");
  const { isAtStart, isAtEnd } = useStudioShelfEdges(listRef, itemKeys, isRow);
  useFocusedItemIntoView(listRef, isRow, reducedMotion);

  return (
    <section className={styles.shelf} aria-labelledby={id}>
      <header className={styles.head}>
        <div className={styles.headText}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 id={id} ref={headingRef} className={styles.title}>
            {title}
          </h2>
        </div>
        {seeAllHref && (
          <Link
            to={seeAllHref}
            replace={seeAllReplace}
            className={styles.seeAll}
            aria-describedby={id}
          >
            {seeAllLabel ?? t("studio:kit.shelf.seeAll")}
            <FiChevronRight aria-hidden />
          </Link>
        )}
      </header>
      <div className={styles.viewport} data-layout={layout}>
        <ul
          ref={listRef}
          className={styles.list}
          aria-labelledby={id}
          data-fade-start={(isRow && !isAtStart) || undefined}
          data-fade-end={(isRow && !isAtEnd) || undefined}
        >
          {items.map((item, index) => (
            <m.li
              key={item.key ?? index}
              className={styles.item}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...(reducedMotion ? REDUCED_FADE : STUDIO_FADE),
                delay: reducedMotion ? 0 : studioStaggerDelay(index),
              }}
            >
              {item}
            </m.li>
          ))}
        </ul>
        {isRow && (
          <ShelfScrollButtons
            listRef={listRef}
            titleText={titleText}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
          />
        )}
      </div>
    </section>
  );
}
