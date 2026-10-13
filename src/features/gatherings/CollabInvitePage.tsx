import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useCollabInvite } from "./api/useCollabInvite";
import { CollabInviteOpen } from "./CollabInviteBody";
import { CollabInviteResolved } from "./CollabInviteResolved";
import { collabInviteResolvedKind } from "./collabInviteState";
import styles from "./CoHostInvitePage.module.css";

/**
 * `/collab-invites/:inviteId`: a guest community's invite to host a
 * gathering with its lead community, modelled on `CoHostInvitePage`.
 * Reached from the `event_community_invite` notification. Demo reads
 * `DEMO_COLLAB_INVITE`.
 */
export function CollabInvitePage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { data: invite, isPending, isError } = useCollabInvite(inviteId);

  if (isPending) {
    return (
      <PageShell>
        <div className={styles.page} />
      </PageShell>
    );
  }
  if (isError || !invite) {
    return <CollabInviteResolved kind="notFound" invite={null} />;
  }
  const resolvedKind = collabInviteResolvedKind(invite);
  if (resolvedKind) {
    return <CollabInviteResolved kind={resolvedKind} invite={invite} />;
  }
  return <CollabInviteOpen invite={invite} />;
}
