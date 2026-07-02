import s from "./funding.module.css";

export function StudioFundBalance() {
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
          Fund balance · today
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
          €
          <em style={{ fontStyle: "normal", color: "var(--jade-light)" }}>
            24,180
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
          Healthy: roughly four months of current disbursement. Anything above
          six months' runway rolls into the next quarterly grant round by
          council vote.
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
            €
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              6,240
            </em>
          </div>
          <div
            className="l"
            style={{ fontSize: 11.5, color: "rgba(247,243,238,.4)" }}
          >
            paid out this quarter
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
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>148</em>
          </div>
          <div
            className="l"
            style={{ fontSize: 11.5, color: "rgba(247,243,238,.4)" }}
          >
            people paid from it this year
          </div>
        </div>
      </div>
    </div>
  );
}
