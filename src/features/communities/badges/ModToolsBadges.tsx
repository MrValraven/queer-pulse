import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiAward, FiPlus } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityRole } from "../membership.types";
import type { CommunityBadgeAdminDTO } from "./api/communityBadges.api";
import { useCommunityBadgeAdmin } from "./api/useCommunityBadges";
import {
  useDeleteCommunityBadge,
  useUpdateCommunityBadge,
} from "./api/useCommunityBadgeMutations";
import { canManageCommunityBadges } from "./communityBadgeAccess";
import { communityBadgeDisplayName } from "./communityBadgeDisplayName";
import { communityBadgeErrorText } from "./communityBadgeErrors";
import {
  CommunityBadgeFormDialog,
  type CommunityBadgeFormMode,
} from "./CommunityBadgeFormDialog";
import { ModToolsBadgeRow } from "./ModToolsBadgeRow";
import styles from "./ModToolsBadges.module.css";

/**
 * The Badges pane of Mod tools: every badge the community has, switched off
 * ones included, with how many members hold each. Owner-level staff create,
 * edit, switch on and off and delete; moderators read the same list
 * (`canManageCommunityBadges` and the server's `canManage` both have to agree).
 * The community name is part of the pane's contract for the rail; the copy
 * here needs none of it.
 */
export function ModToolsBadges({
  slug,
  viewerRole,
}: {
  slug: string;
  communityName: string;
  viewerRole: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const adminQuery = useCommunityBadgeAdmin(slug);
  const updateBadge = useUpdateCommunityBadge(slug);
  const [formMode, setFormMode] = useState<CommunityBadgeFormMode | null>(null);
  const [deleting, setDeleting] = useState<CommunityBadgeAdminDTO | null>(null);

  const response = adminQuery.data;
  const canManage =
    canManageCommunityBadges(viewerRole, demoMode) &&
    response?.canManage === true;
  const badges = response?.badges ?? [];
  const limit = response?.limit ?? 0;
  const isAtLimit = response !== undefined && badges.length >= limit;

  const toggle = (badge: CommunityBadgeAdminDTO, isEnabled: boolean) => {
    updateBadge.mutate(
      { badgeId: badge.id, body: { isEnabled } },
      {
        onSuccess: (updated) =>
          showToast(
            t(
              updated.isEnabled
                ? "communities:badges.manage.switchedOnToast"
                : "communities:badges.manage.switchedOffToast",
              { badge: communityBadgeDisplayName(updated, t) },
            ),
            "success",
          ),
        onError: (error) =>
          showToast(communityBadgeErrorText(error, t, fmt), "error"),
      },
    );
  };

  return (
    <section className={styles.pane}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.title}>
            {t("communities:badges.manage.title")}
          </h2>
          <p className={styles.lead}>{t("communities:badges.manage.lead")}</p>
          <Collapse isOpen={response !== undefined}>
            <p className={styles.count}>
              {t("communities:badges.manage.count", {
                count: badges.length,
                limit,
              })}
            </p>
          </Collapse>
        </div>
        {canManage && (
          <FadeIn className={styles.createSlot}>
            <Button
              size="sm"
              disabled={isAtLimit}
              onClick={() => setFormMode({ kind: "create" })}
            >
              <FiPlus aria-hidden />
              {t("communities:badges.manage.create")}
            </Button>
          </FadeIn>
        )}
      </div>
      <Collapse isOpen={canManage && isAtLimit}>
        <p className={styles.limitNote}>
          {t("communities:badges.manage.limitReached", { limit })}
        </p>
      </Collapse>
      <Collapse isOpen={response !== undefined && !canManage}>
        <p className={styles.readOnly}>
          {t("communities:badges.manage.readOnly")}
        </p>
      </Collapse>

      {adminQuery.isPending ? (
        <div className={styles.skeleton} aria-busy="true">
          <SkeletonLine height={64} />
          <SkeletonLine height={64} />
          <SkeletonLine height={64} />
        </div>
      ) : adminQuery.isError ? (
        <FadeIn>
          <LoadErrorState
            compact
            headingLevel={3}
            description={communityBadgeErrorText(adminQuery.error, t, fmt)}
            onRetry={() => void adminQuery.refetch()}
            isRetrying={adminQuery.isRefetching}
          />
        </FadeIn>
      ) : (
        <FadeIn as="ul" className={styles.list}>
          <AnimatePresence initial={false}>
            {badges.map((badge) => (
              <CollapseListItem key={badge.id}>
                <ModToolsBadgeRow
                  badge={badge}
                  canManage={canManage}
                  isTogglePending={updateBadge.isPending}
                  onToggleEnabled={(isEnabled) => toggle(badge, isEnabled)}
                  onEdit={() => setFormMode({ kind: "edit", badge })}
                  onDelete={() => setDeleting(badge)}
                />
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </FadeIn>
      )}
      <Collapse isOpen={response !== undefined && badges.length === 0}>
        <EmptyState
          compact
          icon={<FiAward />}
          title={t("communities:badges.manage.empty")}
        />
      </Collapse>

      <AnimatePresence>
        {formMode && (
          <CommunityBadgeFormDialog
            key={formMode.kind === "edit" ? formMode.badge.id : "create"}
            slug={slug}
            mode={formMode}
            onClose={() => setFormMode(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleting && (
          <ModToolsBadgeDeleteDialog
            key={deleting.id}
            slug={slug}
            badge={deleting}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/**
 * The delete confirm: it names how many members lose the badge, and the toast
 * after it names how many did. Mount it inside `<AnimatePresence>`.
 */
function ModToolsBadgeDeleteDialog({
  slug,
  badge,
  onClose,
}: {
  slug: string;
  badge: CommunityBadgeAdminDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const deleteBadge = useDeleteCommunityBadge(slug);
  const badgeName = communityBadgeDisplayName(badge, t);

  const confirmDelete = () => {
    deleteBadge.mutate(
      { badgeId: badge.id },
      {
        onSuccess: (result) => {
          onClose();
          showToast(
            result.holderCount === 0
              ? t("communities:badges.delete.doneToastNone", {
                  badge: badgeName,
                })
              : t("communities:badges.delete.doneToast", {
                  badge: badgeName,
                  count: result.holderCount,
                }),
            "success",
          );
        },
        onError: (error) =>
          showToast(communityBadgeErrorText(error, t, fmt), "error"),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={deleteBadge.isPending}
      title={t("communities:badges.delete.title", { badge: badgeName })}
      description={
        badge.holderCount === 0
          ? t("communities:badges.delete.bodyNone")
          : t("communities:badges.delete.body", { count: badge.holderCount })
      }
      confirmLabel={t("communities:badges.delete.confirm")}
      cancelLabel={t("communities:badges.delete.cancel")}
      onClose={onClose}
      onConfirm={confirmDelete}
    />
  );
}
