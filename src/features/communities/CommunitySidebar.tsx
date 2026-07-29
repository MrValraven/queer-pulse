import { Link } from "react-router-dom";
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
}: {
  detail: CommunityDetail;
  related: Community[];
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { openConnect } = useConnect();
  const org = detail.organiser;
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
        <Button
          variant="ghost"
          className={styles.sbFull}
          onClick={() => openConnect(org.slug)}
        >
          {t("communities:detail.sidebar.messageCta")}
        </Button>
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>
          {t("communities:detail.sidebar.nextGathering")}
        </div>
        <div className={styles.sbEvDate}>
          <div className={styles.sbEDd}>{detail.nextEvent.dd}</div>
          <div className={styles.sbEDm}>{detail.nextEvent.mm}</div>
        </div>
        <div className={styles.sbETitle}>{detail.nextEvent.title}</div>
        <div className={styles.sbEMeta}>{detail.nextEvent.meta}</div>
        <div className={styles.sbESpots}>
          <span className={styles.sbESdot} />
          {detail.nextEvent.spots}
        </div>
        {!detail.nextEvent.tba && (
          <Button
            variant="primary"
            to={
              detail.nextEvent.slug
                ? gatheringPath(detail.nextEvent.slug)
                : GATHERING
            }
            className={styles.sbFull}
            style={{ marginTop: 14 }}
          >
            {t("communities:detail.sidebar.rsvpCta")} →
          </Button>
        )}
      </div>

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
              className={[styles.sbRelIc, AV_CLASS[relTint(c.type)]].join(" ")}
            >
              {c.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
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
