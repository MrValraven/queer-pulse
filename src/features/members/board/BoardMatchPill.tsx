import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { routes } from "../../../app/routeMap";
import type { BoardMatchDTO } from "../api/boardInsights.api";
import styles from "./BoardSection.module.css";

/**
 * A member whose own board post answers this one.
 *
 * Owner-only, because it names a third member's post: the owner sees that
 * Beatriz offers what they are looking for, and a stranger browsing the profile
 * does not. The pill links to that member's profile, where the post is already
 * on show (`#board` matches the section's own `id`).
 */
export function BoardMatchPill({ match }: { match: BoardMatchDTO }) {
  return (
    <Link
      to={`${routes.members}/${match.slug}#board`}
      className={styles.matchPill}
    >
      <FiArrowRight className={styles.matchPillIcon} size={14} aria-hidden />
      <Translation
        i18nKey={
          match.kind === "offering"
            ? "members:content.board.matchOffers"
            : "members:content.board.matchLooking"
        }
        values={{ name: match.first }}
        components={{ strong: <strong /> }}
      />
    </Link>
  );
}
