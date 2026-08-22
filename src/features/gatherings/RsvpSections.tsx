import { Avatar, Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberName } from "../members/data/members";
import { useToast } from "../../shared/components/feedback/useToast";
import { useShareLink } from "../../shared/hooks";
import { appOrigin } from "../../shared/lib/inviteUrl";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "./data";
import {
  GATHERING_TITLE,
  RSVP_ATTENDEE_NAMES,
  RSVP_COC,
  RSVP_DETAILS,
  RSVP_GATHERING_SLUG,
  RSVP_HOST_QUOTE,
  downloadIcs,
  googleCalendarUrl,
} from "./rsvpPage.data";
import styles from "./RsvpPage.module.css";

/** The avatar stack shown beside "you're going with" — fixed demo attendees. */
const RSVP_ATTENDEE_AVATARS = [
  { initials: "SA", tint: "jade" as const },
  { initials: "TB", tint: "coral" as const },
  { initials: "BP", tint: "plum" as const },
  { initials: "JF", tint: "jade" as const },
];

/** The confirmation card: success check, event details, attendees, host note,
 *  calendar actions, and the share/details CTAs. Owns its own toast. */
export function RsvpConfirmationCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  // Really writes the gathering's link to the clipboard (and says so only when
  // the write succeeds) instead of toasting "copied" over nothing.
  const { share: shareInviteLink } = useShareLink({
    copied: t("gatherings:rsvp.inviteCopiedToast"),
    failed: t("gatherings:rsvp.inviteCopyFailedToast"),
  });
  const inviteUrl = `${appOrigin()}${gatheringPath(RSVP_GATHERING_SLUG)}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.checkWrap}>
          <svg viewBox="0 0 72 72" width={72} height={72}>
            <circle className={styles.checkCircle} cx={36} cy={36} r={32} />
            <polyline
              className={styles.checkMark}
              points="20,36 30,47 52,24"
              fill="none"
            />
          </svg>
        </div>
        <div className={styles.eyebrow}>{t("gatherings:rsvp.eyebrow")}</div>
        <h1 className={styles.h}>
          <Translation
            i18nKey="gatherings:rsvp.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.gName}>{GATHERING_TITLE}</p>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.details}>
          {RSVP_DETAILS.map((detail) => (
            <div key={detail.labelKey} className={styles.detail}>
              <span
                className={styles.detailIcon}
                style={{ background: detail.background }}
              >
                <detail.icon />
              </span>
              <div>
                <div className={styles.detailLabel}>{t(detail.labelKey)}</div>
                <div className={styles.detailVal}>
                  {typeof detail.value === "string"
                    ? detail.value
                    : `${fmt.date(detail.value, { day: "numeric", month: "long" })} · ${fmt.time(detail.value)}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.withLabel}>{t("gatherings:rsvp.withLabel")}</div>
        <div className={styles.withRow}>
          <div style={{ display: "flex" }}>
            {RSVP_ATTENDEE_AVATARS.map((person, index) => (
              <Avatar
                key={person.initials}
                initials={person.initials}
                tint={person.tint}
                size={34}
                style={{ marginLeft: index === 0 ? 0 : -8 }}
              />
            ))}
          </div>
          <div className={styles.withText}>
            <strong>{RSVP_ATTENDEE_NAMES}</strong>
            <br />
            {t("gatherings:rsvp.othersCount", { count: 8 })}
          </div>
        </div>

        <div className={styles.hostNote}>
          <div className={styles.hnHead}>
            <Avatar initials="ML" tint="plum" size={28} />
            <div>
              <div className={styles.hnName}>
                <span className={styles.nameRow}>
                  {memberName("mariana")}
                  <MemberStaffBadge slug="mariana" />
                </span>
              </div>
              <div className={styles.hnRole}>
                {t("gatherings:rsvp.host.roleLabel")}
              </div>
            </div>
          </div>
          <p className={styles.hnText}>{RSVP_HOST_QUOTE}</p>
        </div>

        <div className={styles.calLabel}>
          {t("gatherings:rsvp.calendar.label")}
        </div>
        <div className={styles.calRow}>
          <button
            type="button"
            className={styles.calBtn}
            onClick={() =>
              window.open(googleCalendarUrl(), "_blank", "noopener,noreferrer")
            }
          >
            {t("gatherings:rsvp.calendar.googleCta")}
          </button>
          <button
            type="button"
            className={styles.calBtn}
            onClick={() => {
              downloadIcs();
              showToast(
                t("gatherings:rsvp.calendar.downloadedToast"),
                "success",
              );
            }}
          >
            {t("gatherings:rsvp.calendar.appleCta")}
          </button>
        </div>

        <div className={styles.ctas}>
          <Button size="lg" to={routes.gatherings}>
            {t("gatherings:rsvp.viewDetailsCta")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void shareInviteLink(inviteUrl)}
          >
            {t("gatherings:rsvp.inviteCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The Code of Care safety framing shown below the confirmation card. */
export function RsvpCodeOfCare() {
  const { t } = useTranslation();
  return (
    <div className={styles.coc}>
      <div className={styles.cocInner}>
        <h2 className={styles.cocTitle}>
          <Translation
            i18nKey="gatherings:rsvp.coc.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.cocItems}>
          {RSVP_COC.map((item) => (
            <div key={item.id} className={styles.cocItem}>
              <div className={styles.cocDot} />
              <p className={styles.cocText}>
                <strong>{t(item.strongKey)}</strong>{" "}
                {t(item.restKey, item.restValues)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
