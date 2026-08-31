import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiUserX, FiVolumeX } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  LoadErrorState,
  MemberIdentity,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import { memberRefToPerson, type MemberRefDTO } from "../../shared/api/refs";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { profilePath } from "../connect/connections.data";
import { UNREAD_COUNT_KEY } from "../messages/api/useConversations";
import {
  unblockMember,
  unmuteMember,
  type BlockDTO,
  type MuteDTO,
} from "../social/api/social.api";
import {
  mutedMembersQueryKey,
  useMutedMembers,
} from "../safety/api/useMutedMembers";
import { simulateOr } from "./api/account.api";
import { blockedUsersQueryKey, useBlockedUsers } from "./api/useBlockedUsers";
import { Pane, Section } from "./SettingsControls";
import styles from "./BlockedUsersPane.module.css";

/** Mirrors a row so there's no layout shift on load (same idea as
 *  `SessionsPage`'s `SessionSkeleton`). */
function SilencedMemberSkeleton() {
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

/**
 * One person the account has silenced, blocked or muted. Both sections render
 * this: a member asking "who have I silenced?" is not distinguishing the two
 * mechanisms, so the row that answers them is the same one. Enough to
 * recognise the person (avatar, name, handle) and to know when it happened,
 * plus a single undo whose accessible name carries their name so the control
 * is unambiguous out of context.
 */
function SilencedMemberRow({
  member,
  fallbackName,
  whenLabel,
  reason,
  actionLabel,
  actionAccessibleName,
  isActing,
  onAct,
}: {
  member: MemberRefDTO;
  fallbackName: string;
  whenLabel: string;
  reason?: string;
  actionLabel: string;
  actionAccessibleName: string;
  isActing: boolean;
  onAct: () => void;
}) {
  const person = memberRefToPerson(member);
  const name = person?.name || fallbackName;
  const handleLabel = person?.slug ? `@${person.slug}` : null;

  return (
    <div className={styles.row}>
      <div className={styles.identity}>
        <MemberIdentity
          person={{
            slug: person?.slug,
            name,
            avatarUrl: person?.avatarUrl ?? undefined,
          }}
          secondary={handleLabel ? `${handleLabel} · ${whenLabel}` : whenLabel}
          to={person?.slug ? profilePath(person.slug) : undefined}
        />
        {reason && <p className={styles.reason}>{reason}</p>}
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        disabled={isActing}
        aria-label={actionAccessibleName}
        onClick={onAct}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

/** Members this account has blocked: hard, mutual severance. */
function BlockedSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const {
    blockedUsers,
    loading: fetching,
    failed,
    refetch,
  } = useBlockedUsers();
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
    <Section label={t("settings:blockedUsers.section.blocked")}>
      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <SilencedMemberSkeleton key={index} />
          ))
        ) : failed ? (
          // A failed read gets a retry, not just a sentence (DES-22).
          <LoadErrorState
            compact
            onRetry={refetch}
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
          visibleEntries.map((entry, index) => (
            <FadeIn key={entry.id} delay={Math.min(index, 8) * 60}>
              <SilencedMemberRow
                member={entry.member}
                fallbackName={t("settings:blockedUsers.row.deletedMember")}
                whenLabel={t("settings:blockedUsers.row.blockedOn", {
                  date: fmt.date(new Date(entry.createdAt)),
                })}
                reason={entry.reason}
                actionLabel={t("settings:blockedUsers.row.unblockCta")}
                actionAccessibleName={t(
                  "safety:blockedMembers.row.unblockLabel",
                  {
                    name: entry.member.firstName,
                  },
                )}
                isActing={pendingId === entry.id}
                onAct={() => void handleUnblock(entry)}
              />
            </FadeIn>
          ))
        )}
      </div>
    </Section>
  );
}

/**
 * Members this account has muted: one-way, silent, reversible (PRD-07).
 *
 * A mute a member cannot find again is a mute they cannot undo, exactly the
 * argument `FeedMutedSourcesPage` makes for feed sources. Person mutes were
 * already stored server-side (`GET /mutes`) and already hydrated app-wide by
 * `SocialProvider`, they were simply never shown to the person who placed
 * them. This section is that list, and it lives beside the blocked list
 * because someone asking "who have I silenced?" does not think in primitives.
 *
 * The note says plainly what a mute did and did not do: it never told them and
 * never removed them from anything. That sentence is why the feature can exist
 * without costing communities their members.
 */
function MutedSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const {
    mutedMembers,
    loading: fetching,
    failed,
    refetch,
  } = useMutedMembers();
  const simulated = useSimulatedLoad();
  const loading = demoMode ? simulated : fetching;
  const [unmutedIds, setUnmutedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleUnmute(entry: MuteDTO) {
    setPendingId(entry.id);
    // Optimistic; revert on failure so we never imply an unmute that didn't happen.
    setUnmutedIds((prev) => new Set(prev).add(entry.id));
    try {
      await simulateOr(demoMode, undefined, () =>
        unmuteMember(entry.member.slug),
      );
      showToast(
        t("safety:mutedMembers.toast.unmuted", {
          name: entry.member.firstName,
        }),
        "success",
      );
      if (!demoMode) {
        // Same reasoning as the blocked section: this calls `unmuteMember`
        // directly, because the section needs the full record (avatar, name,
        // mute date) while `useSocial()` tracks only the slug. So it refreshes
        // the shared `["mutes", ...]` cache entry by hand. That one
        // invalidation re-hydrates `useSocial().muted`, which is what every
        // surface filters on, so the feed and the profile stop hiding them
        // without a reload.
        void queryClient.invalidateQueries({
          queryKey: mutedMembersQueryKey(demoMode),
        });
      }
    } catch (err) {
      logError(err, { where: "BlockedUsersPane.unmute" });
      setUnmutedIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
      showToast(t("safety:mutedMembers.toast.unmutedError"), "error");
    } finally {
      setPendingId(null);
    }
  }

  const visibleEntries = mutedMembers.filter(
    (entry) => !unmutedIds.has(entry.id),
  );

  return (
    <Section label={t("safety:mutedMembers.section.muted")}>
      <p className={styles.sectionNote}>{t("safety:mutedMembers.note")}</p>
      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <SilencedMemberSkeleton key={index} />
          ))
        ) : failed ? (
          <LoadErrorState
            compact
            onRetry={refetch}
            title={t("safety:mutedMembers.empty.error.title")}
            description={t("safety:mutedMembers.empty.error.desc")}
          />
        ) : visibleEntries.length === 0 ? (
          <EmptyState
            compact
            icon={<FiVolumeX />}
            title={t("safety:mutedMembers.empty.none.title")}
            description={t("safety:mutedMembers.empty.none.desc")}
          />
        ) : (
          visibleEntries.map((entry, index) => (
            <FadeIn key={entry.id} delay={Math.min(index, 8) * 60}>
              <SilencedMemberRow
                member={entry.member}
                fallbackName={t("safety:mutedMembers.row.deletedMember")}
                whenLabel={t("safety:mutedMembers.row.mutedOn", {
                  date: fmt.date(new Date(entry.createdAt)),
                })}
                actionLabel={t("safety:mutedMembers.row.unmuteCta")}
                actionAccessibleName={t("safety:mutedMembers.row.unmuteLabel", {
                  name: entry.member.firstName,
                })}
                isActing={pendingId === entry.id}
                onAct={() => void handleUnmute(entry)}
              />
            </FadeIn>
          ))
        )}
      </div>
    </Section>
  );
}

export function BlockedUsersPane() {
  const { t } = useTranslation();

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
      <BlockedSection />
      <MutedSection />
    </Pane>
  );
}
