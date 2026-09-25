/** The text a reader gets from an element: the `aria-hidden` odometer glyphs
 *  of a RollingNumber left out, its visually hidden copy of the number kept. */
export function readableText(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  copy
    .querySelectorAll('[aria-hidden="true"]')
    .forEach((hiddenNode) => hiddenNode.remove());
  return copy.textContent ?? "";
}

/** A `*ByText` matcher for the innermost element whose readable text is
 *  `expected`, so a sentence split around a RollingNumber still counts as one
 *  piece of text: `screen.findByText(readableTextIs("2 selected"))`. */
export function readableTextIs(expected: string) {
  return (_content: string, element: Element | null) =>
    element !== null &&
    readableText(element) === expected &&
    Array.from(element.children).every(
      (child) => readableText(child) !== expected,
    );
}
