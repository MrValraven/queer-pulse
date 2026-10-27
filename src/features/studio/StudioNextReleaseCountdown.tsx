import { useId } from "react";
import { useNow } from "../gatherings/checkin/useNow";
import { Button } from "../../shared/components/ui";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioNextReleaseView } from "./api/studioDashboard.adapters";
import { countdownPartsOf, type CountdownParts } from "./studioCountdown";
import { formatStudioCount } from "./studioCount";
import css from "./StudioReleaseHealth.module.css";

const MINUTE_IN_MILLISECONDS = 60_000;

/** "{title} goes live in 4 days and 17 hours", with a lone unit when the
 *  other one is 0. */
function countdownSentenceOf(
  parts: CountdownParts,
  title: string,
  t: TFunction,
  fmt: Formatters,
): string {
  if (parts.kind === "now")
    return t("studio:numbers.nextRelease.now", { title });
  if (parts.kind === "underAnHour")
    return t("studio:numbers.nextRelease.underAnHour", { title });
  const daysText = fmt.unit(parts.days, "day", { unitDisplay: "long" });
  const hoursText = fmt.unit(parts.hours, "hour", { unitDisplay: "long" });
  const time =
    parts.hours === 0
      ? daysText
      : parts.days === 0
        ? hoursText
        : t("studio:numbers.nextRelease.daysAndHours", {
            days: daysText,
            hours: hoursText,
          });
  return t("studio:numbers.nextRelease.in", { title, time });
}

/** "Next release": how long until the earliest scheduled release goes live,
 *  re-read every minute, and how many people are waiting for it. The
 *  sentence carries no live region, so the minute tick stays quiet for
 *  screen readers. */
export function StudioNextReleaseCountdown({
  nextRelease,
  isFirst = false,
}: {
  nextRelease: StudioNextReleaseView;
  /** Drops the top rule when nothing sits above it in the card. */
  isFirst?: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const headingId = useId();
  const now = useNow(MINUTE_IN_MILLISECONDS);
  const parts = countdownPartsOf(nextRelease.publishAt, now);
  return (
    <div
      className={`${css.countdown} ${isFirst ? css.isFirst : ""}`}
      role="group"
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className={css.heading}>
        {t("studio:numbers.nextRelease.heading")}
      </h3>
      <p className={css.countdownSentence}>
        {countdownSentenceOf(parts, nextRelease.title, t, fmt)}
      </p>
      <div className={css.countdownFoot}>
        <span className={css.countdownReminders}>
          {t("studio:numbers.reminders", {
            value: formatStudioCount(nextRelease.reminders, t, fmt),
          })}
        </span>
        <Button variant="quiet" size="sm" to={nextRelease.href}>
          {t("studio:numbers.nextRelease.openCta")}
        </Button>
      </div>
    </div>
  );
}
