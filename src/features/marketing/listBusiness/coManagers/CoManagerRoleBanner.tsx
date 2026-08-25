import { FiUsers } from "react-icons/fi";
import { Translation } from "../../../../shared/i18n/Translation";
import styles from "./CoManagers.module.css";

/**
 * The first thing a co-manager sees on opening the editor: whose listing this
 * is, and where the line falls.
 *
 * The editor is otherwise identical for both roles, and a form full of
 * somebody else's business details reads exactly like your own until something
 * says so. The second sentence is here rather than buried beside the About-you
 * block, because "why can I not see their email address" is a question best
 * answered before it is asked.
 */
export function CoManagerRoleBanner({
  listingName,
  ownerFirstName,
}: {
  listingName: string;
  /** Absent when the owner's account no longer exists. */
  ownerFirstName?: string;
}) {
  return (
    <p className={styles.banner} role="status">
      <span className={styles.bannerIcon} aria-hidden>
        <FiUsers />
      </span>
      <span className={styles.bannerText}>
        <span className={styles.bannerTitle}>
          <Translation
            i18nKey={
              ownerFirstName
                ? "marketing:listBusiness.coManagers.banner.titleNamed"
                : "marketing:listBusiness.coManagers.banner.title"
            }
            values={{ name: ownerFirstName ?? "", listing: listingName }}
          />
        </span>
        <Translation i18nKey="marketing:listBusiness.coManagers.banner.body" />
      </span>
    </p>
  );
}
