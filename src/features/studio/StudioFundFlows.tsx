import { IN, OUT } from "./studioSolidarityFund.data";
import s from "./funding.module.css";

export function StudioFundFlows() {
  return (
    <section className={s.sec}>
      <h2>
        Where it <em>comes from</em>, where it <em>goes</em>
      </h2>
      <div className={s.secDek}>
        No new fee funds this. It's the overflow of a system designed to
        overflow toward people —{" "}
        <em>never the artist's 80%, never your tips</em>.
      </div>
      <div className={s.flow2}>
        <div className={s.flowCol}>
          <h3>
            <span style={{ color: "var(--jade-light)" }}>▼</span> Money in ·
            this quarter
          </h3>
          {IN.map((f, i) => (
            <div key={i} className={s.flowItem}>
              <div>
                <div className={s.k}>{f.k}</div>
                <div className={s.d}>{f.d}</div>
              </div>
              <div className={`${s.amt} ${s.amtIn}`}>
                €<em>{f.v}</em>
              </div>
            </div>
          ))}
        </div>
        <div className={s.flowCol}>
          <h3>
            <span style={{ color: "var(--accent)" }}>▲</span> Money out · this
            quarter
          </h3>
          {OUT.map((f, i) => (
            <div key={i} className={s.flowItem}>
              <div>
                <div className={s.k}>{f.k}</div>
                <div className={s.d}>{f.d}</div>
              </div>
              <div className={`${s.amt} ${s.amtOut}`}>
                €<em>{f.v}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
