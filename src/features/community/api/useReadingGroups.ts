import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunities } from "../../communities/api/communities.api";
import { READING_GROUP_TAG } from "../readingGroups.adapters";

/**
 * The LIVE reading-group directory: `GET /communities?tags=book-club`.
 *
 * There is no separate reading-group endpoint, and there should not be one. A
 * reading group IS a community carrying the curated `book-club` tag (that is
 * what an approved proposal creates), so the directory is a filter over the
 * communities listing that already exists — which means it already excludes
 * archived, moderated-away and private-to-someone-else groups, already carries
 * the viewer's own roster role, and already counts members, none of which a
 * parallel endpoint would have got right for free.
 *
 * Demo mode never calls it: the prototype's directory is the curated `GROUPS`
 * editorial set, which has no communities behind it.
 */
export function useReadingGroups() {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: ["reading-groups", "directory"],
    enabled: !demoMode,
    queryFn: () =>
      getCommunities({ tags: [READING_GROUP_TAG], sort: "newest" }),
  });
}
