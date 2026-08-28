import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import { COMMUNITY_TAG_IDS } from "./communityTags.data";

/** Parses `?tags=a,b,c` into valid curated tag ids, silently dropping
 *  anything a stale/hand-edited link sends that this build doesn't
 *  recognize (same defensive posture as `COMMUNITY_TAG_IDS`'s doc comment). */
function parseTagsParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => COMMUNITY_TAG_IDS.has(id));
}

/**
 * The Discover page's tags filter, synced with the URL's `?tags=` param (a
 * comma-separated list of curated tag ids) so a tag pill is a shareable,
 * bookmarkable link, e.g. `/communities?tags=book-club`. Seeds the filter
 * from the param once on mount, then keeps the URL in sync (via `replace`,
 * so toggling tags doesn't spam browser history) as it changes.
 *
 * This is the one filter on the Discover page that round-trips through the
 * URL — search, sort, category, and the two toggles stay page-local state,
 * same as before this hook existed.
 *
 * The sync effect writes ONLY when the param would actually change. An
 * unconditional write mints a fresh `location.key` for a URL identical to the
 * one already on screen, and ScrollManager reads a same-path navigation whose
 * search string did NOT change as a real page change and scrolls to the top
 * (see `isSameRouteQueryChange`). Because this hook lives inside
 * `CommunitiesGrid`, which both `/communities` tabs mount, that fired on every
 * "My communities | Discover" switch and yanked the visitor back to the top.
 */
export function useCommunitiesTagsFilter(): [
  string[],
  Dispatch<SetStateAction<string[]>>,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagIds, setTagIds] = useState<string[]>(() =>
    parseTagsParam(searchParams.get("tags")),
  );

  // Both sides as the plain string the URL carries, so the comparison is the
  // same one the router would make. `null` on both sides means "no `?tags=`".
  // A URL holding ids this build doesn't recognize normalizes on mount, which
  // is a real change and still writes once.
  const currentTagsParam = searchParams.get("tags");
  const nextTagsParam = tagIds.length > 0 ? tagIds.join(",") : null;

  useEffect(() => {
    if (currentTagsParam === nextTagsParam) return;
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (nextTagsParam !== null) next.set("tags", nextTagsParam);
        else next.delete("tags");
        return next;
      },
      { replace: true },
    );
  }, [currentTagsParam, nextTagsParam, setSearchParams]);

  return [tagIds, setTagIds];
}
