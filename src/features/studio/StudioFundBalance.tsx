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
          className={s.l}
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(var(--cream-rgb), 0.4)",
          }}
        >
          {t("studio:fund.balance.label")}
        </div>
        <div
          className={s.v}
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 300,
            fontSize: 56,
            color: "rgb(var(--cream-rgb))",
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
          className={s.sub}
          style={{
            fontSize: 13.5,
            color: "rgba(var(--cream-rgb), 0.55)",
            lineHeight: 1.6,
            maxWidth: "52ch",
          }}
        >
          {t("studio:demo.fund.balanceNote")}
        </div>
      </div>
      <div className={s.balSide}>
        <div className={s.mini}>
          <div
            className={s.v}
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "rgb(var(--cream-rgb))",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.currency(FUND_PAID_THIS_QUARTER)}
            </em>
          </div>
          <div
            className={s.l}
            style={{ fontSize: 11.5, color: "rgba(var(--cream-rgb), 0.4)" }}
          >
            {t("studio:fund.balance.paidThisQuarterLabel")}
          </div>
        </div>
        <div className={s.mini}>
          <div
            className={s.v}
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 300,
              fontSize: 28,
              color: "rgb(var(--cream-rgb))",
            }}
          >
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              {fmt.number(FUND_PEOPLE_PAID_THIS_YEAR)}
            </em>
          </div>
          <div
            className={s.l}
            style={{ fontSize: 11.5, color: "rgba(var(--cream-rgb), 0.4)" }}
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
