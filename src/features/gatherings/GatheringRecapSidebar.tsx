import { FiArrowRight, FiCheck, FiClock } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  RECAP_ATTENDED_COUNT,
  RECAP_EVENT_DATE,
  RECAP_HOST_NAME,
  RECAP_NEXT_EVENT_DATE,
  RECAP_NEXT_EVENT_TITLE,
  RECAP_NEXT_EVENT_VENUE,
  RECAP_SIDEBAR_VENUE,
} from "./gatheringRecap.data";
import styles from "./GatheringRecapPage.module.css";

export function GatheringRecapSidebar({
  onCopyLink,
}: {
  onCopyLink: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbLabel}>
          {t("gatherings:recap.eventDetailsLabel")}
        </div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>
            {t("gatherings:recap.dateLabel")}
          </span>
          <span className={styles.sdrVal}>
            {fmt.date(RECAP_EVENT_DATE, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>
            {t("gatherings:recap.venueLabel")}
          </span>
          <span className={styles.sdrVal}>{RECAP_SIDEBAR_VENUE}</span>
        </div>
        <div className={styles.sbRow}>
          <span className={styles.sdrLabel}>
            {t("gatherings:recap.attendedLabel")}
          </span>
          <span className={styles.sdrVal}>
            {t("common:members.count", { count: RECAP_ATTENDED_COUNT })}
          </span>
        </div>
        <div className={styles.hostRow}>
          <Avatar initials="SR" tint="jade" size={34} />
          <div>
            <div className={styles.hostName}>{RECAP_HOST_NAME}</div>
            <div className={styles.hostRole}>
              {t("gatherings:recap.hostLabel")}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.nextCard}>
        <div className={styles.nextEyebrow}>
          {t("gatherings:recap.comingUpNextEyebrow")}
        </div>
        <div className={styles.nextTitle}>{RECAP_NEXT_EVENT_TITLE}</div>
        <div className={styles.nextDate}>
          {fmt.date(RECAP_NEXT_EVENT_DATE, {
            weekday: "short",
            day: "numeric",
            month: "long",
          })}{" "}
          · {RECAP_NEXT_EVENT_VENUE}
        </div>
        <Button
          to={routes.rsvp}
          style={{
            width: "100%",
            justifyContent: "center",
            fontSize: 13,
            padding: "9px 16px",
          }}
        >
          {t("gatherings:cta.rsvp")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>

      <div className={styles.attendedCard}>
        <div className={styles.acRow}>
          <span style={{ color: "var(--jade)" }}>
            <FiCheck />
          </span>
          <div className={styles.acText}>
            {t("gatherings:recap.attendedThisGathering")}
          </div>
        </div>
        <span className={styles.acSoon} aria-disabled="true">
          <FiClock /> {t("gatherings:recap.yearInReviewCta")}
          <span className={styles.acSoonBadge}>
            {t("gatherings:recap.soonBadge")}
          </span>
        </span>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.shareRow}>
          <div className={styles.shareLabel}>
            {t("gatherings:recap.shareThisRecap")}
          </div>
          <Button
            variant="ghost"
            style={{ fontSize: 12.5, padding: "8px 14px" }}
            onClick={onCopyLink}
          >
            {t("gatherings:recap.copyLinkCta")}
          </Button>
        </div>
      </div>
    </aside>
  );
}
