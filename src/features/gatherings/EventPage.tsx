import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { FiLock } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { spotsText } from "./data";
import {
  DETAILS,
  EVENT_ABOUT_ACCESSIBILITY_TEXT,
  EVENT_ABOUT_P1,
  EVENT_ABOUT_P2,
  EVENT_DATE,
  EVENT_HERO_ALT,
  EVENT_HOOD_LABEL,
  EVENT_HOST_NAME,
  EVENT_PILL_LOCATION,
  EVENT_PRICE_MAX,
  EVENT_PRICE_MIN,
  EVENT_SPOTS,
  EVENT_TITLE_EM,
  EVENT_TITLE_LINE,
  EVENT_TYPE_LABEL,
  HERO_IMAGE,
} from "./eventPage.data";
import { EventRsvpCard } from "./EventRsvpCard";
import { JoinVouchCallout } from "./JoinVouchCallout";
import styles from "./EventPage.module.css";

export function EventPage() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Link to={routes.calendar} className={styles.back}>
            {t("gatherings:common.backToGatherings")}
          </Link>
          <div className={styles.type}>{EVENT_TYPE_LABEL}</div>
          <h1 className={styles.title}>
            {EVENT_TITLE_LINE}
            <br />
            <em>{EVENT_TITLE_EM}</em>
          </h1>
          <div className={styles.hostRow}>
            <Avatar initials="MC" tint="coral" size={34} />
            <div className={styles.by}>
              {t("gatherings:common.hostedBy")} <strong>{EVENT_HOST_NAME}</strong> ·{" "}
              <Link
                to={routes.members}
                style={{
                  color: "rgba(247,243,238,.58)",
                  textDecoration: "underline",
                }}
              >
                {t("gatherings:event.hero.viewProfileCta")}
              </Link>
            </div>
          </div>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillHighlight}`}>
              {fmt.date(EVENT_DATE, {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}{" "}
              · {fmt.time(EVENT_DATE)}
            </span>
            <span className={styles.pill}>{EVENT_PILL_LOCATION}</span>
            <span className={styles.pill}>
              {t("gatherings:event.pills.slidingScale", {
                min: EVENT_PRICE_MIN,
                max: EVENT_PRICE_MAX,
              })}
            </span>
            <span className={styles.pill}>
              {spotsText(EVENT_SPOTS, t, fmt)}
            </span>
          </div>
        </div>
        <ImageSlot
          tint="plum"
          src={HERO_IMAGE}
          height={320}
          radius={0}
          placeholder={EVENT_HERO_ALT}
          className={styles.imgStrip}
        />
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  {t("gatherings:event.about.title")}
                </div>
                <div className={styles.text}>
                  <p>{EVENT_ABOUT_P1}</p>
                  <p>{EVENT_ABOUT_P2}</p>
                  <p>
                    <strong>{t("gatherings:event.about.accessibilityLabel")}:</strong>{" "}
                    {EVENT_ABOUT_ACCESSIBILITY_TEXT}
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  {t("gatherings:event.details.title")}
                </div>
                <div className={styles.details}>
                  {DETAILS.map((detail) => (
                    <div key={detail.labelKey} className={styles.detail}>
                      <div className={styles.detailIcon}>
                        <detail.icon />
                      </div>
                      <div>
                        <div className={styles.detailLabel}>
                          {t(detail.labelKey)}
                        </div>
                        <div className={styles.detailValue}>{detail.value}</div>
                        <div className={styles.detailSub}>{detail.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.locReveal}>
                  <span className={styles.locIcon} aria-hidden>
                    <FiLock />
                  </span>
                  <div>
                    <div className={styles.locRevealHood}>{EVENT_HOOD_LABEL}</div>
                    <div className={styles.locRevealNote}>
                      {t("gatherings:event.details.locationNote")}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  {t("gatherings:event.guidelines.title")}
                </div>
                <div className={styles.text}>
                  <p>{t("gatherings:event.guidelines.body1")}</p>
                  <p>{t("gatherings:event.guidelines.body2")}</p>
                </div>
              </div>
            </div>

            <div className={styles.aside}>
              <EventRsvpCard />

              <div className={styles.membersOnly}>
                <div
                  className="mo-title"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--jade)",
                    marginBottom: 6,
                  }}
                >
                  {t("gatherings:event.membersOnly.title")}
                </div>
                <p>{t("gatherings:event.membersOnly.body")}</p>
              </div>

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
