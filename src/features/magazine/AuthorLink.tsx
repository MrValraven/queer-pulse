import { Link } from "react-router-dom";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { resolveWriter } from "./authorContent.data";
import styles from "./AuthorLink.module.css";

/**
 * Renders a magazine byline name as a link to the writer's author profile
 * (or their community profile), falling back to plain bold text when the name
 * doesn't resolve — e.g. a photographer credited by name only. Renders the
 * staff badge beside the name when the writer resolves to a staff member.
 *
 * Never place this inside an enclosing card `<Link>`: nested anchors are
 * invalid. Card-wide links should set their own `to={resolveWriter(name)?.to}`.
 */
export function AuthorLink({ name }: { name: string }) {
  const writer = resolveWriter(name);
  if (!writer) return <b>{name}</b>;
  return (
    <span className={styles.nameRow}>
      <Link to={writer.to} className={styles.link}>
        {name}
      </Link>
      <MemberStaffBadge slug={writer.slug} />
    </span>
  );
}
