import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, type DetailRow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import s from "./flows.module.css";

/** Mock appeal record — the live-mode equivalent of a fetched appeal; only
 * the surrounding chrome (labels, dates formatted via `useFormat()`) is
 * translated. The reference id is an opaque code, not language content. */
const APPEAL_REFERENCE = "QP-APP-2847";
const SUBMITTED_DATE = new Date(2026, 5, 4);
const EXPECTED_DATE = new Date(2026, 5, 11);
const DECIDED_DATE = new Date(2026, 5, 9);

/** Which of the three appeal outcomes a result panel renders. Drives the icon
 * background tint, the timeline stage, the title emphasis colour and the info
 * box variant — see `AppealResultPanel`. */
export type AppealTone = "pending" | "overturned" | "upheld";

/** Everything that varies between the pending / overturned / upheld result
 * panels. The shared chrome (card → icon → title → sub → reference rows →
 * timeline → info box → footer) lives in `AppealResultPanel`; this only carries
 * the per-outcome content. */
export interface AppealResultConfig {
  tone: AppealTone;
  /** The glyph rendered inside the tinted icon circle. */
  icon: ReactNode;
  titleKey: string;
  subKey: string;
  /** Reference / decision facts, rendered as a dense `DetailRows` list. */
  refRows: DetailRow[];
  infoKey: string;
  /** The footer region — a governance link, action buttons, or a contact note. */
  actions: ReactNode;
}

const PendingIcon = (
  <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <circle cx={13} cy={13} r={9} stroke="var(--accent)" strokeWidth={2} />
    <path
      d="M13 8v5.5l3 2"
      stroke="var(--accent)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OverturnedIcon = (
  <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <path
      d="M7 13.5L11.5 18L19 9"
      stroke="var(--jade)"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UpheldIcon = (
  <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
    <circle cx={13} cy={13} r={9} stroke="var(--plum)" strokeWidth={2} />
    <path
      d="M13 9v5M13 17v.5"
      stroke="var(--plum)"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Build the per-outcome content for the appeal result panels. Takes the live
 * `t` / `fmt` so the reference rows can format the mock appeal dates in the
 * active locale while the labels stay translated.
 */
export function buildAppealResultConfigs(
  t: TFunction,
  fmt: Formatters,
): Record<AppealTone, AppealResultConfig> {
  const referenceRow: DetailRow = {
    label: t("safety:appeal.ref.label"),
    value: APPEAL_REFERENCE,
  };

  return {
    pending: {
      tone: "pending",
      icon: PendingIcon,
      titleKey: "safety:appeal.pending.title",
      subKey: "safety:appeal.pending.sub",
      refRows: [
        referenceRow,
        {
          label: t("safety:appeal.pending.submittedLabel"),
          value: fmt.date(SUBMITTED_DATE),
        },
        {
          label: t("safety:appeal.pending.expectedLabel"),
          value: fmt.date(EXPECTED_DATE),
        },
      ],
      infoKey: "safety:appeal.pending.info",
      actions: (
        <div className={s.govLink}>
          <Link to={routes.governance}>
            {t("safety:appeal.pending.govLink")} <FiArrowRight aria-hidden />
          </Link>
        </div>
      ),
    },
    overturned: {
      tone: "overturned",
      icon: OverturnedIcon,
      titleKey: "safety:appeal.overturned.title",
      subKey: "safety:appeal.overturned.sub",
      refRows: [
        referenceRow,
        {
          label: t("safety:appeal.decisionLabel"),
          value: t("safety:appeal.overturned.decisionValue"),
        },
        {
          label: t("safety:appeal.decidedOnLabel"),
          value: fmt.date(DECIDED_DATE),
        },
      ],
      infoKey: "safety:appeal.overturned.info",
      actions: (
        <div className={s.actions} style={{ marginTop: 18 }}>
          <Button to={routes.accountProfile}>
            {t("safety:appeal.overturned.profileCta")}
          </Button>
          <Button variant="ghost" to={routes.guidelines}>
            {t("safety:appeal.overturned.guidelinesCta")}
          </Button>
        </div>
      ),
    },
    upheld: {
      tone: "upheld",
      icon: UpheldIcon,
      titleKey: "safety:appeal.upheld.title",
      subKey: "safety:appeal.upheld.sub",
      refRows: [
        referenceRow,
        {
          label: t("safety:appeal.upheld.outcomeLabel"),
          value: t("safety:appeal.upheld.outcomeValue"),
        },
        {
          label: t("safety:appeal.decidedOnLabel"),
          value: fmt.date(DECIDED_DATE),
        },
      ],
      infoKey: "safety:appeal.upheld.info",
      actions: (
        <div className={s.reportNote}>
          {t("safety:appeal.upheld.contactNote")}
          <br />
          <Link to={routes.contact}>
            {t("safety:appeal.upheld.contactCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
      ),
    },
  };
}
