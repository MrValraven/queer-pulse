import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";

export type TierKey = "hardship" | "solidarity" | "sustaining";

export interface Tier {
  key: TierKey;
  name: string;
  /** Short price hint shown under the tier name, pre-formatted via `fmt`. */
  sub: string;
  /** Paragraph shown in the description box when the tier is selected. */
  desc: string;
  /** Selectable monthly amounts (euros, or 'other'); null for hardship. */
  amounts: (number | "other")[] | null;
  /** Amount pre-selected when the tier is picked. */
  defaultAmt?: number | "other";
}

/**
 * Shared mock dates for this cluster, so "next billing"/"renewal" copy never
 * drifts between PlanPanel, BillingPanel and the sidebar. Real values would
 * come from the billing API in live mode; these are the demo stand-ins.
 */
export const NEXT_BILLING_DATE = new Date(2026, 5, 5); // 5 June 2026
const LAST_PAYMENT_DATE = new Date(2026, 4, 5); // 5 May 2026
const MEMBER_SINCE_DATE = new Date(2024, 2, 1); // March 2024
const CARD_EXPIRY_DATE = new Date(2028, 8, 1); // 09 / 28
const MEMBERSHIP_MONTHS = 3;
const THERAPY_HOURS = 6;
const MICRO_GRANTS_FUNDED = 3;
const HARDSHIP_MEMBERS_SUPPORTED = 2;
const READING_GROUPS_RUNNING = 8;
const MICRO_GRANT_CAP = 200;
const DIRECTORY_SIZE = 247;

/** i18n Pattern B — every field is fully resolved from `t`/`fmt` at call
 * time; consumers call this in a `useMemo(() => buildTiers(t, fmt), [t, fmt])`. */
export function buildTiers(t: TFunction, fmt: Formatters): Tier[] {
  return [
    {
      key: "hardship",
      name: t("settings:membership.tier.hardship.name"),
      sub: t("settings:membership.tier.sub.free", { amount: fmt.currency(0) }),
      desc: t("settings:membership.tier.hardship.desc"),
      amounts: null,
    },
    {
      key: "solidarity",
      name: t("settings:membership.tier.solidarity.name"),
      sub: t("settings:membership.tier.sub.range", {
        min: fmt.currency(5),
        max: fmt.currency(20),
      }),
      desc: t("settings:membership.tier.solidarity.desc", {
        min: fmt.currency(5),
        max: fmt.currency(20),
      }),
      amounts: [5, 10, 15, "other"],
      defaultAmt: 10,
    },
    {
      key: "sustaining",
      name: t("settings:membership.tier.sustaining.name"),
      sub: t("settings:membership.tier.sub.plus", {
        amount: fmt.currency(30),
      }),
      desc: t("settings:membership.tier.sustaining.desc", {
        threshold: fmt.currency(30),
      }),
      amounts: [20, 30, 50, "other"],
      defaultAmt: 20,
    },
  ];
}

export function buildCurrentPlan(t: TFunction, fmt: Formatters) {
  return {
    tier: t("settings:membership.current.tierLabel"),
    amount: fmt.currency(20),
    cadence: t("settings:membership.current.cadence"),
    since: t("settings:membership.current.since", {
      date: fmt.date(MEMBER_SINCE_DATE, { month: "long", year: "numeric" }),
    }),
  };
}

export function buildBillingRows(
  t: TFunction,
  fmt: Formatters,
): { label: string; value: ReactNode; ok?: boolean }[] {
  return [
    {
      label: t("settings:membership.billing.row.lastPayment"),
      value: (
        <>
          {fmt.currency(20)} · {fmt.date(LAST_PAYMENT_DATE)} <FiCheck />
        </>
      ),
      ok: true,
    },
    {
      label: t("settings:membership.billing.row.nextBillingDate"),
      value: fmt.date(NEXT_BILLING_DATE),
    },
    {
      label: t("settings:membership.billing.row.billingCycle"),
      value: t("settings:membership.billing.cycle.monthly"),
    },
    {
      label: t("settings:membership.billing.row.amount"),
      value: fmt.currency(20),
    },
  ];
}

