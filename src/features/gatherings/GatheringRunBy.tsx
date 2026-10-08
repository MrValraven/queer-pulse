import { Link } from "react-router-dom";
import { businessPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import styles from "./GatheringPage.module.css";

/**
 * "Run by <business>" in the hero's meta line, after "Hosted by" and the
 * community. The name links to the listing. Everyone who can see the
 * gathering sees it, so "Preview as guest" shows it too. Renders nothing for
 * a gathering no business runs.
 */
export function GatheringHeroRunBy({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const runBy = gathering.runByListing;
  if (!runBy) return null;
  return (
    <span className={styles.metaItem}>
      <span className={styles.metaDot} />
      <span>
        {t("gatherings:common.runBy")}{" "}
        <Link className={styles.metaLink} to={businessPath(runBy.slug)}>
          {runBy.name}
        </Link>
      </span>
    </span>
  );
}
