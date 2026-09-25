import {
  Fragment,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { SLOT_VALUE_PREFIX } from "./translate";
import { useTranslation } from "./useTranslation";
import type { TranslateOptions } from "./types";

/** Matches a single, non-nested `<tag>inner</tag>` run. */
const TAG_RUN = /<(\w+)>([\s\S]*?)<\/\1>/g;

/** Closes a slot marker; a marker reads `\uE000token\uE001` in the resolved
 *  string. Both are private-use codepoints, so catalog text never holds one. */
const SLOT_MARKER_END = "\uE001";
const SLOT_MARKER = new RegExp(`${SLOT_VALUE_PREFIX}(\\w+)${SLOT_MARKER_END}`);

type Slots = Record<string, ReactNode>;

export interface TranslationProps {
  /** `namespace:path` key, same syntax as `t()`. */
  i18nKey: string;
  /** Tag name → element to clone for that run, e.g. `{ em: <em /> }`. */
  components?: Record<string, ReactElement>;
  /** `{token}` interpolation values; `count` drives CLDR pluralization. */
  values?: TranslateOptions;
  /** `{token}` placeholders to render as React nodes instead of text,
   *  e.g. `{ count: <RollingNumber value={fmt.number(n)} numericValue={n} /> }`.
   *  Plural selection still uses `values.count`. */
  slots?: Slots;
}

/**
 * Renders a translated string that carries inline markup — the coral `<em>`
 * emphasis idiom, `<strong>`, an `<a>`. The catalog value holds tag
 * placeholders (`"<em>80%</em> goes to the filmmaker"`) so `Catalog` stays
 * `Record<string, string>` and the whole resolver — fallback chain, plurals,
 * interpolation — is reused untouched.
 *
 * Named `Translation`, deliberately not `Trans`: the abbreviation collides with
 * *transgender*, which this platform will not do.
 *
 * `slots` puts a live node where a `{token}` sits, in plain text or inside a
 * tag run, without touching the catalog (second example).
 *
 * @example
 * <Translation i18nKey="cinema:about.deed.p2" components={{ strong: <strong /> }} />
 *
 * @example
 * <Translation
 *   i18nKey="cinema:browse.results.showing"
 *   components={{ strong: <strong /> }}
 *   values={{ count: total }}
 *   slots={{ count: <RollingNumber value={fmt.number(total)} numericValue={total} /> }}
 * />
 */
export function Translation({
  i18nKey,
  components,
  values,
  slots,
}: TranslationProps) {
  const { t } = useTranslation();
  const resolved = t(i18nKey, slots ? withSlotMarkers(values, slots) : values);
  return <>{renderRuns(resolved, components, slots)}</>;
}

/**
 * Fill each slot token with a marker through the private override key, so
 * `values.count` keeps the real number and still picks the plural form.
 */
function withSlotMarkers(
  values: TranslateOptions | undefined,
  slots: Slots,
): TranslateOptions {
  const marked: TranslateOptions = { ...values };
  for (const token of Object.keys(slots)) {
    marked[SLOT_VALUE_PREFIX + token] =
      `${SLOT_VALUE_PREFIX}${token}${SLOT_MARKER_END}`;
  }
  return marked;
}

/**
 * Swap the slot markers in a text run for their nodes. Text without a marker
 * comes back as the same string. Each occurrence gets a key from a counter
 * shared across the whole render, so repeats stay distinct and stable.
 */
function renderSlots(
  text: string,
  slots: Slots | undefined,
  slotCounter: { next: number },
): ReactNode {
  if (!slots || !SLOT_MARKER.test(text)) return text;
  // `split` with one capture group alternates text and token names.
  return text.split(SLOT_MARKER).map((part, index) => {
    if (index % 2 === 0) return part;
    const key = `slot-${slotCounter.next}`;
    slotCounter.next += 1;
    return <Fragment key={key}>{slots[part]}</Fragment>;
  });
}

/**
 * Split a resolved string into plain-text and tagged runs. An unmapped tag
 * renders its inner text rather than throwing — degrading visibly, matching the
 * engine's key-echo philosophy.
 */
function renderRuns(
  source: string,
  components?: Record<string, ReactElement>,
  slots?: Slots,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(TAG_RUN.source, TAG_RUN.flags);
  const slotCounter = { next: 0 };
  let cursor = 0;
  let runIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const [full, tagName = "", inner = ""] = match;
    if (match.index > cursor) {
      nodes.push(
        renderSlots(source.slice(cursor, match.index), slots, slotCounter),
      );
    }

    const element = components?.[tagName];
    const innerNode = renderSlots(inner, slots, slotCounter);
    nodes.push(
      element ? (
        cloneElement(element, { key: runIndex }, innerNode)
      ) : (
        <Fragment key={runIndex}>{innerNode}</Fragment>
      ),
    );

    runIndex += 1;
    cursor = match.index + full.length;
  }

  if (cursor < source.length) {
    nodes.push(renderSlots(source.slice(cursor), slots, slotCounter));
  }
  return nodes;
}
