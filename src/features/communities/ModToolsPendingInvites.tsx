import { useState } from "react";
import { FiMail } from "react-icons/fi";
import {
  ConfirmDialog,
  EmptyState,
  LoadErrorState,
  MemberIdentity,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { memberRefToPerson } from "../../shared/api/refs";
import { ModToolsPendingInviteRow } from "./ModToolsPendingInviteRow";
import {
  useCommunityPendingInvites,
  useRevokeCommunityInvite,
} from "./api/useCommunityInvites";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * Who this community has invited and is still waiting on, with the control
 * that takes an invitation back.
 *
 * It sits directly under the send form rather than on a rail item of its own,
 * because "who have we already asked" and "who shall we ask" are one question
 * answered in one place: a moderator about to invite somebody needs to see
 * that a colleague invited her last week, and the server already answers a
 * re-invite with `already_invited` rather than a second bell. A tenth rail
 * item would also compete with the two time-sensitive queues for attention it
 * does not need, and the rule here is a rail plus one pane, addressed by
 * `?mod=`.
 *
 * Until this list existed an invitation was write-only from the community's
 * side. Staff could send one and never see it again or take it back, which
 * mattered most in exactly the case the invite tier exists for: an invitation
 * sent to the wrong person into a survivors' or coming-out group could not be
 * withdrawn at all.
 *
 * WITHDRAWING IS SILENT and the copy says so plainly. Nothing reaches the
 * invitee: the invitation stops working. Telling somebody they have been
 * uninvited from a room like that is worse than saying nothing.
 */
export function ModToolsPendingInvites({
  slug,
  isStaff,
}: {
  slug: string;
  /** Owner, co-owner or moderator, read from the detail DTO's `myRole`. The
   *  endpoint 403s anybody else, so this is what keeps the request from being
   *  made at all rather than made and refused. */
  isStaff: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { invites, isLoading, isError, refetch } = useCommunityPendingInvites(
    slug,
    { enabled: isStaff },
  );
  const revoke = useRevokeCommunityInvite(slug);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const revoking = invites.find((invite) => invite.id === revokingId) ?? null;

  const confirmRevoke = () => {
    if (!revoking) return;
    revoke.mutate(
      { inviteId: revoking.id },
      {
        onSuccess: () => {
          setRevokingId(null);
          showToast(
            t("communities:detail.modtools.invites.pending.revokedToast"),
            "success",
          );
        },
        onError: () =>
          showToast(
            t("communities:detail.modtools.invites.pending.errorToast"),
            "error",
          ),
      },
    );
  };

  if (!isStaff) return null;

  return (
    <section className={styles.pendingSection}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.invites.pending.label")}{" "}
        {invites.length > 0 && (
          <span className={detail.tabCount}>{fmt.number(invites.length)}</span>
        )}
      </div>
      <p className={styles.intro}>
        {t("communities:detail.modtools.invites.pending.intro")}
      </p>

      {isLoading ? (
        <div aria-busy="true">
          <SkeletonLine height={14} style={{ marginBottom: 10 }} />
          <SkeletonLine height={14} width="70%" />
        </div>
      ) : isError ? (
        // A failed read must never paint as "nobody is waiting": that is the
        // one answer this list is not allowed to get wrong.
        <LoadErrorState compact onRetry={refetch} />
      ) : invites.length === 0 ? (
        <EmptyState
          compact
          icon={<FiMail />}
          title={t("communities:detail.modtools.invites.pending.empty")}
          description={t(
            "communities:detail.modtools.invites.pending.emptyDescription",
          )}
        />
      ) : (
        <div className={styles.rows}>
          {invites.map((invite) => (
            <ModToolsPendingInviteRow
              key={invite.id}
              invite={invite}
              isPending={revoke.isPending && revokingId === invite.id}
              onRevoke={() => setRevokingId(invite.id)}
              formatDate={(iso) => fmt.date(new Date(iso))}
            />
          ))}
        </div>
      )}

      {revoking && (
        <ConfirmDialog
          open
          tone="destructive"
          loading={revoke.isPending}
          title={t(
            "communities:detail.modtools.invites.pending.revokeConfirm.title",
          )}
          description={t(
            "communities:detail.modtools.invites.pending.revokeConfirm.body",
          )}
          confirmLabel={
            revoke.isPending
              ? t("communities:common.loading")
              : t("communities:detail.modtools.invites.pending.revokeCta")
          }
          onClose={() => setRevokingId(null)}
          onConfirm={confirmRevoke}
        >
          {/* The dialog names nobody in its copy, so it shows them instead.
              Withdrawing the wrong invitation is silent and irreversible from
              the moderator's side, so the person it lands on is in front of
              them while they decide. */}
          <MemberIdentity
            person={{
              slug: revoking.member.slug,
              name:
                memberRefToPerson(revoking.member)?.name ||
                revoking.member.slug,
              avatarUrl: revoking.member.avatarUrl ?? undefined,
            }}
            size={36}
          />
        </ConfirmDialog>
      )}
    </section>
  );
}
