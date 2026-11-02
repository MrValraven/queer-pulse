/**
 * Pure readers behind the hidden viewport readout (ViewportDebugReadout.tsx).
 * Every value is read straight from the browser at sample time and returned as
 * display strings; nothing is stored or sent anywhere. Labels are the raw API
 * names on purpose: the readout is a measuring tool for screenshots, so the
 * label has to say exactly which property produced the number.
 */

export interface ViewportDebugRow {
  label: string;
  value: string;
}

export interface ViewportDebugProbes {
  /** `position: fixed; top: 0; bottom: 0`: where a fixed bottom:0 box really
   *  anchors on this device. */
  fixedProbe: HTMLElement | null;
  /** Padded with the top and bottom safe-area insets. */
  safeAreaProbe: HTMLElement | null;
}

const PAGE_MAIN_SELECTOR = "main[data-page-main]";
// The messages shell (`.app` in MessagesPage) and the composer dock
// (ComposerDockContent) carry stable data attributes for this readout.
const SHELL_SELECTOR = "[data-messages-shell]";
const COMPOSER_SELECTOR = "[data-composer-dock]";

const HTML_CUSTOM_PROPERTIES = [
  "--keyboard-inset",
  "--layout-viewport-height",
  "--visual-viewport-top",
  "--visual-viewport-height",
];

const HTML_DATA_ATTRIBUTES = ["data-keyboard-open", "data-messages-thread"];

const UNAVAILABLE = "unavailable";

interface ContainingBlockCheck {
  property: string;
  isContainingBlock: (computedValue: string) => boolean;
}

function isSetToSomething(computedValue: string): boolean {
  return computedValue !== "" && computedValue !== "none";
}

// Each property that turns an element into the containing block of a
// `position: fixed` descendant, so that descendant anchors to that element's
// box.
const CONTAINING_BLOCK_CHECKS: ContainingBlockCheck[] = [
  { property: "transform", isContainingBlock: isSetToSomething },
  { property: "translate", isContainingBlock: isSetToSomething },
  { property: "rotate", isContainingBlock: isSetToSomething },
  { property: "scale", isContainingBlock: isSetToSomething },
  { property: "filter", isContainingBlock: isSetToSomething },
  { property: "backdrop-filter", isContainingBlock: isSetToSomething },
  { property: "-webkit-backdrop-filter", isContainingBlock: isSetToSomething },
  { property: "perspective", isContainingBlock: isSetToSomething },
  {
    property: "contain",
    isContainingBlock: (computedValue) =>
      /\b(layout|paint|strict|content)\b/.test(computedValue),
  },
  {
    property: "will-change",
    isContainingBlock: (computedValue) =>
      /\b(transform|translate|rotate|scale|filter|backdrop-filter|perspective|contain)\b/.test(
        computedValue,
      ),
  },
  {
    property: "container-type",
    isContainingBlock: (computedValue) =>
      computedValue === "size" || computedValue === "inline-size",
  },
];

function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(1)
    : UNAVAILABLE;
}

function formatPixelValue(cssValue: string): string {
  const parsedValue = Number.parseFloat(cssValue);
  return Number.isFinite(parsedValue) ? parsedValue.toFixed(1) : UNAVAILABLE;
}

/** `OS 26_1` style version from the user agent, plus Safari's `Version/`
 *  token when present (Safari 26 freezes the OS token, so both are shown). */
function iosVersionLabel(userAgent: string): string {
  const osMatch = /\bOS (\d+)_(\d+)(?:_(\d+))?/.exec(userAgent);
  const versionMatch = /\bVersion\/(\d+(?:\.\d+)*)/.exec(userAgent);
  const osLabel = osMatch
    ? [osMatch[1], osMatch[2], osMatch[3]].filter(Boolean).join(".")
    : "none";
  return versionMatch ? `${osLabel} (Version/${versionMatch[1]})` : osLabel;
}

function describeElement(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const firstClass = element.classList.item(0);
  return firstClass ? `${tagName}.${firstClass}` : tagName;
}

function describeActiveElement(): string {
  const activeElement = document.activeElement;
  if (!activeElement) return "none";
  const tagName = activeElement.tagName.toLowerCase();
  const typeAttribute = activeElement.getAttribute("type");
  const typeLabel = typeAttribute ? `[type=${typeAttribute}]` : "";
  const idLabel = activeElement.id ? `#${activeElement.id}` : "";
  return `${tagName}${typeLabel}${idLabel}`;
}

function describeRect(element: Element | null): string {
  if (!element) return "absent";
  const rect = element.getBoundingClientRect();
  return `top ${formatNumber(rect.top)} / bottom ${formatNumber(rect.bottom)} / height ${formatNumber(rect.height)}`;
}

