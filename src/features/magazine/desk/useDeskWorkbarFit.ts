import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export interface DeskWorkbarFitRefs {
  /** The workbar's one row: search, then the controls strip. */
  rowRef: RefObject<HTMLDivElement | null>;
  /** The controls strip beside search (layout switch, Views, Filter, Sort,
   *  help). */
  controlsRef: RefObject<HTMLDivElement | null>;
  /** The search field itself, for the placeholder's own width. */
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface DeskWorkbarFit {
  /** The labelled layout switch does not leave search its minimum width on
   *  the row, so it folds into `DeskLayoutMenu`. */
  isLayoutFolded: boolean;
  /** Which of the placeholders (longest first) fits the field: the index
   *  into the list the caller passed. */
  placeholderIndex: number;
}

/** Canvas the placeholder widths are measured on: one per page, made on
 *  first use. */
let measureContext: CanvasRenderingContext2D | null = null;

function measureTextWidth(text: string, font: string): number {
  measureContext ??= document.createElement("canvas").getContext("2d");
  if (!measureContext) return 0;
  measureContext.font = font;
  return measureContext.measureText(text).width;
}

function readPixels(value: string): number {
  return Number.parseFloat(value) || 0;
}

/** The first placeholder (longest first) whose text fits inside the field's
 *  padding; the last one when none does. */
function pickPlaceholderIndex(
  input: HTMLInputElement,
  placeholders: readonly string[],
): number {
  const style = getComputedStyle(input);
  const textRoom =
    input.clientWidth -
    readPixels(style.paddingLeft) -
    readPixels(style.paddingRight);
  // A field that is not laid out (hidden, or a test DOM) has no width to fit.
  if (textRoom <= 0) return 0;
  // Built from the longhands: not every engine serialises the `font`
  // shorthand of a computed style.
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const fittingIndex = placeholders.findIndex(
    (placeholder) => measureTextWidth(placeholder, font) <= textRoom,
  );
  return fittingIndex === -1 ? placeholders.length - 1 : fittingIndex;
}

/**
 * Keeps the desk workbar on one row in every language, and gives its search
 * field the longest placeholder it can show whole.
 *
 * The row fits when search keeps its CSS `min-width` beside the controls.
 * Portuguese labels are wider than English ones, so a fixed container-query
 * width cannot say when the four labelled layout segments stop fitting: at
 * 1280px they fit in English and push search onto its own row in
 * Portuguese. This hook measures instead. While the switch is labelled it
 * records the strip's width, and folds the switch into `DeskLayoutMenu` the
 * moment search would drop under its minimum. While folded it knows what
 * unfolding costs (the strip's width before the fold minus its width after),
 * so it unfolds only once the labelled row fits again and holds steady at
 * every width in between.
 *
 * The placeholder is picked from the field's own text width (canvas-measured
 * in the field's font), so the field shows a whole phrase: "Search pieces,
 * writers, sections" where it fits, then "Search pieces", then "Search".
 *
 * `resetKey` starts the measurement over: the caller builds it from the
 * layout switch's own labels (so a language change, a label that arrives
 * after its catalog loads, or Calendar coming and going all re-measure). A
 * web font that finishes loading does the same, since it alters every
 * label's width without changing the key.
 */
export function useDeskWorkbarFit(
  { rowRef, controlsRef, inputRef }: DeskWorkbarFitRefs,
  placeholders: readonly string[],
  resetKey: string,
): DeskWorkbarFit {
  const [isLayoutFolded, setIsLayoutFolded] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  /** The controls strip's width the last time the switch was labelled. */
  const labelledWidthRef = useRef(0);
  /** What unfolding adds to the strip, once a fold has been measured. */
  const unfoldCostRef = useRef<number | null>(null);
  const placeholdersKey = placeholders.join("\n");

  // New labels start from the labelled switch; the next measurement
  // re-records its width and folds again only if it must.
  const [measuredKey, setMeasuredKey] = useState(resetKey);
  if (measuredKey !== resetKey) {
    setMeasuredKey(resetKey);
    setIsLayoutFolded(false);
  }

  useLayoutEffect(() => {
    const fonts = document.fonts as FontFaceSet | undefined;
    if (!fonts) return;
    const remeasure = () => setIsLayoutFolded(false);
    fonts.addEventListener("loadingdone", remeasure);
    return () => fonts.removeEventListener("loadingdone", remeasure);
  }, []);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const controls = controlsRef.current;
    const input = inputRef.current;
    if (!row || !controls || !input) return;
    const placeholderList = placeholdersKey.split("\n");

    function measure() {
      if (!row || !controls || !input || row.clientWidth === 0) return;
      setPlaceholderIndex(pickPlaceholderIndex(input, placeholderList));
      const search = input.parentElement ?? input;
      const searchMinimum = readPixels(getComputedStyle(search).minWidth);
      const rowGap = readPixels(getComputedStyle(row).columnGap);
      const controlsWidth = controls.getBoundingClientRect().width;
      const room = row.clientWidth - searchMinimum - rowGap;

      if (!isLayoutFolded) {
        labelledWidthRef.current = controlsWidth;
        if (controlsWidth > room) {
          unfoldCostRef.current = null;
          setIsLayoutFolded(true);
        }
        return;
      }
      unfoldCostRef.current ??= Math.max(
        labelledWidthRef.current - controlsWidth,
        0,
      );
      if (controlsWidth + unfoldCostRef.current <= room) {
        setIsLayoutFolded(false);
      }
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(controls);
    observer.observe(input);
    return () => observer.disconnect();
  }, [rowRef, controlsRef, inputRef, placeholdersKey, isLayoutFolded]);

  return { isLayoutFolded, placeholderIndex };
}
