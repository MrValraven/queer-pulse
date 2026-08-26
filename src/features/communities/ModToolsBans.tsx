import { useState } from "react";
import { FiAlertTriangle, FiSlash } from "react-icons/fi";
import {
  ConfirmDialog,
  EmptyState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { BanRow } from "./ModToolsBanRow";
import { CommunityRuleBanEditor } from "./CommunityRuleBanEditor";
import type { CommunityBanDTO } from "./api/communityBans.api";
import { useCommunityBans, useLiftCommunityBan } from "./api/useCommunityBans";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * Who is currently barred from this community, and the one control that
 * reverses it.
 *
 * A ban is otherwise invisible after the moment it is applied: nothing in mod
 * tools said who was barred, by whom, when or why, so the decision could not
 * be reviewed by the people responsible for it. Every row carries all four,
 * because "should this still stand" is unanswerable without them, plus the
 * term of the bar and the house rule it rests on.
 *
 * Two controls per row. Lifting sits behind a confirm, because it reverses
 * another moderator's decision. Editing opens the terms: an end date on a
 * permanent bar, a shorter or longer one, a rewritten reason, a rule citation.
 * Every ban written before timed bans existed is permanent, and that dialog is
 * how one of them stops being a life sentence.
 */
export function ModToolsBans({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { bans, rules, isLoading, isError, refetch } = useCommunityBans(slug);
  const liftBan = useLiftCommunityBan(slug);
  const [confirming, setConfirming] = useState<{
    memberSlug: string;
    name: string;
  } | null>(null);
  const [editing, setEditing] = useState<{
    ban: CommunityBanDTO;
    name: string;
  } | null>(null);

  const confirmLift = () => {
    if (!confirming) return;
    const { memberSlug, name } = confirming;
    liftBan.mutate(
      { memberSlug },
      {
        onSuccess: () => {
          setConfirming(null);
          showToast(
            t("communities:detail.modtools.bans.liftedToast", { name }),
            "success",
          );
        },
        onError: () =>
          showToast(t("communities:detail.modtools.bans.errorToast"), "error"),
      },
    );
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.bans.label")}
      </div>
      <p className={styles.intro}>
        {t("communities:detail.modtools.bans.intro")}
      </p>

      {isLoading ? (
        <div aria-busy="true">
          <SkeletonLine height={14} style={{ marginBottom: 10 }} />
          <SkeletonLine height={14} width="70%" />
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={<FiAlertTriangle />}
          title={t("communities:detail.modtools.queueError.title")}
          description={t("communities:detail.modtools.queueError.description")}
          action={{
            label: t("communities:detail.modtools.queueError.retry"),
            onClick: refetch,
          }}
        />
      ) : bans.length === 0 ? (
        <EmptyState
          compact
          icon={<FiSlash />}
          title={t("communities:detail.modtools.bans.empty.title")}
          description={t("communities:detail.modtools.bans.empty.description")}
        />
      ) : (
        <div className={styles.rows}>
          {bans.map((ban) => (
            <BanRow
              key={ban.id}
              ban={ban}
              onLift={(memberSlug, name) => setConfirming({ memberSlug, name })}
              onEdit={(edited, name) => setEditing({ ban: edited, name })}
              formatDate={(iso) => fmt.date(new Date(iso))}
            />
          ))}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          open
          loading={liftBan.isPending}
          title={t("communities:detail.modtools.bans.confirm.title", {
            name: confirming.name,
          })}
          description={t("communities:detail.modtools.bans.confirm.body", {
            name: confirming.name,
          })}
          confirmLabel={t(
            "communities:detail.modtools.bans.confirm.confirmCta",
          )}
          onClose={() => setConfirming(null)}
          onConfirm={confirmLift}
        />
      )}

      {editing && (
        <CommunityRuleBanEditor
          slug={slug}
          ban={editing.ban}
          memberName={editing.name}
          rules={rules}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