export function buildPaymentMethod(t: TFunction, fmt: Formatters) {
  return {
    brand: "VISA",
    number: "•••• •••• •••• 4242",
    expiry: t("settings:membership.billing.paymentMethod.expires", {
      date: fmt.date(CARD_EXPIRY_DATE, { month: "2-digit", year: "2-digit" }),
    }),
  };
}

export interface InvoiceRecord {
  /** Stable, locale-independent id used to build the invoice number —
   * never derive it from the localized period label (§5.1: a formatted
   * display string must not double as a stored/derived identifier). */
  id: string;
  date: Date;
  amount: number;
}

export const INVOICE_RECORDS: InvoiceRecord[] = [
  { id: "2026-05", date: new Date(2026, 4, 1), amount: 20 },
  { id: "2026-04", date: new Date(2026, 3, 1), amount: 20 },
  { id: "2026-03", date: new Date(2026, 2, 1), amount: 20 },
];

export function invoicePeriodLabel(record: InvoiceRecord, fmt: Formatters) {
  return fmt.date(record.date, { month: "long", year: "numeric" });
}

export function buildAccessItems(t: TFunction, fmt: Formatters) {
  return [
    {
      id: "magazine",
      label: t("settings:membership.access.item.magazine.label"),
      note: t("settings:membership.access.item.magazine.note"),
    },
    {
      id: "forum",
      label: t("settings:membership.access.item.forum.label"),
      note: t("settings:membership.access.item.forum.note"),
    },
    {
      id: "dm",
      label: t("settings:membership.access.item.dm.label"),
      note: t("settings:membership.access.item.dm.note"),
    },
    {
      id: "readingGroups",
      label: t("settings:membership.access.item.readingGroups.label"),
      note: t("settings:membership.access.item.readingGroups.note", {
        count: READING_GROUPS_RUNNING,
      }),
    },
    {
      id: "gatheringTickets",
      label: t("settings:membership.access.item.gatheringTickets.label"),
      note: t("settings:membership.access.item.gatheringTickets.note"),
    },
    {
      id: "jobBoard",
      label: t("settings:membership.access.item.jobBoard.label"),
      note: t("settings:membership.access.item.jobBoard.note"),
    },
    {
      id: "resourceLibrary",
      label: t("settings:membership.access.item.resourceLibrary.label"),
      note: t("settings:membership.access.item.resourceLibrary.note"),
    },
    {
      id: "mentalHealth",
      label: t("settings:membership.access.item.mentalHealth.label"),
      note: t("settings:membership.access.item.mentalHealth.note"),
    },
    {
      id: "microGrants",
      label: t("settings:membership.access.item.microGrants.label"),
      note: t("settings:membership.access.item.microGrants.note", {
        amount: fmt.currency(MICRO_GRANT_CAP),
      }),
    },
    {
      id: "directory",
      label: t("settings:membership.access.item.directory.label"),
      note: t("settings:membership.access.item.directory.note", {
        count: DIRECTORY_SIZE,
      }),
    },
  ];
}

export function buildContribution(t: TFunction, fmt: Formatters) {
  return {
    total: fmt.currency(60),
    label: t("settings:membership.contribution.label"),
    since: t("settings:membership.contribution.since", {
      count: MEMBERSHIP_MONTHS,
      date: fmt.date(MEMBER_SINCE_DATE, { month: "long", year: "numeric" }),
    }),
    impacts: [
      t("settings:membership.contribution.impact.therapyHours", {
        count: THERAPY_HOURS,
      }),
      t("settings:membership.contribution.impact.microGrants", {
        count: MICRO_GRANTS_FUNDED,
      }),
      t("settings:membership.contribution.impact.hardshipAccess", {
        count: HARDSHIP_MEMBERS_SUPPORTED,
      }),
    ],
  };
}

export function buildStatus(t: TFunction, fmt: Formatters) {
  return {
    tier: t("settings:membership.status.tierLabel"),
    renewal: t("settings:membership.status.renewal", {
      date: fmt.date(NEXT_BILLING_DATE),
    }),
  };
}
