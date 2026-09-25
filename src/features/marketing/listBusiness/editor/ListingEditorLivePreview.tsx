import { useEffect, useId, useRef, type RefObject } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ListingDraft, PhotoKey } from "../listBusiness.data";
import { ListingLivePreviewBody } from "../preview/ListingLivePreviewBody";
import {
  highlightedRegionsFor,
  placementForAnchor,
} from "../preview/listingPreviewRegions.data";
import { useFocusedListingField } from "../preview/useFocusedListingField";
import { jumpToEditorSection } from "./jumpToEditorSection";
import { LISTING_EDITOR_SECTION_BY_KEY } from "./listingEditor.data";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./ListingEditor.module.css";

/** Space kept between a revealed region and the column's visible edges. */
const REVEAL_MARGIN_PX = 16;

/** How far to scroll so the span `top..bottom` sits inside the visible
 *  window, moving as little as possible. A span taller than the window
 *  aligns to its top. */
function offsetToReveal(
  top: number,
  bottom: number,
  visibleTop: number,
  visibleBottom: number,
): number {
  if (top < visibleTop) return top - visibleTop;
  if (bottom > visibleBottom) {
    return Math.min(bottom - visibleBottom, top - visibleTop);
  }
  return 0;
}

/**
 * Scrolls `aside` (and only it) so every outlined region shows below the
 * sticky caption bar. One field can outline a card spot and an excerpt block
 * far below it (hours, owner name, visibility): when they do not fit
 * together, the last one wins, since the card spot near the top is the one
 * usually in view already. `scrollIntoView` would also scroll the page and
 * pull the field being typed in out of view.
 */
function revealRegionsIn(
  aside: HTMLElement,
  regions: readonly string[],
  prefersReducedMotion: boolean,
) {
  if (aside.clientHeight === 0 || regions.length === 0) return;
  const targets = Array.from(
    aside.querySelectorAll<HTMLElement>("[data-preview-region]"),
  ).filter((element) => regions.includes(element.dataset.previewRegion ?? ""));
  const lastTarget = targets[targets.length - 1];
  if (!lastTarget) return;

  const boxes = targets.map((target) => target.getBoundingClientRect());
  const unionTop = Math.min(...boxes.map((box) => box.top));
  const unionBottom = Math.max(...boxes.map((box) => box.bottom));
  // Pinned to the column's top edge once scrolled, so it covers that much.
  const stickyBarHeight =
    aside
      .querySelector("[data-preview-caption-bar][data-sticky]")
      ?.getBoundingClientRect().height ?? 0;
  const scrollportTop = aside.getBoundingClientRect().top + aside.clientTop;
  const visibleTop = scrollportTop + stickyBarHeight + REVEAL_MARGIN_PX;
  const visibleBottom = scrollportTop + aside.clientHeight - REVEAL_MARGIN_PX;

  const doAllFit = unionBottom - unionTop <= visibleBottom - visibleTop;
  const shownBox = doAllFit
    ? { top: unionTop, bottom: unionBottom }
    : lastTarget.getBoundingClientRect();
  const offset = offsetToReveal(
    shownBox.top,
    shownBox.bottom,
    visibleTop,
    visibleBottom,
  );
  if (offset === 0) return;
  aside.scrollTo({
    top: aside.scrollTop + offset,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

/**
 * The editor's third column: the real directory card and the "on your page"
 * excerpt, redrawn as the owner types, with the spot the focused field fills
 * outlined. The body is the same component the create wizard shows, so the
 * two previews cannot drift apart.
 *
 * Shown only when the editor has room for three columns (a container query in
 * ListingEditor.module.css). Below that, the save bar's "Preview page" modal
 * is the way in, and this column's button opens that same modal.
 */
export function ListingEditorLivePreview({
  draft,
  photoPreviews,
  fieldsRef,
  prefersReducedMotion,
  onOpenFullPreview,
}: {
  draft: ListingDraft;
  photoPreviews: Record<PhotoKey, string>;
  /** The fields column. The focus hook lives here, so focusing or hovering a
   *  field re-renders only this column. */
  fieldsRef: RefObject<HTMLElement | null>;
  prefersReducedMotion: boolean;
  /** Opens the editor's existing full-page preview modal. */
  onOpenFullPreview: () => void;
}) {
  const { t } = useTranslation();
  // The head line doubles as the column's heading, so the aside is reachable
  // from a screen reader's heading list and named by the same words.
  const headingId = useId();
  const { activeAnchor, focusedAnchor } = useFocusedListingField(fieldsRef);
  const asideRef = useRef<HTMLElement>(null);
  // The regions the focused field outlines, the same way the body works them
  // out (focus wins over hover there, so they match what is outlined). Joined
  // so the effect re-runs only when they change: a region that appears while
  // typing (hours filled in) still comes into view, and a keystroke that
  // changes nothing costs no scroll.
  const focusedRegionsKey = highlightedRegionsFor(
    placementForAnchor(focusedAnchor, draft),
    draft,
  ).join(" ");

  // Only focus scrolls: sweeping the mouse down the form would otherwise make
  // the column jump under it. Keyed on the focus-only anchor, so clicking the
  // field the mouse is already over still scrolls.
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside || focusedAnchor === null || focusedRegionsKey === "") return;
    revealRegionsIn(aside, focusedRegionsKey.split(" "), prefersReducedMotion);
  }, [focusedAnchor, focusedRegionsKey, prefersReducedMotion]);

  return (
    <aside
      ref={asideRef}
      className={styles.livePreview}
      aria-labelledby={headingId}
    >
      <ListingLivePreviewBody
        draft={draft}
        photoPreviews={photoPreviews}
        activeAnchor={activeAnchor}
        header={
          <h2
            id={headingId}
            className={`${pageStyles.pvHead} ${styles.livePreviewHead}`}
          >
            <span className={pageStyles.dot} />
            {t("marketing:listBusiness.preview.head")}
          </h2>
        }
        isHeaderSticky
        onAddPhoto={() =>
          jumpToEditorSection(
            LISTING_EDITOR_SECTION_BY_KEY.photos.id,
            prefersReducedMotion,
          )
        }
      />

      <div className={pageStyles.previewFullBtn}>
        <Button variant="ghost" onClick={onOpenFullPreview}>
          {t("marketing:listBusiness.preview.fullCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    </aside>
  );
}