function describeHtmlAttribute(attributeName: string): string {
  const attributeValue = document.documentElement.getAttribute(attributeName);
  if (attributeValue === null) return "absent";
  return attributeValue === "" ? "present" : `present (${attributeValue})`;
}

/** The shell and each of its ancestors that would capture a fixed
 *  descendant, as one row per offending property. */
function containingBlockRows(startElement: Element | null): ViewportDebugRow[] {
  const rows: ViewportDebugRow[] = [];
  let currentElement = startElement;
  while (currentElement) {
    const computedStyle = window.getComputedStyle(currentElement);
    for (const check of CONTAINING_BLOCK_CHECKS) {
      const computedValue = computedStyle.getPropertyValue(check.property);
      if (check.isContainingBlock(computedValue.trim())) {
        rows.push({
          label: `fixed containing block ${rows.length + 1}`,
          value: `${describeElement(currentElement)} ${check.property}: ${computedValue.trim()}`,
        });
      }
    }
    currentElement = currentElement.parentElement;
  }
  if (rows.length === 0) {
    rows.push({ label: "fixed containing block", value: "none" });
  }
  return rows;
}

function deviceRows(): ViewportDebugRow[] {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };
  return [
    {
      label: "screen.width x screen.height",
      value: `${window.screen.width} x ${window.screen.height}`,
    },
    { label: "devicePixelRatio", value: formatNumber(window.devicePixelRatio) },
    {
      label: "(display-mode: standalone)",
      value: String(window.matchMedia("(display-mode: standalone)").matches),
    },
    {
      label: "navigator.standalone",
      value: String(navigatorWithStandalone.standalone ?? UNAVAILABLE),
    },
    {
      label: "navigator.userAgent iOS",
      value: iosVersionLabel(navigator.userAgent),
    },
  ];
}

function viewportRows(probes: ViewportDebugProbes): ViewportDebugRow[] {
  const visualViewport = window.visualViewport;
  const fixedProbeRect = probes.fixedProbe?.getBoundingClientRect();
  const safeAreaStyle = probes.safeAreaProbe
    ? window.getComputedStyle(probes.safeAreaProbe)
    : null;
  return [
    { label: "innerHeight", value: formatNumber(window.innerHeight) },
    {
      label: "documentElement.clientHeight",
      value: formatNumber(document.documentElement.clientHeight),
    },
    { label: "scrollY", value: formatNumber(window.scrollY) },
    {
      label: "visualViewport.height",
      value: formatNumber(visualViewport?.height),
    },
    {
      label: "visualViewport.offsetTop",
      value: formatNumber(visualViewport?.offsetTop),
    },
    {
      label: "visualViewport.pageTop",
      value: formatNumber(visualViewport?.pageTop),
    },
    {
      label: "visualViewport.scale",
      value: formatNumber(visualViewport?.scale),
    },
    {
      label: "fixed probe top / bottom",
      value: fixedProbeRect
        ? `${formatNumber(fixedProbeRect.top)} / ${formatNumber(fixedProbeRect.bottom)}`
        : UNAVAILABLE,
    },
    {
      label: "safe-area-inset top / bottom",
      value: safeAreaStyle
        ? `${formatPixelValue(safeAreaStyle.paddingTop)} / ${formatPixelValue(safeAreaStyle.paddingBottom)}`
        : UNAVAILABLE,
    },
  ];
}

function documentStateRows(): ViewportDebugRow[] {
  const htmlStyle = window.getComputedStyle(document.documentElement);
  const customPropertyRows = HTML_CUSTOM_PROPERTIES.map((propertyName) => ({
    label: propertyName,
    value: htmlStyle.getPropertyValue(propertyName).trim() || "unset",
  }));
  const attributeRows = HTML_DATA_ATTRIBUTES.map((attributeName) => ({
    label: attributeName,
    value: describeHtmlAttribute(attributeName),
  }));
  return [
    ...customPropertyRows,
    ...attributeRows,
    { label: "document.activeElement", value: describeActiveElement() },
  ];
}

function layoutRows(): ViewportDebugRow[] {
  const pageMain = document.querySelector(PAGE_MAIN_SELECTOR);
  const shell = document.querySelector(SHELL_SELECTOR);
  return [
    { label: PAGE_MAIN_SELECTOR, value: describeRect(pageMain) },
    { label: SHELL_SELECTOR, value: describeRect(shell) },
    {
      label: COMPOSER_SELECTOR,
      value: describeRect(document.querySelector(COMPOSER_SELECTOR)),
    },
    ...containingBlockRows(shell ?? pageMain),
  ];
}

/** One full sample of every readout row, read at call time. */
export function measureViewport(
  probes: ViewportDebugProbes,
): ViewportDebugRow[] {
  return [
    ...deviceRows(),
    ...viewportRows(probes),
    ...documentStateRows(),
    ...layoutRows(),
  ];
}
