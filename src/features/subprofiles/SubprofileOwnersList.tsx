import { useState } from "react";
import { FiUserMinus } from "react-icons/fi";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonFor } from "../../shared/api/errorMessage";
import { initialsFromName } from "../../shared/lib/initials";
import type { MemberDTO } from "./api/subprofiles.api";
import { useSubprofileMembers } from "./api/useSubprofileMembers";
import styles from "./SubprofileOwnersPanel.module.css";

/**
 * The persona's current co-owners, one row each, with a creator-only "remove"
 * control on every other member.
 *
 * Co-ownership has no restricted tier: accepting an invite grants full,
 * unrestricted management of the persona. Until this control existed, a
 * creator whose co-owner turned hostile (or whose account was compromised) had
 * no way to take that access back short of deleting the whole persona, losing
 * its handle, endorsements and followers with it. Removal is destructive from
 * the other member's side, so it asks first.
 */
export function SubprofileOwnersList({
  subprofileId,
  members,
  mySlug,
}: {
  subprofileId: string;
  members: MemberDTO[];
  /** The signed-in member's profile slug, for the "you" badge + creator check. */
  mySlug: string | undefined;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { removeMember } = useSubprofileMembers(subprofileId);
  const [pendingRemoval, setPendingRemoval] = useState<MemberDTO | null>(null);

  const viewerIsCreator = members.some(
    (member) => member.isCreator && member.slug === mySlug,
  );

  async function confirmRemoval() {
    if (!pendingRemoval) return;
    const { name, slug } = pendingRemoval;
    try {
      await removeMember.mutateAsync(slug);
      setPendingRemoval(null);
      showToast(t("subprofiles:owners.toastRemoved", { name }), "info");
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:owners.toastRemoveError"),
        "error",
      );
    }
  }

  return (
    <>
      <ul className={styles.list}>
        {members.map((member) => (
          <li key={member.userId} className={styles.row}>
            <Avatar
              initials={initialsFromName(member.name, "?")}
              src={member.avatarUrl ?? undefined}
              tint="plum"
              size={40}
            />
            <span className={styles.rowName}>{member.name}</span>
            {member.isCreator && (
              <Badge tone="plum">{t("subprofiles:owners.creatorTag")}</Badge>
            )}
            {member.slug === mySlug && (
              <Badge tone="ghost">{t("subprofiles:owners.youTag")}</Badge>
            )}
            {viewerIsCreator && !member.isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingRemoval(member)}
                aria-label={t("subprofiles:owners.removeAria", {
                  name: member.name,
                })}
                title={t("subprofiles:owners.removeAria", {
                  name: member.name,
                })}
              >
                <FiUserMinus size={16} aria-hidden />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingRemoval !== null}
        tone="destructive"
        loading={removeMember.isPending}
        title={t("subprofiles:owners.removeConfirmTitle", {
          name: pendingRemoval?.name ?? "",
        })}
        description={t("subprofiles:owners.removeConfirmBody", {
          name: pendingRemoval?.name ?? "",
        })}
        confirmLabel={t("subprofiles:owners.removeConfirmAction")}
        onConfirm={() => void confirmRemoval()}
        onClose={() => setPendingRemoval(null)}
      />
    </>
  );
}
