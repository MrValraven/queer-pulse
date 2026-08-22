import { Link } from "react-router-dom";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { Avatar, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { spotsText } from "./data";
import { eventZoneFormat } from "./eventTimezone";
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
import styles from "./EventPage.module.css";

/** The static event's zone-aware date/time options. This prototype gathering
 *  carries no `timezone`, so it formats in the reader's own zone exactly as it
 *  always has; the call keeps the surface consistent with the live ones. */
const EVENT_ZONE = eventZoneFormat(undefined, EVENT_DATE);

/**
 * The plum hero: back link, event title, host row, and the meta pills (when,
 * where, price, spots) over the full-bleed cover strip.
 */
export function EventPageHero() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.hero}>
      <div className="wrap">
        <Link to={routes.calendar} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:common.backToGatherings")}
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
            {t("gatherings:common.hostedBy")} <strong>{EVENT_HOST_NAME}</strong>{" "}
            ·{" "}
            <Link
              to={routes.members}
              style={{
                color: "rgba(var(--cream-rgb), .58)",
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
              ...EVENT_ZONE.dateOptions,
            })}{" "}
            · {fmt.time(EVENT_DATE, EVENT_ZONE.timeOptions)}
          </span>
          <span className={styles.pill}>{EVENT_PILL_LOCATION}</span>
          <span className={styles.pill}>
            {t("gatherings:event.pills.slidingScale", {
              min: EVENT_PRICE_MIN,
              max: EVENT_PRICE_MAX,
            })}
          </span>
          <span className={styles.pill}>{spotsText(EVENT_SPOTS, t, fmt)}</span>
        </div>
      </div>
      <ImageSlot
        tint="plum"
        src={HERO_IMAGE}
        height={320}
        radius={0}
        placeholder={EVENT_HERO_ALT}
        className={styles.imgStrip}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}

/** "What this is" — the organiser's own description plus the access note. */
function EventAboutSection() {
  const { t } = useTranslation();
  return (
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
  );
}

/** The practical rows (when, where, what to bring) and the location reveal. */
function EventDetailsSection() {
  const { t } = useTranslation();
  return (
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
              <div className={styles.detailLabel}>{t(detail.labelKey)}</div>
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
  );
}

/** How the room works — the short version of the Code of Care. */
function EventGuidelinesSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {t("gatherings:event.guidelines.title")}
      </div>
      <div className={styles.text}>
        <p>{t("gatherings:event.guidelines.body1")}</p>
        <p>{t("gatherings:event.guidelines.body2")}</p>
      </div>
    </div>
  );
}

/** The event page's whole left column, in reading order. */
export function EventPageBody() {
  return (
    <div>
      <EventAboutSection />
      <EventDetailsSection />
      <EventGuidelinesSection />
    </div>
  );
}
