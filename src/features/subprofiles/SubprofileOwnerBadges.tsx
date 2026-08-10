import { Badge, VisibilityBadge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STATUS_BADGE } from "./mySubprofiles.data";
import type { SubprofileStatus, Visibility } from "./api/subprofiles.api";

/**
 * Owner-only status + visibility badges, shared by the feature-card hero and
 * the switch-list row so both surfaces render this identically. `undefined`
 * `status`/`visibility` (the public path) renders nothing.
 *
 * In `compact` mode (the switch-list row, which has far less horizontal
 * room than the hero) a `"published"` status renders nothing — the same
 * "exceptional state only" convention `SideCard`/GitHub PR badges
 * use — while the hero (`compact` unset) always shows a present `status`.
 * This is never a color-only signal: the absent case is an absent badge,
 * not a same-color badge with different meaning, and `Badge`/`VisibilityBadge`
 * both carry text whenever they do render.
 */
export function SubprofileOwnerBadges({
  status,
  visibility,
  compact = false,
  className,
}: {
  status?: SubprofileStatus;
  visibility?: Visibility;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  // Resolved to a definite `SubprofileStatus | undefined` (rather than a
  // boolean flag) so the JSX below can index `STATUS_BADGE` without a second,
  // separate non-null assertion on `status`.
  const statusToShow: SubprofileStatus | undefined =
    status && (!compact || status === "draft") ? status : undefined;
  if (!statusToShow && !visibility) return null;

  return (
    <span className={className}>
      {statusToShow && (
        <Badge tone={STATUS_BADGE[statusToShow].tone} dot>
          {t(STATUS_BADGE[statusToShow].labelKey)}
        </Badge>
      )}
      {visibility && <VisibilityBadge mode={visibility} />}
    </span>
  );
}
