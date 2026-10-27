import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import type { StudioSupporterIdentityView } from "./api/studioListening.adapters";
import styles from "./StudioSupporter.module.css";

const DEFAULT_AVATAR_SIZE = 32;

/** Avatar and name as the artist sees them; `isLinked` false inside a radio
 *  card. Every supporter identity renders through this one component (the
 *  picker preview, the confirmation line and the artist's Top supporters
 *  card), so what the listener picks is exactly what the artist sees. */
export function StudioSupporterIdentity({
  identity,
  size = DEFAULT_AVATAR_SIZE,
  isLinked,
}: {
  identity: StudioSupporterIdentityView;
  size?: number;
  isLinked?: boolean;
}) {
  const href = isLinked !== false ? identity.href : null;
  return (
    <span className={styles.identity}>
      <Avatar
        aria-hidden="true"
        src={identity.avatarUrl ?? undefined}
        tint={identity.tint}
        initials={identity.initials}
        size={size}
      />
      {href !== null ? (
        <Link to={href} className={styles.identityLink}>
          {identity.name}
        </Link>
      ) : (
        <span className={styles.identityName}>{identity.name}</span>
      )}
    </span>
  );
}
