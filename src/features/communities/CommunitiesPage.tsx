import type { FilterPageState } from "../../shared/components/filterPage";
import { CommunitiesFilterLayout } from "./CommunitiesFilterLayout";
import { CommunitiesGrid } from "./CommunitiesGrid";
import { CommunitiesDiscoverOutro } from "./CommunitiesDiscoverOutro";
import type { CommunitiesFilterSectionKey } from "./communitiesFilterSections";
import type { DiscoverCommunities } from "./useDiscoverCommunities";

/**
 * The `/communities?tab=discover` body: the platform-wide directory. The
 * filter layout puts the sidebar beside the shared `CommunitiesGrid` (the same
 * grid the "My communities" tab uses), and Discover's own outro follows the
 * layout at the frame's full width.
 */
export function CommunitiesDiscover({
  discover,
  filterPage,
}: {
  discover: DiscoverCommunities;
  filterPage: FilterPageState<CommunitiesFilterSectionKey>;
}) {
  return (
    <>
      <CommunitiesFilterLayout discover={discover} filterPage={filterPage}>
        <CommunitiesGrid discover={discover} />
      </CommunitiesFilterLayout>
      <CommunitiesDiscoverOutro />
    </>
  );
}
