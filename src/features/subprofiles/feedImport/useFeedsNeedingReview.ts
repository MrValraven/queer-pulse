import { useQueries } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { SubprofileView } from "../api/subprofiles.adapters";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { subprofileFeedsQueryOptions } from "../api/useSubprofileFeeds";
import { supportsFeedImport } from "./feedImportKinds";

/** A connected feed with episodes waiting, and the persona it belongs to. */
export interface FeedNeedingReview {
  subprofile: SubprofileView;
  feed: SubprofileFeedDTO;
}

/**
 * The feeds, across the member's personas, that have episodes waiting for
 * review: what the dashboard nudge lists. Only personas whose kind can import
 * a feed are asked, so a dashboard with no podcast persona makes no request at
 * all. Reads the same cache entry the editor's Import pane does, so a publish
 * there clears the nudge here. A failed read simply shows no nudge.
 */
export function useFeedsNeedingReview(
  subprofiles: SubprofileView[],
): FeedNeedingReview[] {
  const { demoMode } = useDemoMode();
  const importers = subprofiles.filter((subprofile) =>
    supportsFeedImport(subprofile.kind),
  );
  const results = useQueries({
    queries: importers.map((subprofile) =>
      subprofileFeedsQueryOptions(demoMode, subprofile.id),
    ),
  });
  return importers.flatMap((subprofile, index) =>
    (results[index]?.data ?? [])
      .filter((feed) => feed.pendingCount > 0)
      .map((feed) => ({ subprofile, feed })),
  );
}
