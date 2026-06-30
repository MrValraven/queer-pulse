import { Link, useParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Avatar, Button, Tag } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import { memberProfiles } from "../members/data/memberProfiles";
import { JoinVouchCallout } from "./JoinVouchCallout";
import {
  gatheringDetails,
  gatheringKind,
  gatheringPath,
  resolveGathering,
} from "./data";

import styles from "./GatheringPage.module.css";

export function GatheringPage() {
  const { slug: param } = useParams();
  const gathering = resolveGathering(param);
  const kind = gatheringKind(gathering);
  const host = gathering.hostSlug ? memberProfiles[gathering.hostSlug] : null;
  const spotsNum = parseInt(gathering.spots, 10);
  const { openConnect } = useConnect();

  const others = Object.values(gatheringDetails).filter(
    (g) => g.slug !== gathering.slug,
  );

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.back}>
            <Link to={routes.calendar} className={styles.backLink}>
              ← Gatherings
            </Link>
          </div>

          <div className={styles.grid}>
            <div>
              <div className={styles.typeRow}>
                <span className={styles.type}>{gathering.type}</span>
                <Tag
                  className={
                    kind === "event" ? styles.badgeEvent : styles.badgeGathering
                  }
                >
                  {kind === "event" ? "QueerPulse event" : "Member gathering"}
                </Tag>
              </div>
              <h1 className={styles.title}>{gathering.title}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.day} {gathering.month} 2026
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.hood}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  Hosted by {gathering.host}
                </span>
              </div>
              <p className={styles.body}>{gathering.body}</p>
              <div className={styles.cta}>
                <Button
                  size="lg"
                  onClick={() => openConnect(gathering.hostSlug)}
                >
                  {gathering.cta} →
                </Button>
                <Button size="lg" variant="ghost" to={routes.calendar}>
                  See all gatherings
                </Button>
              </div>

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.dateDisplay}>
                <div className={styles.dd}>{gathering.day}</div>
                <div className={styles.dm}>{gathering.month} 2026</div>
              </div>

              {Number.isFinite(spotsNum) ? (
                <div className={styles.spotsRow}>
                  <div className={styles.spotsNum}>{spotsNum}</div>
                  <div className={styles.spotsLbl}>
                    spots remaining
                    <br />
                    <span>Move quickly if this speaks to you</span>
                  </div>
                </div>
              ) : (
                <div className={styles.spotsRow}>
                  <div
                    className={styles.hostName}
                    style={{ color: "var(--ink-60)" }}
                  >
                    {gathering.spots}
                  </div>
                </div>
              )}

              <div className={styles.sh}>Hosted by</div>
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
                      <Link
                        to={`/members/${host.slug}`}
                        style={{ color: "var(--ink)" }}
                      >
                        {host.first} {host.last}
                      </Link>
                    </div>
                    <div className={styles.hostRole}>
                      {host.role.split("·")[0]!.trim()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.hostRow}>
                  <div className={styles.hostName}>
                    Hosted by {gathering.host || "QueerPulse"}
                  </div>
                </div>
              )}

              <Button
                className={styles.fullBtn}
                onClick={() => openConnect(gathering.hostSlug)}
              >
                {gathering.cta}
              </Button>

              <div className={styles.locReveal}>
                <div className={styles.locHead}>
                  <span className={styles.locIcon} aria-hidden>
                    <FiLock />
                  </span>
                  <div>
                    <div className={styles.locHood}>{gathering.hood}</div>
                    <div className={styles.locNote}>
                      Full location shared with confirmed guests after you RSVP.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.other}>
            <h2>
              More <em>gatherings</em>
            </h2>
            <div className={styles.cards}>
              {others.map((other) => (
                <Link
                  key={other.slug}
                  to={gatheringPath(other.slug)}
                  className={styles.card}
                >
                  <div className={styles.dateMini}>
                    <div className={styles.gd}>{other.day}</div>
                    <div className={styles.gm}>{other.month}</div>
                  </div>
                  <div>
                    <div className={styles.cardType}>{other.type}</div>
                    <h3 className={styles.cardTitle}>{other.title}</h3>
                    <div className={styles.cardHood}>
                      {other.hood} · {other.spots}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
