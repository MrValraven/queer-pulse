import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { requiredCapability, requiredRole } from "../../app/authGate";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChangelogEntry } from "./changelog.data";
import styles from "./ChangelogPage.module.css";

interface ChangelogEntryRowProps {
  entry: ChangelogEntry;
}

/**
 * True when a route needs a staff role or an additive staff grant, read from
 * the same `authGate` tables the route guard enforces. The changelog is a
 * public page, so a tag pointing at one of these stays a plain label.
 */
function isStaffRoute(path: string): boolean {
  const pathname = path.split(/[?#]/)[0] ?? path;
  return (
    requiredRole(pathname) !== null || requiredCapability(pathname) !== null
  );
}

/** One line of a release: bold title, short body, optional link. */
export function ChangelogEntryRow({ entry }: ChangelogEntryRowProps) {
  const { t } = useTranslation();
  const tagRoute = entry.tag?.to;
  const isTagLinkable = tagRoute !== undefined && !isStaffRoute(tagRoute);

  return (
    <li className={styles.entry}>
      <p className={styles.entryLine}>
        <span className={styles.entryTitle}>{t(entry.titleKey)}</span>{" "}
        <span className={styles.entryBody}>{t(entry.bodyKey)}</span>
        {entry.tag && (
          <>
            {" "}
            {isTagLinkable ? (
              <Link className={styles.tag} to={tagRoute}>
                {t(entry.tag.labelKey)} <FiArrowRight aria-hidden />
              </Link>
            ) : (
              <span className={styles.tag}>{t(entry.tag.labelKey)}</span>
            )}
          </>
        )}
      </p>
    </li>
  );
}
