import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiUserX } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  MemberIdentity,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { memberRefToPerson } from "../../shared/api/refs";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { profilePath } from "../connect/connections.data";
import { UNREAD_COUNT_KEY } from "../messages/api/useConversations";
import { unblockMember, type BlockDTO } from "../social/api/social.api";
import { simulateOr } from "./api/account.api";
import { blockedUsersQueryKey, useBlockedUsers } from "./api/useBlockedUsers";
import { Pane, Section } from "./SettingsControls";
import styles from "./BlockedUsersPane.module.css";

/** Mirrors a row so there's no layout shift on load (same idea as
 *  `SessionsPage`'s `SessionSkeleton`). */
function BlockedUserSkeleton() {
  return (
    <div className={styles.skeletonRow}>
      <SkeletonAvatar size={40} />
      <div className={styles.skeletonBody}>
        <SkeletonLine width="45%" height={16} />
        <SkeletonLine width="60%" height={12} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={88} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

function BlockedUserRow({
  entry,
  unblocking,
  onUnblock,
}: {
  entry: BlockDTO;
  unblocking: boolean;
  onUnblock: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const person = memberRefToPerson(entry.member);
  const name = person?.name || t("settings:blockedUsers.row.deletedMember");
  const handleLabel = person?.slug ? `@${person.slug}` : null;
  const blockedOn = t("settings:blockedUsers.row.blockedOn", {
    date: fmt.date(new Date(entry.createdAt)),
  });

  return (
    <div className={styles.row}>
      <div className={styles.identity}>
        <MemberIdentity
          person={{
            slug: person?.slug,
            name,
            avatarUrl: person?.avatarUrl ?? undefined,
          }}
          secondary={handleLabel ? `${handleLabel} · ${blockedOn}` : blockedOn}
          to={person?.slug ? profilePath(person.slug) : undefined}
        />
        {entry.reason && <p className={styles.reason}>{entry.reason}</p>}
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        disabled={unblocking}
        onClick={onUnblock}
      >
        {t("settings:blockedUsers.row.unblockCta")}
      </Button>
    </div>
  );
}

export function BlockedUsersPane() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { blockedUsers, loading: fetching, failed } = useBlockedUsers();
  const simulated = useSimulatedLoad();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const loading = demoMode ? simulated : fetching;
  const [unblockedIds, setUnblockedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleUnblock(entry: BlockDTO) {
    setPendingId(entry.id);
    // Optimistic; revert on failure so we never imply an unblock that didn't happen.
    setUnblockedIds((prev) => new Set(prev).add(entry.id));
    try {
      await simulateOr(demoMode, undefined, () =>
        unblockMember(entry.member.slug),
      );
      showToast(
        t("settings:blockedUsers.toast.unblocked", {
          name: entry.member.firstName,
        }),
        "success",
      );
      if (!demoMode) {
        // This calls `unblockMember` directly rather than going through
        // `useSocial().toggleBlock` (this pane needs the full blocked-member
        // record — avatar, name, block date — not just the slug that context
        // tracks), so it repeats `SocialProvider.persistToggle`'s own
        // cross-surface refresh by hand: the shared `["blocks", …]` cache
        // entry (so `useSocial().blocked` picks up the change too) plus the
        // surfaces a block/unblock affects (connections, member directory,
        // the DM thread list and its unread badge).
        const key = blockedUsersQueryKey(demoMode);
        void queryClient.invalidateQueries({ queryKey: key });
        void queryClient.invalidateQueries({ queryKey: ["connections"] });
        void queryClient.invalidateQueries({ queryKey: ["members"] });
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
      }
    } catch (err) {
      logError(err, { where: "BlockedUsersPane.unblock" });
      setUnblockedIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
      showToast(t("settings:blockedUsers.toast.unblockedError"), "error");
    } finally {
      setPendingId(null);
    }
  }

  const visibleEntries = blockedUsers.filter(
    (entry) => !unblockedIds.has(entry.id),
  );

  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:blockedUsers.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:blockedUsers.sub")}
    >
      <Section label={t("settings:blockedUsers.section.blocked")}>
        <div className={styles.list}>
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <BlockedUserSkeleton key={i} />
            ))
          ) : failed ? (
            <EmptyState
              compact
              icon={<FiUserX />}
              title={t("settings:blockedUsers.empty.error.title")}
              description={t("settings:blockedUsers.empty.error.desc")}
            />
          ) : visibleEntries.length === 0 ? (
            <EmptyState
              compact
              icon={<FiUserX />}
              title={t("settings:blockedUsers.empty.none.title")}
              description={t("settings:blockedUsers.empty.none.desc")}
            />
          ) : (
            visibleEntries.map((entry, i) => (
              <FadeIn key={entry.id} delay={Math.min(i, 8) * 60}>
                <BlockedUserRow
                  entry={entry}
                  unblocking={pendingId === entry.id}
                  onUnblock={() => void handleUnblock(entry)}
                />
              </FadeIn>
            ))
          )}
        </div>
      </Section>
    </Pane>
  );
}
