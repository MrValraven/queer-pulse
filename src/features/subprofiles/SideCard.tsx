import type { ReactNode } from "react";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import { SideReadinessRing } from "./SideReadinessRing";
import { SideStatusPill } from "./SideStatusPill";
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
  /** The `.side-acts` action row, supplied by `OwnerSideCard`. The actions a
   *  member may take depend on this persona's public address and on whether
   *  they created it, and both answers come from hooks; keeping them out of
   *  this pure presenter keeps the card free of data fetching. */
  footer: ReactNode;
}

/**
 * One persona on the owner dashboard: `.side` (global class, ported in
 * `persona-dashboard.css`) > accent-header `.side-top` (draft → hatch via
 * `.side-draft`) with a corner readiness ring (draft) or status pill
 * (published) > `.side-body` (cut-out avatar, name, tagline, tie/avail pills,
 * a state-dependent meta line) > `SideCardFooter`'s `.side-acts`.
 *
 * A pure consumer of the owner `SubprofileView`: no data fetching and no
 * demo/live branching of its own. The whole action row arrives as `footer`
 * (`SideCardFooter`, assembled by `OwnerSideCard`), which is where the address
 * and creator lookups those actions depend on actually live.
 */
export function SideCard({ view, footer }: SideCardProps) {
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

      {footer}
    </article>
  );
}
