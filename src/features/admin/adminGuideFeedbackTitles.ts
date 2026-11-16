import { HEALTHCARE, HOUSING, WORKPLACE } from "../resources/legal.data";
import { EXPERIENCES } from "../resources/mentalHealth.data";
import { GUIDES } from "../resources/sexualHealth.data";

/**
 * Every ratable guide's content key mapped to the catalog key of the title a
 * member sees on it, read from the same data the resource pages render. The
 * feedback list shows that title and keeps the content key as a quiet
 * reference line underneath.
 */
const GUIDE_TITLE_KEYS: ReadonlyMap<string, string> = new Map(
  [...WORKPLACE, ...HOUSING, ...HEALTHCARE, ...EXPERIENCES, ...GUIDES].map(
    (guide) => [guide.contentKey, guide.titleKey],
  ),
);

/** The title catalog key for a rated guide, or `undefined` for a content key
 *  no resource page lists any more. */
export function guideTitleKeyFor(contentKey: string): string | undefined {
  return GUIDE_TITLE_KEYS.get(contentKey);
}
