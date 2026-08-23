import { CommunitiesGrid } from "./CommunitiesGrid";
import { CommunitiesDiscoverOutro } from "./CommunitiesDiscoverOutro";
import styles from "./CommunitiesPage.module.css";

/**
 * The `/communities?tab=discover` body: the platform-wide directory. All of
 * the grid, filters and join flow live in `CommunitiesGrid` (shared with the
 * "My communities" tab); this is the page frame plus Discover's own outro.
 */
export function CommunitiesDiscover() {
  return (
    <div className={styles.body}>
      <div className="wrap">
        <CommunitiesGrid scope="discover" />
        <CommunitiesDiscoverOutro />
      </div>
    </div>
  );
}
