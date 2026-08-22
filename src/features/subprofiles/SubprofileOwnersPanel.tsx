import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiX } from "react-icons/fi";
import { Avatar, Button, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { reasonFor } from "../../shared/api/errorMessage";
import { initialsFromName } from "../../shared/lib/initials";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileMembers } from "./api/useSubprofileMembers";
import { useSubprofileInvites } from "./api/useSubprofileInvites";
import { InviteCoOwnerModal } from "./InviteCoOwnerModal";
import { SubprofileOwnersList } from "./SubprofileOwnersList";
import styles from "./SubprofileOwnersPanel.module.css";

/**
 * Owner-facing "Co-owners" pane body: everyone who can currently edit this
 * persona, outstanding invites (with revoke), an entry point to invite
 * someone new, and — once there's more than one member — a way for the
 * signed-in member to leave. `subprofile.id` drives both the members and
 * invites hooks, which branch demo/live internally (this component just
 * consumes them). No outer card/title of its own — the editor's pane router
 * (`EditorPaneRouter`, Task 4) already renders the "Co-owners" h2 + lede
 * above whichever pane is active, reusing this component's own
 * `owners.title`/`owners.note` copy, so a second heading here would just
 * repeat it.
 *
 * Takes the full `subprofile` (not just its id) so it can pass it down into
 * `InviteCoOwnerModal` — that modal reads `linkVisibility` to disclose,
 * before an invite goes out, that co-owner access is full/unrestricted and,
 * for an Unlinked (pseudonymous) persona specifically, that accepting
 * reveals the creator's real identity to the invitee (IDN-2).
 */
export function SubprofileOwnersPanel({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const subprofileId = subprofile.id;
  const { data: members, leave } = useSubprofileMembers(subprofileId);
  const { data: invites, revoke } = useSubprofileInvites(subprofileId);
  const [inviting, setInviting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const memberList = members ?? [];
  const pendingInvites = (invites ?? []).filter(
    (invite) => invite.status === "pending",
  );
  const mySlug = user?.profile.slug;
  const canLeave = memberList.length > 1;

  const excludedSlugs = useMemo(
    () => [
      ...(members ?? []).map((member) => member.slug),
      ...(invites ?? [])
        .filter((invite) => invite.status === "pending")
        .map((invite) => invite.invitedSlug),
    ],
    [members, invites],
  );

  async function handleRevoke(inviteId: string) {
    setRevokingId(inviteId);
    try {
      await revoke.mutateAsync(inviteId);
      showToast(t("subprofiles:owners.toastRevoked"), "info");
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:owners.toastRevokeError"),
        "error",
      );
    } finally {
      setRevokingId(null);
    }
  }

  async function handleLeave() {
    try {
      await leave.mutateAsync();
      setLeaveOpen(false);
      showToast(t("subprofiles:owners.toastLeft"), "info");
      void navigate(routes.subprofilesDashboard);
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:owners.toastLeaveError"),
        "error",
      );
    }
  }

  return (
    <div className="ed-grid">
      <SubprofileOwnersList
        subprofileId={subprofileId}
        members={memberList}
        mySlug={mySlug}
      />

      {pendingInvites.length > 0 && (
        <>
          <p className={styles.pendingHeading}>
            {t("subprofiles:owners.pendingHeading")}
          </p>
          <ul className={styles.list}>
            {pendingInvites.map((invite) => (
              <li key={invite.id} className={styles.row}>
                <Avatar
                  initials={initialsFromName(invite.invitedName, "?")}
                  src={invite.invitedAvatarUrl ?? undefined}
                  tint="plum"
                  size={40}
                />
                <span className={styles.rowName}>{invite.invitedName}</span>
                <button
                  type="button"
                  className={styles.revokeBtn}
                  onClick={() => void handleRevoke(invite.id)}
                  disabled={revokingId === invite.id}
                  aria-label={t("subprofiles:owners.revokeAria", {
                    name: invite.invitedName,
                  })}
                >
                  <FiX size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" onClick={() => setInviting(true)}>
          <FiUserPlus size={16} aria-hidden />{" "}
          {t("subprofiles:owners.inviteCta")}
        </Button>
        {canLeave && (
          <Button variant="ghost" onClick={() => setLeaveOpen(true)}>
            {t("subprofiles:owners.leaveCta")}
          </Button>
        )}
      </div>

      {inviting && (
        <InviteCoOwnerModal
          subprofile={subprofile}
          excludedSlugs={excludedSlugs}
          onClose={() => setInviting(false)}
        />
      )}

      {leaveOpen && (
        <Modal
          title={t("subprofiles:owners.leaveModalTitle")}
          onClose={() => setLeaveOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
                {t("subprofiles:owners.leaveModalKeep")}
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleLeave()}
                disabled={leave.isPending}
              >
                {leave.isPending
                  ? t("subprofiles:owners.leaveModalLeaving")
                  : t("subprofiles:owners.leaveModalConfirm")}
              </Button>
            </>
          }
        >
          <p>{t("subprofiles:owners.leaveModalBody")}</p>
        </Modal>
      )}
    </div>
  );
}
