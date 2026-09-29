import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useUnfreezeCommunity } from "./api/useCommunityMutations";
import { useCommunityFreezeDetail } from "./api/useCommunityFreezeDetail";
import { frozenBodyKeyFor, frozenTitleKeyFor } from "./communityFrozenCopy";
import styles from "./CommunityFrozenBanner.module.css";

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
  /** Set when this community is a space (subcommunity): its parent's name.
   *  It titles the banner as the space's pause, and fills
   *  `spaces.paused.parent`'s "{name}" when the pause is `parent_frozen`.
   *  Without it, a `parent_frozen` pause falls back to the honest "unknown"
   *  wording, which needs no name. */
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
  // A `parent_frozen` pause with no parent name falls back to the generic
  // line, which needs no "{name}".
  const bodyKey = frozenBodyKeyFor(
    freezeDetail.frozenReason,
    Boolean(parentName),
  );
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
          {t(frozenTitleKeyFor(Boolean(parentName)))}
        </div>
        <p className={styles.body}>{t(bodyKey, { name: parentName })}</p>
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
