import { FiExternalLink } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { guideRouteFor } from "../../resources/api/resources.adapters";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import styles from "./GuideWorkspace.module.css";

/**
 * Every place the saved guide appears, each in a new tab. Built from the
 * saved guide, so the links point where readers actually land today; hidden
 * until a new guide is saved.
 */
export function GuideWorkspaceLinks({
  guide,
}: {
  guide: AdminResourceGuideDTO | null;
}) {
  const { t } = useTranslation();
  if (!guide) return null;
  const isPublic = guide.publishedAt !== null && guide.lastReviewedOn !== null;
  const links = [
    {
      key: "live",
      href: guideRouteFor(guide),
      label: t("admin:guideWorkspace.links.live"),
    },
    {
      key: "library",
      href: routes.resources,
      label: t("admin:guideWorkspace.links.library"),
    },
    {
      key: "index",
      href: `${routes.guideIndex}#${encodeURIComponent(guide.category)}`,
      label: t("admin:guideWorkspace.links.index"),
    },
  ];

  return (
    <div className={styles.links}>
      <span className={styles.linksLabel}>
        {t("admin:guideWorkspace.links.label")}
      </span>
      {links.map((link) => (
        <Button
          key={link.key}
          variant="ghost"
          size="sm"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink aria-hidden /> {link.label}
        </Button>
      ))}
      {!isPublic && (
        <p className={styles.linksNote}>
          {t("admin:guideWorkspace.links.notPublic")}
        </p>
      )}
    </div>
  );
}
