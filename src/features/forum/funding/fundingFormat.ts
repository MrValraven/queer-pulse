import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { LISBON_TIME_ZONE } from "./funding.data";
import { deadlineCountdown } from "./fundingDates";
import type { ForumFundingView } from "./funding.types";

export function formatEuros(fmt: Formatters, amount: number): string {
  return fmt.currency(amount, "EUR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function amountRangeLabel(
  t: TFunction,
  fmt: Formatters,
  min: number | null,
  max: number | null,
): string | null {
  if (min !== null && max !== null) {
    return min === max
      ? formatEuros(fmt, max)
      : t("forum:funding.amount.range", {
          min: formatEuros(fmt, min),
          max: formatEuros(fmt, max),
        });
  }
  if (max !== null) {
    return t("forum:funding.amount.upTo", { max: formatEuros(fmt, max) });
  }
  if (min !== null) {
    return t("forum:funding.amount.from", { min: formatEuros(fmt, min) });
  }
  return null;
}

export type FundingTone = "neutral" | "accent" | "muted";

export interface DeadlineCopy {
  key: string;
  values: TranslateOptions;
  /** Set for the countdown keys, so a surface can roll the number. */
  count?: number;
  tone: FundingTone;
}

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: LISBON_TIME_ZONE,
};

/**
 * The deadline line for a call. The server's `callState` decides the tone,
 * with ONE display-only exception: once the deadline instant has passed on
 * this clock, the line reads "Closed" even if the loaded state still says
 * open, so nobody reads "Closes in 0 hours" while the refetch lands.
 */
export function callDeadlineCopy(
  fmt: Formatters,
  funding: Pick<ForumFundingView, "deadline" | "callState" | "updatedAt">,
  nowMs: number,
): DeadlineCopy | null {
  if (!funding.callState) return null;
  if (!funding.deadline) {
    return funding.callState === "stale"
      ? {
          key: "forum:funding.deadline.stale",
          values: {
            date: fmt.date(new Date(funding.updatedAt), {
              ...SHORT_DATE,
              year: "numeric",
            }),
          },
          tone: "muted",
        }
      : { key: "forum:funding.deadline.rolling", values: {}, tone: "neutral" };
  }
  const date = fmt.date(new Date(funding.deadline), SHORT_DATE);
  const countdown = deadlineCountdown(funding.deadline, nowMs);
  if (funding.callState === "closed" || countdown.kind === "closed") {
    return {
      key: "forum:funding.deadline.closed",
      values: { date },
      tone: "muted",
    };
  }
  if (funding.callState === "closing") {
    if (countdown.kind === "days") {
      return {
        key: "forum:funding.deadline.closesInDays",
        values: { count: countdown.count },
        count: countdown.count,
        tone: "accent",
      };
    }
    if (countdown.kind === "hours") {
      return {
        key: "forum:funding.deadline.closesInHours",
        values: { count: countdown.count },
        count: countdown.count,
        tone: "accent",
      };
    }
    return {
      key: "forum:funding.deadline.closesWithinHour",
      values: {},
      tone: "accent",
    };
  }
  return {
    key: "forum:funding.deadline.closesOn",
    values: { date },
    tone: "neutral",
  };
}
