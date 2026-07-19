import { Link, useParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Avatar, Button, Tag } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberProfiles } from "../members/data/memberProfiles";
import { JoinVouchCallout } from "./JoinVouchCallout";
import {
  gatheringDetails,
  gatheringKind,
  gatheringPath,
  resolveGathering,
  spotsText,
} from "./data";
import { useEvent } from "./api/useEvent";

import styles from "./GatheringPage.module.css";

export function GatheringPage() {
  const { slug: param } = useParams();
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data } = useEvent(param);
  const gathering = data?.gathering ?? resolveGathering(param);
  const kind = gatheringKind(gathering);
  const host = gathering.hostSlug ? memberProfiles[gathering.hostSlug] : null;
  const spotsCount = gathering.spots.values?.count;
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
              {t("gatherings:common.backToGatherings")}
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
                  {t(
                    kind === "event"
                      ? "gatherings:gathering.badge.event"
                      : "gatherings:gathering.badge.gathering",
                  )}
                </Tag>
              </div>
              <h1 className={styles.title}>{gathering.title}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {fmt.date(gathering.date, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.hood}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {t("gatherings:common.hostedBy")} {gathering.host}
                </span>
              </div>
              <p className={styles.body}>{gathering.body}</p>
              <div className={styles.cta}>
                <Button
                  size="lg"
                  onClick={() => openConnect(gathering.hostSlug)}
                >
                  {t(gathering.ctaKey)} →
                </Button>
                <Button size="lg" variant="ghost" to={routes.calendar}>
                  {t("gatherings:gathering.seeAllCta")}
                </Button>
              </div>

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.dateDisplay}>
                <div className={styles.dd}>
                  {fmt.date(gathering.date, { day: "2-digit" })}
                </div>
                <div className={styles.dm}>
                  {fmt.date(gathering.date, {
                    month: "short",
                    year: "numeric",
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
                  <div
                    className={styles.hostName}
                    style={{ color: "var(--ink-60)" }}
                  >
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
                    {t("gatherings:common.hostedBy")}{" "}
                    {gathering.host || "QueerPulse"}
                  </div>
                </div>
              )}

              <Button
                className={styles.fullBtn}
                onClick={() => openConnect(gathering.hostSlug)}
              >
                {t(gathering.ctaKey)}
              </Button>

              <div className={styles.locReveal}>
                <div className={styles.locHead}>
                  <span className={styles.locIcon} aria-hidden>
                    <FiLock />
                  </span>
                  <div>
                    <div className={styles.locHood}>{gathering.hood}</div>
                    <div className={styles.locNote}>
                      {t("gatherings:gathering.locationNote")}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.other}>
            <h2>
              <Translation
                i18nKey="gatherings:gathering.moreTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.cards}>
              {others.map((other) => (
                <Link
                  key={other.slug}
                  to={gatheringPath(other.slug)}
                  className={styles.card}
                >
                  <div className={styles.dateMini}>
                    <div className={styles.gd}>
                      {fmt.date(other.date, { day: "2-digit" })}
                    </div>
                    <div className={styles.gm}>
                      {fmt.date(other.date, { month: "short" })}
                    </div>
                  </div>
                  <div>
                    <div className={styles.cardType}>{other.type}</div>
                    <h3 className={styles.cardTitle}>{other.title}</h3>
                    <div className={styles.cardHood}>
                      {other.hood} · {spotsText(other.spots, t, fmt)}
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
