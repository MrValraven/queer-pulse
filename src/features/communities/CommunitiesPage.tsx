import { CommunitiesGrid } from "./CommunitiesGrid";
import { CommunitiesDiscoverOutro } from "./CommunitiesDiscoverOutro";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import styles from "./CommunitiesPage.module.css";

/**
 * The `/communities?tab=discover` body: the platform-wide directory. The grid
 * and join flow live in `CommunitiesGrid` (shared with the "My communities"
 * tab) and the search, Refine drawer and chip row live in the page header's
 * toolbar; this is the page frame plus Discover's own outro.
 */
export function CommunitiesDiscover({
  discover,
}: {
  discover: DiscoverCommunities;
}) {
  return (
    <div className={styles.body}>
      <div className="wrap">
        <CommunitiesGrid discover={discover} />
        <CommunitiesDiscoverOutro />
      </div>
    </div>
  );
}
