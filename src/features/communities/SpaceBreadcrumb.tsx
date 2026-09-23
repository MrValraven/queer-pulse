import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import type { CommunityParentRef } from "./api/communities.api";
import styles from "./CommunityDetailPage.module.css";

/**
 * A space's (subcommunity's) breadcrumb: a link back to the parent
 * community, then the space's own name. `CommunityDetailHero` renders this
 * in the back link's place whenever `living.parent` is set, i.e. the
 * community being viewed is a space.
 */
export function SpaceBreadcrumb({
  parent,
  spaceName,
}: {
  parent: Pick<CommunityParentRef, "slug" | "name">;
  spaceName: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.spaceBreadcrumb}>
      <Link to={communityPath(parent.slug)} className={styles.breadcrumb}>
        {t("communities:spaces.breadcrumb.label", { name: parent.name })}
      </Link>
      <FiChevronRight aria-hidden className={styles.spaceBreadcrumbChevron} />
      <span className={styles.spaceBreadcrumbName}>{spaceName}</span>
    </div>
  );
}
