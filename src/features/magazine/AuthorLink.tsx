import { Link } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useBylineTarget } from "./api/useAuthorsDirectory";
import { resolveWriter } from "./authorContent.data";
import styles from "./AuthorLink.module.css";

/**
 * Renders a magazine byline name as a link to whoever wrote it, falling back
 * to plain bold text when the name doesn't resolve — e.g. a photographer
 * credited by name only. Renders the staff badge beside the name when the
 * writer resolves to a member.
 *
 * CON-11: a byline that belongs to a real member account now links to their
 * MEMBER PROFILE, and only an unlinked byline falls back to the magazine
 * author page. Live mode resolves this against the real authors directory
 * (one cached request for every byline on the page — see `useBylineTarget`);
 * demo mode keeps the curated `resolveWriter` registry, which live mode must
 * never read.
 *
 * Never place this inside an enclosing card `<Link>`: nested anchors are
 * invalid. Card-wide links should set their own destination.
 */
export function AuthorLink({ name }: { name: string }) {
  const { demoMode } = useDemoMode();
  const liveTarget = useBylineTarget(name);
  const demoWriter = demoMode ? resolveWriter(name) : null;

  const target = demoMode
    ? demoWriter && { to: demoWriter.to, memberSlug: demoWriter.slug }
    : liveTarget;

  if (!target) return <b>{name}</b>;
  return (
    <span className={styles.nameRow}>
      <Link to={target.to} className={styles.link}>
        {name}
      </Link>
      <MemberStaffBadge slug={target.memberSlug} />
    </span>
  );
}
