import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnect } from "../../app/providers/useConnect";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Tint } from "./communityDetails";
import { photoOf } from "./communityPeople";
import { AV_CLASS } from "./communityAvatar";
import { leadingInitials } from "../../shared/lib/initials";
import type { CommunityPulseResult } from "./api/useCommunityPulse";
import { CommunityPulseSidebarCards } from "./CommunityPulseSidebarCards";
import styles from "./CommunityDetailPage.module.css";

const GATHERING = routes.gatherings;

const relTint = (t: string): Tint =>
  t === "sports" || t === "social" || t === "support"
    ? "jade"
    : t === "arts" || t === "professional"
      ? "coral"
      : "plum";

export function CommunitySidebar({
  detail,
  related,
  communityPulse,
}: {
  detail: CommunityDetail;
  related: Community[];
  /** Recent discussion threads + open volunteer opportunities filed to this
   *  community — renders as two compact cards below "Next gathering" (own
   *  loading/error/empty handling; see `CommunityPulseSidebarCards`). */
  communityPulse: CommunityPulseResult;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { openConnect } = useConnect();
  const org = detail.organiser;
  // `detail.nextEvent` is a placeholder the detail adapter always fills with
  // "to be announced", because GET /communities/:slug carries no events. The
  // real upcoming gatherings arrive on the pulse query, so when one exists it
  // is the card, RSVP button and all. Demo mode keeps the mock nextEvent
  // (`communityPulse` is deliberately empty there).
  const upcoming = communityPulse.events[0];
  const nextEvent = upcoming
    ? {
        dd: upcoming.dd,
        mm: upcoming.mm,
        title: upcoming.title,
        meta: upcoming.meta,
        spots: upcoming.spots,
        slug: upcoming.slug,
        tba: false,
      }
    : detail.nextEvent;
  const orgAvatar = (
    <Avatar
      initials={org.initials}
      tint={org.tint}
      src={photoOf(org, demoMode)}
      size={48}
      alt={org.name}
    />
  );
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbC}>
        <div className={styles.sbLbl}>
          {t("communities:detail.sidebar.organiser")}
        </div>
        <div className={styles.sbOrgAv}>
          {org.slug ? (
            <Link to={`/members/${org.slug}`} title={org.name}>
              {orgAvatar}
            </Link>
          ) : (
            orgAvatar
          )}
        </div>
        <div className={styles.sbOrgName}>
          <span className={styles.nameRow}>
            {org.slug ? (
              <Link to={`/members/${org.slug}`} style={{ color: "inherit" }}>
                {org.name}
              </Link>
            ) : (
              org.name
            )}
            <MemberStaffBadge slug={org.slug} />
          </span>
        </div>
        <div className={styles.sbBadge}>{org.role}</div>
        <p className={styles.sbOrgBio}>{detail.organiser.bio}</p>
        {/* Only when the organiser resolves to a real member. The avatar and
            name links above already guard on this; without the same guard here
            the Message button opened a Connect modal with no recipient. */}
        {org.slug && (
          <Button
            variant="ghost"
            className={styles.sbFull}
            onClick={() => openConnect(org.slug!)}
          >
            {t("communities:detail.sidebar.messageCta")}
          </Button>
        )}
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>
          {t("communities:detail.sidebar.nextGathering")}
        </div>
        <div className={styles.sbEvDate}>
          <div className={styles.sbEDd}>{nextEvent.dd}</div>
          <div className={styles.sbEDm}>{nextEvent.mm}</div>
        </div>
        <div className={styles.sbETitle}>{nextEvent.title}</div>
        <div className={styles.sbEMeta}>{nextEvent.meta}</div>
        {nextEvent.spots && (
          <div className={styles.sbESpots}>
            <span className={styles.sbESdot} />
            {nextEvent.spots}
          </div>
        )}
        {!nextEvent.tba && (
          <Button
            variant="primary"
            to={nextEvent.slug ? gatheringPath(nextEvent.slug) : GATHERING}
            className={styles.sbFull}
            style={{ marginTop: 14 }}
          >
            {t("communities:detail.sidebar.rsvpCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>

      <CommunityPulseSidebarCards pulse={communityPulse} />

      {related.length > 0 && (
        <div className={styles.sbC}>
          <div className={styles.sbLbl}>
            {t("communities:detail.sidebar.relatedCommunities")}
          </div>
          {related.map((c) => (
            <Link
              key={c.slug}
              to={`/community/${c.slug}`}
              className={styles.sbRelItem}
            >
              <div
                className={[styles.sbRelIc, AV_CLASS[relTint(c.type)]].join(
                  " ",
                )}
              >
                {leadingInitials(c.name)}
              </div>
              <div>
                <div className={styles.sbRelName}>{c.name}</div>
                <div className={styles.sbRelCt}>{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
