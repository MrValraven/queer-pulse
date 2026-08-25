import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./funding.module.css";

const FUND_BALANCE = 24180;
const FUND_PAID_THIS_QUARTER = 6240;
const FUND_PEOPLE_PAID_THIS_YEAR = 148;

export function StudioFundBalance() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={s.bal}>
      <div className={s.balMain}>
        <div
          className="l"
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(247,243,238,.4)",
          }}
        >
          {t("studio:fund.balance.label")}
        </div>
        <div
          className="v"
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 300,
            fontSize: 56,
            color: "var(--cream)",
            letterSpacing: "-0.025em",
            lineHeight: 1,
            margin: "8px 0",
          }}
        >
          <em style={{ fontStyle: "normal", color: "var(--jade-light)" }}>
            {fmt.currency(FUND_BALANCE)}
          </em>
        </div>
        <div
          className="sub"
          style={{
            fontSize: 13.5,
            color: "rgba(247,243,238,.55)",
            lineHeight: 1.6,
            maxWidth: "52ch",
          }}
        >
          {/* eslint-disable local/no-literal-string -- not swept: describes
              the fund's runway/quarterly-rollover rule, a governance
              commitment (extraction-brief §6) deliberately left for a
              native pt-PT reviewer; renders in English via the fallback
              chain until that review lands. */}
          Healthy: roughly four months of current disbursement. Anything above
          six months' runway rolls into the next quarterly grant round by
          council vote.
          {/* eslint-enable local/no-literal-string */}
        </div>
      </div>
      <div className={s.balSide}>
        <div className={s.mini}>
          <div
            className="v"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "var(--cream)",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.currency(FUND_PAID_THIS_QUARTER)}
            </em>
          </div>
          <div
            className="l"
            style={{ fontSize: 11.5, color: "rgba(247,243,238,.4)" }}
          >
            {t("studio:fund.balance.paidThisQuarterLabel")}
          </div>
        </div>
        <div className={s.mini}>
          <div
            className="v"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "var(--cream)",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.number(FUND_PEOPLE_PAID_THIS_YEAR)}
            </em>
          </div>
          <div
            className="l"
            style={{ fontSize: 11.5, color: "rgba(247,243,238,.4)" }}
          >
            {t("studio:fund.balance.peoplePaidLabel", {
              count: FUND_PEOPLE_PAID_THIS_YEAR,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
