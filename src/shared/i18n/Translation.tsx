import {
  Fragment,
  cloneElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "./useTranslation";
import type { TranslateOptions } from "./types";

/** Matches a single, non-nested `<tag>inner</tag>` run. */
const TAG_RUN = /<(\w+)>([\s\S]*?)<\/\1>/g;

export interface TranslationProps {
  /** `namespace:path` key, same syntax as `t()`. */
  i18nKey: string;
  /** Tag name → element to clone for that run, e.g. `{ em: <em /> }`. */
  components?: Record<string, ReactElement>;
  /** `{token}` interpolation values; `count` drives CLDR pluralization. */
  values?: TranslateOptions;
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
 * @example
 * <Translation i18nKey="cinema:about.deed.p2" components={{ strong: <strong /> }} />
 */
export function Translation({ i18nKey, components, values }: TranslationProps) {
  const { t } = useTranslation();
  return <>{renderRuns(t(i18nKey, values), components)}</>;
}

/**
 * Split a resolved string into plain-text and tagged runs. An unmapped tag
 * renders its inner text rather than throwing — degrading visibly, matching the
 * engine's key-echo philosophy.
 */
function renderRuns(
  source: string,
  components?: Record<string, ReactElement>,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(TAG_RUN.source, TAG_RUN.flags);
  let cursor = 0;
  let runIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const [full, tagName = "", inner = ""] = match;
    if (match.index > cursor) nodes.push(source.slice(cursor, match.index));

    const element = components?.[tagName];
    nodes.push(
      element ? (
        cloneElement(element, { key: runIndex }, inner)
      ) : (
        <Fragment key={runIndex}>{inner}</Fragment>
      ),
    );

    runIndex += 1;
    cursor = match.index + full.length;
  }

  if (cursor < source.length) nodes.push(source.slice(cursor));
  return nodes;
}
