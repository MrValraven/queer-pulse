import { Link } from "react-router-dom";
import { Avatar, Button } from "../../shared/components/ui";
import { Footer } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberName } from "../members/data/members";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  GATHERING_TITLE,
  RSVP_ATTENDEE_NAMES,
  RSVP_COC,
  RSVP_DETAILS,
  RSVP_HOST_QUOTE,
  downloadIcs,
  googleCalendarUrl,
} from "./rsvpPage.data";
import { useUnrsvp } from "./api/useEventMutations";
import styles from "./RsvpPage.module.css";

/** Slug of the reading-group gathering this confirmation page is fixed to. */
const RSVP_SLUG = "reading-group-8";

export function RsvpPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const unrsvp = useUnrsvp(RSVP_SLUG);

  return (
    <>
      <div className={styles.root}>
        <div className={styles.brand}>
          <Link to={routes.homepage} className={styles.brandLink}>
            <span className={styles.pulseDot} aria-hidden />
            {"Queer"}
            <span className={styles.brandItalic}>{"Pulse"}</span>
          </Link>
        </div>

        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.checkWrap}>
                <svg viewBox="0 0 72 72" width={72} height={72}>
                  <circle
                    className={styles.checkCircle}
                    cx={36}
                    cy={36}
                    r={32}
                  />
                  <polyline
                    className={styles.checkMark}
                    points="20,36 30,47 52,24"
                    fill="none"
                  />
                </svg>
              </div>
              <div className={styles.eyebrow}>
                {t("gatherings:rsvp.eyebrow")}
              </div>
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
                      style={{ background: detail.bg }}
                    >
                      <detail.icon />
                    </span>
                    <div>
                      <div className={styles.detailLabel}>
                        {t(detail.labelKey)}
                      </div>
                      <div className={styles.detailVal}>
                        {typeof detail.value === "string"
                          ? detail.value
                          : `${fmt.date(detail.value, { day: "numeric", month: "long" })} · ${fmt.time(detail.value)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.withLabel}>
                {t("gatherings:rsvp.withLabel")}
              </div>
              <div className={styles.withRow}>
                <div style={{ display: "flex" }}>
                  {[
                    { i: "SA", t: "jade" as const },
                    { i: "TB", t: "coral" as const },
                    { i: "BP", t: "plum" as const },
                    { i: "JF", t: "jade" as const },
                  ].map((person, index) => (
                    <Avatar
                      key={index}
                      initials={person.i}
                      tint={person.t}
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
                    window.open(
                      googleCalendarUrl(),
                      "_blank",
                      "noopener,noreferrer",
                    )
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
                  onClick={() =>
                    showToast(t("gatherings:rsvp.inviteCopiedToast"), "success")
                  }
                >
                  {t("gatherings:rsvp.inviteCta")}
                </Button>
              </div>
            </div>
          </div>
        </div>

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

        <div className={styles.footer}>
          <p>
            {t("gatherings:rsvp.footer.membership")}{" "}
            <Link
              to={routes.gatherings}
              onClick={() => {
                unrsvp.mutate();
                showToast(t("gatherings:rsvp.footer.cancelledToast"), "info");
              }}
            >
              {t("gatherings:rsvp.footer.cancelCta")}
            </Link>{" "}
            ·{" "}
            <Link to={routes.privacy}>
              {t("gatherings:rsvp.footer.privacyCta")}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
