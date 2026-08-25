import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import { SideReadinessRing } from "./SideReadinessRing";
import { SideStatusPill } from "./SideStatusPill";
import { SideCardFooter } from "./SideCardFooter";
import { LINK_BADGE } from "./mySubprofiles.data";
import {
  accentTintStyle,
  AVAILABILITY_OPTIONS,
  AVAILABILITY_PILL_TONE,
  DEFAULT_ACCENT,
} from "./subprofilePresence.data";
import type { SubprofileView } from "./api/subprofiles.adapters";

interface SideCardProps {
  view: SubprofileView;
  /** Opens the persona's own page. */
  onOpen: () => void;
  /** Opens the persona in the editor. */
  onEdit: () => void;
  /** Requests the share affordance (caller owns the actual copy-link/QR flow). */
  onShare: () => void;
  /** Requests the delete-confirm flow (caller owns the confirm modal). */
  onDelete: () => void;
}

/**
 * One persona on the owner dashboard: `.side` (global class, ported in
 * `persona-dashboard.css`) > accent-header `.side-top` (draft → hatch via
 * `.side-draft`) with a corner readiness ring (draft) or status pill
 * (published) > `.side-body` (cut-out avatar, name, tagline, tie/avail pills,
 * a state-dependent meta line) > `SideCardFooter`'s `.side-acts`.
 *
 * A pure consumer of the owner `SubprofileView` — no data fetching, no
 * demo/live branching of its own; every action is a caller-supplied callback
 * (dual-mode + the actual share/delete flows live in the dashboard page,
 * Task 6, mirroring how `MySubprofilesPage` wires it today).
 */
export function SideCard({
  view,
  onOpen,
  onEdit,
  onShare,
  onDelete,
}: SideCardProps) {
  const { t } = useTranslation();
  const accent = view.accent ?? DEFAULT_ACCENT;
  const isDraft = view.status === "draft";
  const { readyCount, totalCount } = estimateDraftReadiness(view);
  const tie = LINK_BADGE[view.linkVisibility];
  const availability = view.availability
    ? AVAILABILITY_OPTIONS.find((option) => option.value === view.availability)
    : undefined;

  return (
    <article className={isDraft ? "side side-draft" : "side"}>
      <div className="side-top" style={accentTintStyle(accent)}>
        {isDraft ? (
          <SideReadinessRing readyCount={readyCount} totalCount={totalCount} />
        ) : (
          <SideStatusPill status={view.status} />
        )}
      </div>

      <div className="side-body">
        <div className="side-av">
          <Avatar
            initials={initialsFromName(view.displayName, "?")}
            src={view.avatarUrl ?? undefined}
            tint="plum"
            size={58}
          />
        </div>

        <h3 className="side-name">
          {view.displayName || t("subprofiles:mine.untitled")}
        </h3>
        <p className="side-tag">
          {view.tagline || t("subprofiles:side.noTagline")}
        </p>

        <div className="side-pills">
          <span className="pill">{t(tie.labelKey)}</span>
          {availability && (
            <span
              className={`pill ${AVAILABILITY_PILL_TONE[availability.value]}`}
            >
              {t(availability.labelKey)}
            </span>
          )}
        </div>

        <div className="side-meta">
          {isDraft ? (
            <span>
              {readyCount >= totalCount
                ? t("subprofiles:side.readyToPublish")
                : t("subprofiles:side.thingsLeft", {
                    count: totalCount - readyCount,
                  })}
            </span>
          ) : (
            <>
              <span>
                {t("subprofiles:mine.endorsementCount", {
                  count: view.endorsementCount,
                })}
              </span>
              <span>
                {t("subprofiles:mine.followerCount", {
                  count: view.followerCount,
                })}
              </span>
              {view.memberCount > 1 && (
                <span>
                  {t("subprofiles:side.coOwners", { count: view.memberCount })}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <SideCardFooter
        onOpen={onOpen}
        onEdit={onEdit}
        onShare={onShare}
        onDelete={onDelete}
      />
    </article>
  );
}
