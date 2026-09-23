import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useUnfreezeCommunity } from "./api/useCommunityMutations";
import {
  useCommunityFreezeDetail,
  type CommunityFrozenReason,
} from "./api/useCommunityFreezeDetail";
import styles from "./CommunityFrozenBanner.module.css";

type FrozenReasonKey = CommunityFrozenReason | "unknown";

/** One body sentence per reason. A manual pause has no report behind it, so it
 *  must not be narrated as one: telling a community its moderators are
 *  reviewing reports when nobody reported anything is simply untrue. A space
 *  (subcommunity) paused because its parent is paused gets its own sentence,
 *  naming the parent, since the space's own staff has nothing to review here.
 *  The `unknown` line is the honest fallback for a backend that reports the
 *  pause without saying why. */
const BODY_KEY: Record<FrozenReasonKey, string> = {
  manual: "communities:detail.frozen.body.manual",
  emergency_report: "communities:detail.frozen.body.emergencyReport",
  report_pileup: "communities:detail.frozen.body.reportPileup",
  parent_frozen: "communities:spaces.paused.parent",
  unknown: "communities:detail.frozen.body.unknown",
};

/**
 * Shown on a community's hub while it is paused (see the backend
 * `Community.frozenAt`). Explains to everyone why new posts and joins are on
 * hold, in the words that are actually true for THIS pause, and shows when it
 * started plus any public note the moderator left. Owner/mods get the lift
 * action. Optimistically hides itself on a successful lift in both modes: live
 * also refetches the detail unfrozen, demo (static data) relies on this.
 */
export function CommunityFrozenBanner({
  slug,
  canManage,
  parentName,
}: {
  slug: string;
  canManage: boolean;
  /** Set when this community is a space (subcommunity): its parent's name,
   *  needed to fill `spaces.paused.parent`'s "{name}" when the pause is
   *  `parent_frozen`. Without it, a `parent_frozen` pause falls back to the
   *  honest "unknown" wording, which needs no name. */
  parentName?: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const unfreeze = useUnfreezeCommunity();
  const freezeDetail = useCommunityFreezeDetail(slug);
  const [isLifted, setIsLifted] = useState(false);

  if (isLifted) return null;

  const frozenSince = freezeDetail.frozenAt
    ? new Date(freezeDetail.frozenAt)
    : null;
  const isValidDate =
    frozenSince != null && !Number.isNaN(frozenSince.getTime());
  const publicNote = freezeDetail.frozenNote?.trim() ?? "";
  const isParentFrozen =
    freezeDetail.frozenReason === "parent_frozen" && Boolean(parentName);
  const reasonKey: FrozenReasonKey = isParentFrozen
    ? "parent_frozen"
    : (freezeDetail.frozenReason ?? "unknown");
  // A space's own staff cannot lift a pause that belongs to the parent: only
  // the parent's own staff can, from the parent's page.
  const canUnfreeze = canManage && !isParentFrozen;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden>
        <FiAlertTriangle />
      </span>
      <div className={styles.text}>
        <div className={styles.title}>
          {t("communities:detail.frozen.title")}
        </div>
        <p className={styles.body}>
          {isParentFrozen
            ? t(BODY_KEY.parent_frozen, { name: parentName })
            : t(BODY_KEY[reasonKey])}
        </p>
        {isValidDate && (
          <p className={styles.since}>
            {t("communities:detail.frozen.since", {
              date: format.date(frozenSince),
              time: format.time(frozenSince),
            })}
          </p>
        )}
        {publicNote && (
          <blockquote className={styles.note}>
            <p className={styles.noteText}>{publicNote}</p>
            <footer className={styles.noteSource}>
              {t("communities:detail.frozen.noteSource")}
            </footer>
          </blockquote>
        )}
      </div>
      {canUnfreeze && (
        <Button
          variant="ghost"
          size="sm"
          disabled={unfreeze.isPending}
          onClick={() =>
            unfreeze.mutate(
              { slug },
              {
                onSuccess: () => setIsLifted(true),
                onError: () =>
                  showToast(t("communities:detail.frozen.errorToast"), "error"),
              },
            )
          }
        >
          {t("communities:detail.frozen.unfreezeCta")}
        </Button>
      )}
    </div>
  );
}
