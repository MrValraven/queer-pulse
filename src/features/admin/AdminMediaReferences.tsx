import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { Badge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  mediaReferenceHref,
  mediaReferenceLabelKey,
  type MediaReference,
} from "../../shared/media/mediaReferences";
import styles from "./AdminMediaPage.module.css";

/**
 * Card-grid + drawer status pill: "In use (N)" (violet — leave alone) when the
 * object still has database references, "No references" (jade — safe to
 * delete) when it doesn't. Shared so the two surfaces never drift.
 */
export function AdminMediaReferenceBadge({
  references,
}: {
  references: MediaReference[];
}) {
  const { t } = useTranslation();
  return references.length > 0 ? (
    <Badge tone="violet">
      {t("admin:media.references.inUseBadge", { count: references.length })}
    </Badge>
  ) : (
    <Badge tone="jade">{t("admin:media.references.orphanBadge")}</Badge>
  );
}

/**
 * Every place one uploaded object is referenced — each a router link when
 * `mediaReferenceHref` resolves a route, otherwise a plain label. Reused by
 * both the inspection drawer's "Referenced in" section and the delete-confirm
 * warning, so an admin always sees the same list before deleting.
 */
export function AdminMediaReferenceList({
  references,
  degraded = false,
}: {
  references: MediaReference[];
  /** When true, an empty reference set is UNVERIFIED (a check failed) rather
   *  than a confirmed orphan — so never present it as "safe to delete". */
  degraded?: boolean;
}) {
  const { t } = useTranslation();

  if (references.length === 0) {
    return degraded ? (
      <p className={styles.referenceWarning}>
        <FiAlertTriangle aria-hidden />
        {t("admin:media.references.unverified")}
      </p>
    ) : (
      <p className={styles.referencesEmpty}>
        {t("admin:media.references.empty")}
      </p>
    );
  }

  return (
    <ul className={styles.referencesList}>
      {references.map((reference, referenceIndex) => {
        const href = mediaReferenceHref(reference);
        const text = [t(mediaReferenceLabelKey(reference.type)), reference.label]
          .filter(Boolean)
          .join(" · ");
        return (
          <li
            key={`${reference.type}-${reference.entityId}-${referenceIndex}`}
            className={styles.referenceItem}
          >
            {href ? (
              <Link to={href} className={styles.referenceLink}>
                {text}
              </Link>
            ) : (
              <span className={styles.referenceLabel}>{text}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
