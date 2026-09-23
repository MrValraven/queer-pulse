// src/features/settings/BlockedIdentitiesSection.tsx
import { useState } from "react";
import { FiUserX } from "react-icons/fi";
import {
  Avatar,
  Button,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { tintForSlug } from "../../shared/api/refs";
import { orgBadgeInitials } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { MAILBOX_KIND_LABEL_KEYS } from "../messages/mailboxes/mailboxLabels";
import type { IdentityBlockDTO } from "../social/api/identityBlocks.api";
import {
  useIdentityBlocks,
  useUnblockIdentity,
} from "../social/api/useIdentityBlocks";
import { Section } from "./SettingsControls";
import styles from "./BlockedIdentitiesSection.module.css";

/** Mirrors `BlockedUsersPane`'s `SilencedMemberSkeleton` so the list loads in
 *  without a layout shift. */
function BlockedIdentitySkeleton() {
  return (
    <div className={styles.skeletonRow}>
      <SkeletonAvatar size={40} />
      <div className={styles.skeletonBody}>
        <SkeletonLine width="45%" height={16} />
        <SkeletonLine width="60%" height={12} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={96} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

function BlockedIdentityRow({
  entry,
  isActing,
  onUnblock,
}: {
  entry: IdentityBlockDTO;
  isActing: boolean;
  onUnblock: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const name = entry.identity.displayName || t("messages:mailbox.untitled");
  const kindLabelKey = entry.identity.kind
    ? MAILBOX_KIND_LABEL_KEYS[entry.identity.kind]
    : undefined;
  const secondary = [
    kindLabelKey ? t(kindLabelKey) : null,
    t("messages:mailbox.blocked.since", {
      date: format.date(new Date(entry.createdAt)),
    }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.row}>
      <div className={styles.identity}>
        <div className={styles.identityHead}>
          <Avatar
            initials={orgBadgeInitials(name)}
            tint={
              entry.identity.handle
                ? tintForSlug(entry.identity.handle)
                : "plum"
            }
            src={entry.identity.avatarUrl ?? undefined}
            size={40}
          />
          <div className={styles.identityText}>
            <div className={styles.name}>{name}</div>
            <div className={styles.meta}>{secondary}</div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className={styles.action}
        disabled={isActing}
        onClick={onUnblock}
      >
        {t("messages:mailbox.block.unblockAction", { name })}
      </Button>
    </div>
  );
}

/**
 * PRD-376: the businesses, personas and companies the member has blocked
 * (`/identity-blocks`), rendered inside `BlockedUsersPane` beneath its
 * existing member block/mute sections. A block closes every thread with that
 * identity for both sides; unblocking here only reopens the door, it never
 * resends anything either side wrote before the block.
 */
export function BlockedIdentitiesSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const {
    identityBlocks,
    isLoading: isFetching,
    hasFailed,
    refetch,
  } = useIdentityBlocks();
  const unblockIdentity = useUnblockIdentity();
  const isSimulatedLoading = useSimulatedLoad();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const isLoading = demoMode ? isSimulatedLoading : isFetching;
  const [unblockedIds, setUnblockedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleUnblock(entry: IdentityBlockDTO) {
    const name = entry.identity.displayName || t("messages:mailbox.untitled");
    setPendingId(entry.id);
    // Optimistic; revert on failure so we never imply an unblock that didn't happen.
    setUnblockedIds((previous) => new Set(previous).add(entry.id));
    unblockIdentity.mutate(entry.identity.id, {
      onSuccess: () => {
        showToast(t("messages:mailbox.blocked.unblocked", { name }), "success");
      },
      onError: () => {
        // The mutation's own `silentError` meta keeps the global handler's
        // toast quiet (and it already logs); this is the one toast shown.
        setUnblockedIds((previous) => {
          const next = new Set(previous);
          next.delete(entry.id);
          return next;
        });
        showToast(t("messages:mailbox.block.error"), "error");
      },
      onSettled: () => setPendingId(null),
    });
  }

  const visibleEntries = identityBlocks.filter(
    (entry) => !unblockedIds.has(entry.id),
  );

  return (
    <Section label={t("messages:mailbox.blocked.title")}>
      <p className={styles.sectionNote}>
        {t("messages:mailbox.blocked.description")}
      </p>
      <div className={styles.list}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <BlockedIdentitySkeleton key={index} />
          ))
        ) : hasFailed ? (
          <LoadErrorState
            compact
            onRetry={refetch}
            title={t("messages:mailbox.blocked.loadErrorTitle")}
            description={t("messages:mailbox.blocked.loadErrorBody")}
          />
        ) : visibleEntries.length === 0 ? (
          <EmptyState
            compact
            icon={<FiUserX />}
            title={t("messages:mailbox.blocked.empty")}
          />
        ) : (
          visibleEntries.map((entry, index) => (
            <FadeIn key={entry.id} delay={Math.min(index, 8) * 60}>
              <BlockedIdentityRow
                entry={entry}
                isActing={pendingId === entry.id}
                onUnblock={() => handleUnblock(entry)}
              />
            </FadeIn>
          ))
        )}
      </div>
    </Section>
  );
}
