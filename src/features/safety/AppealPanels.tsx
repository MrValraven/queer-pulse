import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import s from "./flows.module.css";

/** Mock appeal record — the live-mode equivalent of a fetched appeal; only
 * the surrounding chrome (labels, dates formatted via `useFormat()`) is
 * translated. The reference id is an opaque code, not language content. */
export const APPEAL_REFERENCE = "QP-APP-2847";
export const SUBMITTED_DATE = new Date(2026, 5, 4);
export const EXPECTED_DATE = new Date(2026, 5, 11);
export const DECIDED_DATE = new Date(2026, 5, 9);

export function AppealTimeline({ stage }: { stage: "pending" | "done" }) {
  const { t } = useTranslation();
  const last = stage === "done";
  return (
    <div className={s.timeline}>
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${s.tlDone}`}>
          <FiCheck />
        </div>
        <div className={s.tlLabel}>{t("safety:appeal.timeline.filed")}</div>
      </div>
      <div className={`${s.tlLine} ${s.tlLineDone}`} />
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${last ? s.tlSuccess : s.tlCurrent}`}>
          {last ? <FiCheck /> : "2"}
        </div>
        <div className={s.tlLabel}>{t("safety:appeal.timeline.submitted")}</div>
      </div>
      <div
        className={[s.tlLine, last && s.tlLineDone].filter(Boolean).join(" ")}
      />
      <div className={s.tlStep}>
        <div className={`${s.tlDot} ${last ? s.tlSuccess : s.tlPending}`}>
          {last ? <FiCheck /> : "3"}
        </div>
        <div className={s.tlLabel}>{t("safety:appeal.timeline.decision")}</div>
      </div>
    </div>
  );
}

export function AppealPendingPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(232,119,90,.1)" }}>
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
      </div>
      <div className={s.title}>
        <Translation i18nKey="safety:appeal.pending.title" components={{ em: <em /> }} />
      </div>
      <div className={s.sub}>{t("safety:appeal.pending.sub")}</div>
      <div className={s.refBox}>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.ref.label")}</span>
          <span className={s.refVal}>{APPEAL_REFERENCE}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:appeal.pending.submittedLabel")}
          </span>
          <span className={s.refVal}>{fmt.date(SUBMITTED_DATE)}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>
            {t("safety:appeal.pending.expectedLabel")}
          </span>
          <span className={s.refVal}>{fmt.date(EXPECTED_DATE)}</span>
        </div>
      </div>
      <AppealTimeline stage="pending" />
      <div className={`${s.infoBox} ${s.infoJade}`}>
        <Translation
          i18nKey="safety:appeal.pending.info"
          components={{ strong: <strong /> }}
        />
      </div>
      <div className={s.govLink}>
        <Link to={routes.governance}>{t("safety:appeal.pending.govLink")}</Link>
      </div>
    </div>
  );
}

export function AppealOverturnedPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(74,140,111,.1)" }}>
        <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
          <path
            d="M7 13.5L11.5 18L19 9"
            stroke="var(--jade)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        <Translation
          i18nKey="safety:appeal.overturned.title"
          components={{ em: <em style={{ color: "var(--jade)" }} /> }}
        />
      </div>
      <div className={s.sub}>{t("safety:appeal.overturned.sub")}</div>
      <div className={s.refBox}>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.ref.label")}</span>
          <span className={s.refVal}>{APPEAL_REFERENCE}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.decisionLabel")}</span>
          <span className={s.refVal}>
            {t("safety:appeal.overturned.decisionValue")}
          </span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.decidedOnLabel")}</span>
          <span className={s.refVal}>{fmt.date(DECIDED_DATE)}</span>
        </div>
      </div>
      <AppealTimeline stage="done" />
      <div className={`${s.infoBox} ${s.infoJade}`}>
        <Translation
          i18nKey="safety:appeal.overturned.info"
          components={{ strong: <strong /> }}
        />
      </div>
      <div className={s.actions} style={{ marginTop: 18 }}>
        <Button to={routes.accountProfile}>
          {t("safety:appeal.overturned.profileCta")}
        </Button>
        <Button variant="ghost" to={routes.guidelines}>
          {t("safety:appeal.overturned.guidelinesCta")}
        </Button>
      </div>
    </div>
  );
}

export function AppealUpheldPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={`${s.card} ${s.center} ${s.screenIn}`}>
      <div className={s.icon} style={{ background: "rgba(45,27,61,.07)" }}>
        <svg width={26} height={26} viewBox="0 0 26 26" fill="none">
          <circle cx={13} cy={13} r={9} stroke="var(--plum)" strokeWidth={2} />
          <path
            d="M13 9v5M13 17v.5"
            stroke="var(--plum)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className={s.title}>
        <Translation i18nKey="safety:appeal.upheld.title" components={{ em: <em /> }} />
      </div>
      <div className={s.sub}>{t("safety:appeal.upheld.sub")}</div>
      <div className={s.refBox}>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.ref.label")}</span>
          <span className={s.refVal}>{APPEAL_REFERENCE}</span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.upheld.outcomeLabel")}</span>
          <span className={s.refVal}>
            {t("safety:appeal.upheld.outcomeValue")}
          </span>
        </div>
        <div className={s.csRow}>
          <span className={s.csLabel}>{t("safety:appeal.decidedOnLabel")}</span>
          <span className={s.refVal}>{fmt.date(DECIDED_DATE)}</span>
        </div>
      </div>
      <AppealTimeline stage="done" />
      <div className={`${s.infoBox} ${s.infoPlum}`}>
        <Translation
          i18nKey="safety:appeal.upheld.info"
          components={{ strong: <strong /> }}
        />
      </div>
      <div className={s.reportNote}>
        {t("safety:appeal.upheld.contactNote")}
        <br />
        <Link to={routes.contact}>{t("safety:appeal.upheld.contactCta")}</Link>
      </div>
    </div>
  );
}
