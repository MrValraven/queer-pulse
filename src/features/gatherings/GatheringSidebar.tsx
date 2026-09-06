import { Link } from "react-router-dom";
import { FiLock, FiVideo } from "react-icons/fi";
import { Avatar, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { initialsFromParts } from "../../shared/lib/initials";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberProfiles } from "../members/data/memberProfiles";
import { GatheringRsvpControl } from "./GatheringRsvpControl";
import type { GatheringRsvpState } from "./useGatheringRsvp";
import { eventZoneFormat } from "./eventTimezone";
import { spotsText, type GatheringDetail } from "./data";
import styles from "./GatheringPage.module.css";

/** The contact affordance returned by `useMemberContact` (connect vs. message). */
type ContactAction = (
  member: { slug: string; name: string },
  reason?: string,
) => void;

/** The host fields the sidebar avatar block renders, normalized across modes. */
interface HostView {
  slug: string;
  first: string;
  last: string;
  initials: string;
  tint: AvatarTint;
  photo?: string;
  role: string;
}

/**
 * Resolve the host avatar block. Demo reads the mock `memberProfiles` registry
 * (keyed by the mock `hostSlug`); live builds the view purely from the DTO host
 * fields carried on `GatheringDetail` — so a real event never accidentally
 * borrows a demo persona whose slug happens to collide with the registry.
 */
function resolveHost(
  gathering: GatheringDetail,
  demoMode: boolean,
): HostView | null {
  if (demoMode) {
    const member = gathering.hostSlug
      ? memberProfiles[gathering.hostSlug]
      : undefined;
    if (!member) return null;
    return {
      slug: member.slug,
      first: member.first,
      last: member.last,
      initials: member.initials,
      tint: member.tint,
      photo: member.photo,
      role: member.role,
    };
  }
  if (!gathering.hostSlug || (!gathering.hostFirst && !gathering.hostLast)) {
    return null;
  }
  return {
    slug: gathering.hostSlug,
    first: gathering.hostFirst ?? "",
    last: gathering.hostLast ?? "",
    initials: initialsFromParts(
      gathering.hostFirst ?? "",
      gathering.hostLast ?? "",
    ),
    tint: "plum",
    photo: gathering.hostAvatarUrl ?? undefined,
    role: "",
  };
}

export function GatheringSidebar({
  gathering,
  connected,
  contact,
  rsvp,
}: {
  gathering: GatheringDetail;
  connected: boolean;
  contact: ContactAction;
  /** The page's single RSVP state machine, shared with the hero's button so
   *  the two can never disagree — see `GatheringDetailBody`. */
  rsvp: GatheringRsvpState;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const host = resolveHost(gathering, demoMode);
  const spotsCount = gathering.spots.values?.count;
  // The calendar day the gathering falls on in ITS zone — a late-evening
  // gathering abroad can otherwise show tomorrow's date to the reader.
  const zone = eventZoneFormat(gathering.timezone, gathering.date);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.dateDisplay}>
        <div className={styles.dd}>
          {fmt.date(gathering.date, { day: "2-digit", ...zone.dateOptions })}
        </div>
        <div className={styles.dm}>
          {fmt.date(gathering.date, {
            month: "short",
            year: "numeric",
            ...zone.dateOptions,
          })}
        </div>
      </div>

      {spotsCount !== undefined ? (
        <div className={styles.spotsRow}>
          <div className={styles.spotsNum}>{spotsCount}</div>
          <div className={styles.spotsLbl}>
            {t("gatherings:gathering.spotsRemainingLabel")}
            <br />
            <span>{t("gatherings:gathering.spotsUrgencyNote")}</span>
          </div>
        </div>
      ) : (
        <div className={styles.spotsRow}>
          <div className={styles.hostName} style={{ color: "var(--ink-60)" }}>
            {spotsText(gathering.spots, t, fmt)}
          </div>
        </div>
      )}

      <div className={styles.sh}>{t("gatherings:common.hostedBy")}</div>
      {host ? (
        <div className={styles.hostRow}>
          <Avatar
            initials={host.initials}
            tint={host.tint}
            size={44}
            src={host.photo}
            alt={`${host.first} ${host.last}`}
          />
          <div>
            <div className={styles.hostName}>
              <span className={styles.nameRow}>
                <Link
                  to={`/members/${host.slug}`}
                  style={{ color: "var(--ink)" }}
                >
                  {host.first} {host.last}
                </Link>
                <MemberStaffBadge slug={host.slug} />
              </span>
            </div>
            <div className={styles.hostRole}>
              {host.role.split("·")[0]!.trim()}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.hostRow}>
          <div className={styles.hostName}>
            {t("gatherings:common.hostedBy")} {gathering.host || "QueerPulse"}
          </div>
        </div>
      )}

      <GatheringRsvpControl
        gathering={gathering}
        connected={connected}
        contact={contact}
        rsvp={rsvp}
      />

      {/* An online gathering has no door to reveal, so it says what it
          actually withholds: the join link, on the same gate (PRD-182). This
          row used to promise every reader "the exact location is shared once
          you RSVP" even when there was no location to share. */}
      <div className={styles.locReveal}>
        <div className={styles.locHead}>
          <span className={styles.locIcon} aria-hidden>
            {gathering.isOnline ? <FiVideo /> : <FiLock />}
          </span>
          <div>
            <div className={styles.locHood}>{gathering.hood}</div>
            <div className={styles.locNote}>
              {t(
                gathering.isOnline
                  ? "gatherings:gathering.joinLinkNote"
                  : "gatherings:gathering.locationNote",
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
