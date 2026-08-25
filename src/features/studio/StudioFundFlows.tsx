import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { IN, OUT } from "./studioSolidarityFund.data";
import s from "./funding.module.css";

export function StudioFundFlows() {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="studio:fund.flows.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.secDek}>
        {/* eslint-disable local/no-literal-string -- not swept: the "never
            the artist's 80%, never your tips" clause is a trust commitment
            (extraction-brief §6), deliberately left for a native pt-PT
            reviewer; renders in English via the fallback chain until that
            review lands. */}
        No new fee funds this. It's the overflow of a system designed to
        overflow toward people: <em>never the artist's 80%, never your tips</em>
        .{/* eslint-enable local/no-literal-string */}
      </div>
      <div className={s.flow2}>
        <div className={s.flowCol}>
          <h3>
            <span style={{ color: "var(--jade-light)" }} aria-hidden>
              <FiArrowDown />
            </span>{" "}
            {t("studio:fund.flows.inHeading")}
          </h3>
          {IN.map((f, i) => (
            <div key={i} className={s.flowItem}>
              <div>
                <div className={s.k}>
                  <Translation
                    i18nKey={f.labelKey}
                    components={{ em: <em /> }}
                  />
                </div>
                <div className={s.d}>{t(f.descKey)}</div>
              </div>
              <div className={`${s.amt} ${s.amtIn}`}>
                <em>{fmt.currency(f.amount)}</em>
              </div>
            </div>
          ))}
        </div>
        <div className={s.flowCol}>
          <h3>
            <span style={{ color: "var(--accent)" }} aria-hidden>
              <FiArrowUp />
            </span>{" "}
            {t("studio:fund.flows.outHeading")}
          </h3>
          {OUT.map((f, i) => (
            <div key={i} className={s.flowItem}>
              <div>
                <div className={s.k}>
                  <Translation
                    i18nKey={f.labelKey}
                    components={{ em: <em /> }}
                  />
                </div>
                <div className={s.d}>{t(f.descKey)}</div>
              </div>
              <div className={`${s.amt} ${s.amtOut}`}>
                <em>{fmt.currency(f.amount)}</em>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
