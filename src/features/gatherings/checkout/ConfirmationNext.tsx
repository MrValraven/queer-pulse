import { useMemo } from "react";
import { FiCalendar, FiCreditCard, FiGift, FiMapPin } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { routes } from "../../../app/routeMap";
import {
  ADDRESS_UNLOCK_DATE,
  EVENT,
  buildTimeline,
  type TimelineItem,
} from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { downloadIcs, googleCalendarUrl } from "./calendar";
import { cx } from "./cx";
import s from "./checkout.module.css";

/** Timeline + "roughly where" map + the two logistics cards. */
function WhatsNextSection({ timeline }: { timeline: TimelineItem[] }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <>
      <div className={s["co-sec"]}>
        {t("gatherings:checkout.timeline.sectionTitle")}
      </div>
      <div className={s["co-timeline"]}>
        {timeline.map((item) => (
          <div
            key={item.key}
            className={cx(s["co-tl-item"], item.future && s.future)}
          >
            <div className={s["co-tl-dot"]} />
            <div className={s["co-tl-when"]}>{item.when}</div>
            <div className={s["co-tl-t"]}>{item.title}</div>
            <div className={s["co-tl-p"]}>{item.body}</div>
          </div>
        ))}
      </div>

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.confirm.mapSectionTitle")}
      </div>
      <div
        className={s["co-map"]}
        role="img"
        aria-label={t("gatherings:checkout.confirm.mapAriaLabel", {
          place: "Mouraria, Lisbon",
        })}
      >
        <div className={s["co-map-blur"]} />
        <div className={s["co-map-pin"]} />
        <div className={s["co-map-note"]}>
          {t("gatherings:checkout.confirm.mapNote")}
        </div>
        <div className={s["co-map-label"]}>
          <FiMapPin />{" "}
          {t("gatherings:checkout.confirm.mapLabel", {
            neighbourhood: "Mouraria",
            landmark: "Martim Moniz",
          })}
        </div>
      </div>

      <div className={s["co-logi"]}>
        <div className={s["co-logi-card"]}>
          <div className={s["co-logi-ic"]}>
            <FiMapPin />
          </div>
          <div className={s["co-logi-h"]}>
            {t("gatherings:checkout.confirm.addressCardTitle")}
          </div>
          <div className={s["co-logi-p"]}>
            <Translation
              i18nKey="gatherings:checkout.confirm.addressCardBody"
              components={{ strong: <strong /> }}
              values={{
                time: fmt.time(ADDRESS_UNLOCK_DATE),
                date: fmt.date(ADDRESS_UNLOCK_DATE, {
                  day: "numeric",
                  month: "long",
                }),
              }}
            />
          </div>
        </div>
        <div className={cx(s["co-logi-card"], s.jade)}>
          <div className={s["co-logi-ic"]}>
            <FiGift />
          </div>
          <div className={s["co-logi-h"]}>
            {t("gatherings:checkout.confirm.bringCardTitle")}
          </div>
          <div className={s["co-logi-p"]}>
            {t("gatherings:checkout.confirm.bringCardBody")}
          </div>
        </div>
      </div>
    </>
  );
}

/** Reminder chips + the three "add to calendar" actions. */
function ReminderAndCalendarSection({
  bookingRef,
}: {
  bookingRef: string | null;
}) {
  const { reminders, toggleReminder } = useCheckout();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const noReminders = !reminders.email && !reminders.sms;

  return (
    <>
      <div className={s["co-sec"]}>
        {t("gatherings:checkout.confirm.remindSectionTitle")}
      </div>
      <div
        className={s["co-rem-chips"]}
        role="group"
        aria-label={t("gatherings:checkout.confirm.reminderGroupAria")}
      >
        <button
          className={cx(s["co-rem-chip"], reminders.email && s.on)}
          type="button"
          onClick={() => toggleReminder("email")}
          aria-pressed={reminders.email}
        >
          {t("gatherings:checkout.confirm.reminderEmail")}
        </button>
        <button
          className={cx(s["co-rem-chip"], reminders.sms && s.on)}
          type="button"
          onClick={() => toggleReminder("sms")}
          aria-pressed={reminders.sms}
        >
          {t("gatherings:checkout.confirm.reminderSms")}
        </button>
        <button
          className={cx(s["co-rem-chip"], noReminders && s.on)}
          type="button"
          onClick={() => toggleReminder("none")}
          aria-pressed={noReminders}
        >
          {t("gatherings:checkout.confirm.reminderNone")}
        </button>
      </div>

      <div className={s["co-sec"]}>
        {t("gatherings:checkout.confirm.calendarSectionTitle")}
      </div>
      <div className={s["co-cal-row"]}>
        <button
          className={s["co-cal-btn"]}
          type="button"
          onClick={() =>
            window.open(googleCalendarUrl(), "_blank", "noopener,noreferrer")
          }
        >
          <FiCalendar /> {t("gatherings:checkout.confirm.googleCalendarCta")}
        </button>
        <button
          className={s["co-cal-btn"]}
          type="button"
          onClick={() => {
            downloadIcs(
              t("gatherings:checkout.confirm.icsDescription", {
                host: EVENT.hostName,
                ref: bookingRef ?? "",
              }),
            );
            showToast(
              t("gatherings:checkout.confirm.calendarDownloadedToast"),
              "success",
            );
          }}
        >
          <FiCalendar /> {t("gatherings:checkout.confirm.appleIcsCta")}
        </button>
        <button
          className={cx(s["co-cal-btn"], s.wallet)}
          type="button"
          onClick={() =>
            showToast(
              t("gatherings:checkout.confirm.walletAddedToast"),
              "success",
            )
          }
        >
          <FiCreditCard /> {t("gatherings:checkout.confirm.addToWalletCta")}
        </button>
      </div>
    </>
  );
}

/** The two rows of follow-up actions (view/share, transfer/add-guest). */
function NextActions() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  function copyShare() {
    const link = "https://queerpulse.pt/gathering/supper-club-13";
    navigator.clipboard
      ?.writeText(link)
      .then(() =>
        showToast(t("gatherings:checkout.confirm.shareLinkToast"), "success"),
      );
  }

  return (
    <>
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}
      >
        <Button
          variant="primary"
          to={routes.gathering}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {t("gatherings:checkout.confirm.viewGatheringCta")}
        </Button>
        <Button
          variant="ghost"
          onClick={copyShare}
          style={{ flex: 1, justifyContent: "center" }}
        >
          {t("gatherings:checkout.confirm.tellFriendCta")}
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() =>
            showToast(t("gatherings:checkout.confirm.transferSentToast"), "info")
          }
          style={{ color: "var(--ink-60)" }}
        >
          {t("gatherings:checkout.confirm.transferSeatCta")}
        </button>
        <span style={{ color: "var(--ink-40)" }}>·</span>
        <button
          className={s["co-back-btn"]}
          type="button"
          onClick={() =>
            showToast(t("gatherings:checkout.confirm.addGuestSentToast"), "info")
          }
          style={{ color: "var(--ink-60)" }}
        >
          {t("gatherings:checkout.confirm.addGuestCta")}
        </button>
      </div>
    </>
  );
}

export function ConfirmationNext() {
  const { ref } = useCheckout();
  const { t } = useTranslation();
  const fmt = useFormat();
  const timeline = useMemo(() => buildTimeline(t, fmt), [t, fmt]);

  return (
    <>
      <WhatsNextSection timeline={timeline} />
      <ReminderAndCalendarSection bookingRef={ref} />
      <NextActions />
    </>
  );
}
