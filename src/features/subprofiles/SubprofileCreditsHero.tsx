import { useCallback, useEffect, useRef } from "react";
import { FiArrowDown } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileCreditsHeroSearch } from "./SubprofileCreditsHeroSearch";
import { SubprofileCreditsQuickChips } from "./SubprofileCreditsQuickChips";
import { SubprofileCreditsWall } from "./SubprofileCreditsWall";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileCreditsHero.module.css";

/** The directory section the search lands on. The page renders it with this
 *  id and a visually hidden h2 that takes focus (`tabIndex={-1}`). */
const DIRECTORY_SECTION_ID = "subprofile-directory";

/**
 * Takes the member from the hero down to the results: scrolls the directory
 * section into view (smooth, or instant under reduced motion) and moves focus
 * to its heading, so a keyboard or screen reader lands there too. Runs in the
 * next animation frame, after a preceding `onRefine` has let the page switch
 * tabs and render the results panel. Shared by the search submit and the
 * hero's "show results" button.
 */
function useScrollToDirectory() {
  const shouldReduceMotion = usePrefersReducedMotion();
  return useCallback(() => {
    requestAnimationFrame(() => {
      const section = document.getElementById(DIRECTORY_SECTION_ID);
      if (!section) return;
      section.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
      // preventScroll keeps the focus move from cutting the smooth scroll
      // short.
      section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    });
  }, [shouldReduceMotion]);
}

/** How long the results button's `Collapse` takes to open (its 0.28s default
 *  plus a frame of slack), so its final position is measured once it settles. */
const RESULTS_CTA_SETTLE_MS = 320;

/** The breathing room kept under the results button: it must end this far
 *  above the viewport bottom. Matches `scroll-margin-bottom` on `.resultsCta`. */
const RESULTS_CTA_BOTTOM_GAP_PX = 16;

/**
 * After a quick chip press opens the "Show N personas" button, brings it into
 * view when it landed below the fold (a laptop viewport, or a second chip row
 * in Portuguese). Typing in the search never scrolls: only a change of the
 * chips' own state (availability or kinds) arms it. Focus stays where it is.
 */
function useRevealResultsCtaAfterChipPress(
  filters: SubprofileDirectoryFilters,
  isResultsCtaShown: boolean,
  isHeroRefined: boolean,
) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const resultsCtaRef = useRef<HTMLButtonElement>(null);
  const chipStateKey = `${filters.availability ?? ""}|${filters.kinds.join(",")}`;
  const previousChipStateKeyRef = useRef(chipStateKey);
  const isChipPressPendingRef = useRef(false);

  // Arms on a chip change, disarms once nothing refines the grid any more.
  useEffect(() => {
    if (previousChipStateKeyRef.current !== chipStateKey) {
      previousChipStateKeyRef.current = chipStateKey;
      isChipPressPendingRef.current = true;
    }
    if (!isHeroRefined) isChipPressPendingRef.current = false;
  }, [chipStateKey, isHeroRefined]);

  useEffect(() => {
    if (!isResultsCtaShown || !isChipPressPendingRef.current) return;
    const timeoutId = window.setTimeout(() => {
      isChipPressPendingRef.current = false;
      const button = resultsCtaRef.current;
      if (!button) return;
      const visibleBottomEdge = window.innerHeight - RESULTS_CTA_BOTTOM_GAP_PX;
      if (button.getBoundingClientRect().bottom <= visibleBottomEdge) return;
      button.scrollIntoView({
        block: "nearest",
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }, RESULTS_CTA_SETTLE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isResultsCtaShown, chipStateKey, shouldReduceMotion]);

  return resultsCtaRef;
}

export interface SubprofileCreditsHeroProps {
  /** The directory page's refine state (`useSubprofileDirectoryFilters()`),
   *  owned by the page: the search box edits its query and the quick chips
   *  its availability and kinds, so the grid below answers them. */
  filters: SubprofileDirectoryFilters;
  /** Called when the member refines from the hero (typing, submitting or a
   *  chip), so the page can leave a tab that the refinement does not reach. */
  onRefine: () => void;
}

/**
 * The plum band at the top of the personas directory, the first thing a
 * member sees: eyebrow, the Fraunces headline with its coral-soft emphasis,
 * the lead, the search and the quick filters on the left, and the wall of
 * faces on the right. Full bleed on solid --plum; the wall wraps under the
 * copy once the two no longer fit side by side, and below --lg it becomes
 * the 6-tile phone wall. While a search term or quick chip refines the grid,
 * a "Show N personas" button under the chips takes the member down to it.
 *
 * It is a `<header data-plum>` so the shell paints the floating nav's band
 * the same solid --plum above it (base.css), leaving no seam. Mount it as
 * the first child of the page's main.
 */
export function SubprofileCreditsHero({
  filters,
  onRefine,
}: SubprofileCreditsHeroProps) {
  const { t } = useTranslation();
  const scrollToDirectory = useScrollToDirectory();
  // The hero's own refinements: a search term or a quick chip. Without this
  // button the grid sits a screen or more below and a press shows nothing.
  const isHeroRefined =
    filters.query.trim() !== "" ||
    filters.availability !== null ||
    filters.kinds.length > 0;
  const isResultsCtaShown = isHeroRefined && !filters.isLoading;
  const resultsCtaRef = useRevealResultsCtaAfterChipPress(
    filters,
    isResultsCtaShown,
    isHeroRefined,
  );

  return (
    <header className={styles.hero} data-plum>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span aria-hidden className={styles.eyebrowRule} />
            {t("subprofiles:directory.hero.eyebrow")}
          </p>
          <h1 className={styles.title}>
            <Translation
              i18nKey="subprofiles:directory.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>{t("subprofiles:directory.hero.lead")}</p>
          <SubprofileCreditsHeroSearch
            query={filters.query}
            onQueryChange={filters.setQuery}
            onRefine={onRefine}
            onSubmitScroll={scrollToDirectory}
          />
          <div>
            <SubprofileCreditsQuickChips
              filters={filters}
              onRefine={onRefine}
            />
            {/* The live region stays mounted so the new count is announced as
                the button appears and as its number changes. */}
            <div aria-live="polite" aria-atomic="true">
              <Collapse isOpen={isResultsCtaShown}>
                <button
                  ref={resultsCtaRef}
                  type="button"
                  className={styles.resultsCta}
                  onClick={scrollToDirectory}
                >
                  {filters.total === 0
                    ? t("subprofiles:directory.showResultsCtaNone")
                    : t("subprofiles:directory.showResultsCta", {
                        count: filters.total,
                      })}
                  <FiArrowDown aria-hidden className={styles.resultsCtaIcon} />
                </button>
              </Collapse>
            </div>
          </div>
        </div>
        <SubprofileCreditsWall className={styles.wall} />
      </div>
    </header>
  );
}
