import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Thread } from "./forum.data";
import { memberPath } from "./forumAuthor.helpers";
import styles from "./ThreadPage.module.css";

/**
 * The second name on a co-authored thread, linked when it carries a slug
 * (PRD-408). Absent on a masked byline, which the server already guarantees:
 * an "anonymous" thread credited to a named member is not anonymous.
 *
 * The control that lets the credited member take their own name off lives in
 * the opening post's ⋯ menu (`useCoAuthorCreditRemoval`).
 */
export function ThreadCoAuthorCredit({ thread }: { thread: Thread }) {
  const { t } = useTranslation();
  const coAuthor = thread.coAuthor;
  if (!coAuthor) return null;
  const label = t("forum:composePage.preview.withCoAuthor", {
    name: coAuthor.name,
  });
  if (!coAuthor.slug) return <span className={styles.coAuthor}>{label}</span>;
  return (
    <Link to={memberPath(coAuthor.slug)} className={styles.coAuthor}>
      {label}
    </Link>
  );
}
