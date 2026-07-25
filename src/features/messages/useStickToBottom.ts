/** True when the scroll container is within `thresholdPx` of its bottom. */
export function isNearBottom(element: HTMLElement, thresholdPx = 80): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= thresholdPx;
}
