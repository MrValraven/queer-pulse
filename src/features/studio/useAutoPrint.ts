import { useEffect, useRef, type RefObject } from "react";

/** The two families the one-sheet prints in (the variable builds the app
 *  loads). Loaded explicitly: a face nothing on screen has used yet is not
 *  in document.fonts.ready's pending set. */
const ONE_SHEET_FONT_FAMILIES = ["Fraunces Variable", "DM Sans Variable"];

/** Opens the print dialog once, after the sheet's fonts and images are in.
 *  Safe under StrictMode's double effect: the guard is set when the print
 *  actually runs. */
export function useAutoPrint({
  rootRef,
  isReady,
  shouldPrint,
  onPrint,
}: {
  rootRef: RefObject<HTMLElement | null>;
  isReady: boolean;
  shouldPrint: boolean;
  onPrint: () => void;
}): void {
  const hasPrintedRef = useRef(false);
  useEffect(() => {
    if (!isReady || !shouldPrint || hasPrintedRef.current) return;
    let isCancelled = false;
    const images = Array.from(rootRef.current?.querySelectorAll("img") ?? []);
    const imagesLoaded = Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
    const fontsReady =
      "fonts" in document
        ? Promise.all(
            ONE_SHEET_FONT_FAMILIES.map((family) =>
              document.fonts.load(`1em "${family}"`),
            ),
          )
            .then(() => document.fonts.ready)
            .then(() => undefined)
        : Promise.resolve();
    void Promise.all([imagesLoaded, fontsReady]).then(() => {
      if (isCancelled || hasPrintedRef.current) return;
      hasPrintedRef.current = true;
      onPrint();
    });
    return () => {
      isCancelled = true;
    };
  }, [isReady, shouldPrint, onPrint, rootRef]);
}
