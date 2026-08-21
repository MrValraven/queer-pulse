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
 */
export function useCommunitiesTagsFilter(): [
  string[],
  Dispatch<SetStateAction<string[]>>,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagIds, setTagIds] = useState<string[]>(() =>
    parseTagsParam(searchParams.get("tags")),
  );

  useEffect(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (tagIds.length) next.set("tags", tagIds.join(","));
        else next.delete("tags");
        return next;
      },
      { replace: true },
    );
  }, [tagIds, setSearchParams]);

  return [tagIds, setTagIds];
}
