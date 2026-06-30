import { Link } from "react-router-dom";
import { Avatar, Button } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import { memberProfiles } from "../members/data/memberProfiles";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Tint } from "./communityDetails";
import { AV_CLASS } from "./communityAvatar";
import styles from "./CommunityDetailPage.module.css";

const GATHERING = routes.gathering;

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
  const { openConnect } = useConnect();
  const org = detail.organiser;
  const orgMember = org.slug ? memberProfiles[org.slug] : undefined;
  const orgAvatar = (
    <Avatar
      initials={org.initials}
      tint={org.tint}
      src={orgMember?.photo}
      size={48}
      alt={org.name}
    />
  );
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Organiser</div>
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
          {org.slug ? (
            <Link to={`/members/${org.slug}`} style={{ color: "inherit" }}>
              {org.name}
            </Link>
          ) : (
            org.name
          )}
        </div>
        <div className={styles.sbBadge}>{org.role}</div>
        <p className={styles.sbOrgBio}>{detail.organiser.bio}</p>
        <Button
          variant="ghost"
          className={styles.sbFull}
          onClick={() => openConnect(org.slug)}
        >
          Send a message
        </Button>
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Next gathering</div>
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
        <Button
          variant="primary"
          to={GATHERING}
          className={styles.sbFull}
          style={{ marginTop: 14 }}
        >
          RSVP →
        </Button>
      </div>

      <div className={styles.sbC}>
        <div className={styles.sbLbl}>Related communities</div>
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
    </aside>
  );
}
