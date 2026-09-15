import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { COMPOSE_TITLE_MAX_LENGTH } from "./composeThread.types";
import { normalizeTag } from "./useComposeThreadState";

// ── What the link that opened the composer already knew ─────────────────────
// `/forum/new` is reached from four places that each know something about the
// post before it is written: a starter chip knows its opening line, a topic
// page knows its tag, a community knows itself. The modal carried those as
// props from the page that opened it; a route carries them in the URL, which
// also means the seeded composer can be shared, bookmarked and reloaded.
//
// Read ONCE, on mount: `useComposeThreadPage` seeds its initial state from
// these, and a later change would otherwise fight whatever the member has
// typed since. The params are deliberately NOT stripped afterwards — they
// describe the link, and rewriting the URL under a member mid-sentence is a
// surprise with nothing to gain.

/** `?title=` — a starter chip's opening line. */
export const COMPOSE_TITLE_PARAM = "title";
/** `?tag=` — a topic page's own tag. */
export const COMPOSE_TAG_PARAM = "tag";
/** `?community=` — a community's "Post here". */
export const COMPOSE_COMMUNITY_PARAM = "community";

export interface ComposeThreadSeeds {
  initialTitle?: string;
  initialTags?: string[];
  initialCommunitySlug?: string;
}

/** Builds the link that opens the composer already holding these seeds. */
export function composeHref(
  basePath: string,
  seeds: { title?: string; tag?: string; community?: string },
): string {
  const params = new URLSearchParams();
  if (seeds.title) params.set(COMPOSE_TITLE_PARAM, seeds.title);
  if (seeds.tag) params.set(COMPOSE_TAG_PARAM, seeds.tag);
  if (seeds.community) params.set(COMPOSE_COMMUNITY_PARAM, seeds.community);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function useComposeThreadSeeds(): ComposeThreadSeeds {
  const [searchParams] = useSearchParams();
  const title = searchParams.get(COMPOSE_TITLE_PARAM);
  const tag = searchParams.get(COMPOSE_TAG_PARAM);
  const community = searchParams.get(COMPOSE_COMMUNITY_PARAM);

  return useMemo(() => {
    // Normalized through the composer's own rules rather than trusted: a tag
    // arrives from a URL anyone can edit, and the tag box would refuse the
    // same text typed by hand.
    const seededTag = tag ? normalizeTag(tag) : "";
    return {
      ...(title
        ? { initialTitle: title.slice(0, COMPOSE_TITLE_MAX_LENGTH) }
        : {}),
      ...(seededTag ? { initialTags: [seededTag] } : {}),
      ...(community ? { initialCommunitySlug: community } : {}),
    };
  }, [title, tag, community]);
}
