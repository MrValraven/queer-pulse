import { Link } from "react-router-dom";
import { resolveWriter } from "./authorContent.data";
import styles from "./AuthorLink.module.css";

/**
 * Renders a magazine byline name as a link to the writer's author profile
 * (or their community profile), falling back to plain bold text when the name
 * doesn't resolve — e.g. a photographer credited by name only.
 *
 * Never place this inside an enclosing card `<Link>`: nested anchors are
 * invalid. Card-wide links should set their own `to={resolveWriter(name)}`.
 */
export function AuthorLink({ name }: { name: string }) {
  const to = resolveWriter(name);
  if (!to) return <b>{name}</b>;
  return (
    <Link to={to} className={styles.link}>
      {name}
    </Link>
  );
}
