import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SpotlightView } from "./spotlightView";
import { SpotlightFace } from "./SpotlightFace";
import styles from "./Discovery.module.css";

const ROTATE_MS = 5500;

/** Imperative handle so an outside control (the roster rows) can drive which
 *  member is featured, the same way the built-in dots do. */
export interface FeaturedSpotlightCardHandle {
  goTo: (index: number) => void;
}

interface FeaturedSpotlightCardProps {
  items: SpotlightView[];
  /** Fires whenever the featured slide changes (swipe, dot, auto-rotate, or
   *  `goTo`), so a parent can highlight the matching roster row. */
  onActiveChange?: (index: number) => void;
}

export const FeaturedSpotlightCard = forwardRef<
  FeaturedSpotlightCardHandle,
  FeaturedSpotlightCardProps
>(function FeaturedSpotlightCard({ items, onActiveChange }, ref) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Distinguishes our own scrollTo/scrollBy from a genuine finger scroll, so the
  // former neither pauses auto-rotate nor is mistaken for the user browsing.
  const programmaticRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Sticky, unlike `paused` (which hover toggles): once a visitor picks a member
  // from the roster, auto-rotate stays off so the card holds their choice.
  const [stopped, setStopped] = useState(false);

  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const looping = items.length > 1 && !!firstItem && !!lastItem;
  // Clone the last slide before the first and the first after the last. A swipe
  // (or auto-advance) past either end lands on an identical-looking clone, then
  // we teleport back to the real slide once the scroll settles — a seamless
  // infinite loop that native scroll-snap can't do on its own.
  const slides =
    looping && firstItem && lastItem ? [lastItem, ...items, firstItem] : items;
  const firstRealOffset = looping ? 1 : 0;

  // Preload every featured portrait so a slide never loads (and flickers) as it
  // scrolls into view.
  useEffect(() => {
    for (const item of items) {
      if (!item.photoUrl) continue;
      const image = new Image();
      image.src = item.photoUrl;
    }
  }, [items]);

  // Start parked on the first real slide (past the leading clone).
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || !looping) return;
    programmaticRef.current = true;
    element.scrollTo({ left: element.clientWidth, behavior: "auto" });
  }, [looping]);

  const scrollToIndex = useCallback(
    (index: number, smooth: boolean) => {
      const element = scrollRef.current;
      if (!element) return;
      programmaticRef.current = true;
      element.scrollTo({
        left: (index + firstRealOffset) * element.clientWidth,
        behavior: smooth && !reducedMotion ? "smooth" : "auto",
      });
    },
    [firstRealOffset, reducedMotion],
  );

  // Let outside controls (the roster rows) feature a member by index, matching
  // the dots' smooth scroll — the resulting scroll settles into `active`, so the
  // highlight stays driven by one source of truth.
  useImperativeHandle(
    ref,
    () => ({
      goTo: (index: number) => {
        setStopped(true);
        scrollToIndex(index, true);
      },
    }),
    [scrollToIndex],
  );

  // Report the featured slide up so a parent roster can mirror the highlight.
  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  // Auto-rotate always steps forward by one slide; the clone + teleport below
  // turns the last→first wrap into a short seamless scroll instead of a rewind.
  const advance = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    programmaticRef.current = true;
    element.scrollBy({
      left: element.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);

  // A genuine finger scroll stops the auto-rotate; once any scroll settles,
  // sync the active dot and teleport off either clone for the infinite loop.
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (!programmaticRef.current) setPaused(true);
    if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const width = element.clientWidth || 1;
      const slot = Math.round(element.scrollLeft / width);
      // On a clone, teleport to the matching real slide. Keep `programmatic`
      // set through the teleport so its own scroll event isn't mistaken for the
      // user browsing (which would pause auto-rotate); the teleport's settle,
      // landing on a real slot, is what finally clears the flag.
      if (looping && slot === 0) {
        setActive(items.length - 1);
        programmaticRef.current = true;
        element.scrollTo({ left: items.length * width, behavior: "auto" });
        return;
      }
      if (looping && slot === items.length + 1) {
        setActive(0);
        programmaticRef.current = true;
        element.scrollTo({ left: width, behavior: "auto" });
        return;
      }
      setActive(slot - firstRealOffset);
      programmaticRef.current = false;
    }, 120);
  }, [looping, items.length, firstRealOffset]);

  // Keep the active slide aligned across a resize / orientation change.
  useEffect(() => {
    const onResize = () => scrollToIndex(active, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, scrollToIndex]);

  useEffect(() => {
    if (reducedMotion || paused || stopped || items.length <= 1) return;
    const id = setTimeout(advance, ROTATE_MS);
    return () => clearTimeout(id);
  }, [active, paused, stopped, reducedMotion, items.length, advance]);

  if (items.length === 0) return null;

  return (
    <article
      className={styles.feat}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Native horizontal scroll-snap: the finger-follow + snap runs on the
          browser's compositor. Every member is a real, in-flow, equal-height
          slide, so nothing is recreated or resized mid-swipe. */}
      <div className={styles.spot} ref={scrollRef} onScroll={handleScroll}>
        {slides.map((slide, slideIndex) => {
          const isClone =
            looping && (slideIndex === 0 || slideIndex === slides.length - 1);
          const isActive = !isClone && slideIndex - firstRealOffset === active;
          return (
            <div
              className={styles.slide}
              key={slideIndex}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <SpotlightFace view={slide} />
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div
          className={styles.dots}
          aria-label={t("homepage:discovery.featuredMembersAria")}
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={[styles.navDot, index === active && styles.navDotOn]
                .filter(Boolean)
                .join(" ")}
              aria-label={t("homepage:discovery.featureMemberAria", {
                name: item.name,
              })}
              aria-current={index === active}
              onClick={() => scrollToIndex(index, true)}
            />
          ))}
        </div>
      )}
    </article>
  );
});
