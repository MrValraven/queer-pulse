import { FiArrowUpRight } from "react-icons/fi";
import type { ShelfResource } from "./api/useCommunityResources";
import { RESOURCE_ICON } from "./communityResourceIcons";
import styles from "./CommunityHubTabs.module.css";

/**
 * The read-only resource shelf: the pinned links, documents and guides a
 * community wants every member to find without scrolling the post feed.
 *
 * Lifted verbatim out of `AboutResourcesTab` when the shelf became real, so
 * the treatment members already know is unchanged. Keyed by id where the row
 * has one (live) and by title otherwise (a demo fixture).
 */
export function CommunityResourcesShelf({
  resources,
}: {
  resources: ShelfResource[];
}) {
  return (
    <div className={styles.shelf}>
      {resources.map((resource) => {
        const Icon = RESOURCE_ICON[resource.kind];
        return (
          <a
            className={styles.resource}
            href={resource.href}
            key={resource.id ?? resource.title}
            // Outbound links to somewhere the community chose, not to us.
            target="_blank"
            rel="noreferrer noopener"
          >
            <span className={styles.resourceIc}>
              <Icon aria-hidden />
            </span>
            <span className={styles.resourceMain}>
              <span className={styles.resourceTitle}>{resource.title}</span>
              {resource.note && (
                <span className={styles.resourceNote}>{resource.note}</span>
              )}
            </span>
            <FiArrowUpRight aria-hidden className={styles.resourceArrow} />
          </a>
        );
      })}
    </div>
  );
}
