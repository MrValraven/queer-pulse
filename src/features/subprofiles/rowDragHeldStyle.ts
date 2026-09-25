/** A delay far longer than any row transition. A transition whose duration
 *  plus delay is zero or less never starts at all. */
const NEVER_START_DELAY = "-3600s";

interface InlineValue {
  value: string;
  priority: string;
}

function readInline(element: HTMLElement, property: string): InlineValue {
  return {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

function writeInline(
  element: HTMLElement,
  property: string,
  { value, priority }: InlineValue,
): void {
  if (value === "") element.style.removeProperty(property);
  else element.style.setProperty(property, value, priority);
}

function splitList(value: string): string[] {
  return value.split(",").map((entry) => entry.trim());
}

/** Resolve pending style now, so a `translate` change made while the row is
 *  held is judged under the held transition lists. */
function flushStyle(element: HTMLElement): void {
  window.getComputedStyle(element).getPropertyValue("translate");
}

/**
 * Keep every CSS transition on `translate` from starting while a row is
 * held, and return the release. The drag writes `translate` itself each
 * frame, and a transition there painted a swap's jump for a frame, even under
 * reduced motion: the global rule forces every duration to 0.01ms with
 * `!important`, which outranks any inline duration. So the row's own
 * transition lists are kept (inline ones included, `all` too) and one
 * trailing `translate` entry is added with a negative delay that outweighs
 * any duration. Its other transitions, such as the lift, run as before.
 *
 * The release resolves style first, so a `translate` cleared just before it
 * still lands at once, then restores the inline values it found.
 */
export function holdTranslateStill(element: HTMLElement): () => void {
  const computed = getComputedStyle(element);
  const properties = splitList(computed.transitionProperty);
  const isTransitioningTranslate = properties.some(
    (property) => property === "all" || property === "translate",
  );
  if (!isTransitioningTranslate) return () => undefined;
  const delays = splitList(computed.transitionDelay);
  const alignedDelays = properties.map(
    (_, index) => delays[index % delays.length] ?? "0s",
  );
  const savedProperty = readInline(element, "transition-property");
  const savedDelay = readInline(element, "transition-delay");
  element.style.setProperty(
    "transition-property",
    [...properties, "translate"].join(", "),
  );
  element.style.setProperty(
    "transition-delay",
    [...alignedDelays, NEVER_START_DELAY].join(", "),
  );
  return () => {
    flushStyle(element);
    writeInline(element, "transition-property", savedProperty);
    writeInline(element, "transition-delay", savedDelay);
  };
}
