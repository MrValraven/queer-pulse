import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import {
  ALLOC,
  GOV_STATS,
  MISTAKES,
  MOD_ROWS,
  MOD_STATS,
  PEOPLE1,
  PEOPLE2,
  REQUESTS,
  SOURCES,
  type Bignum as BignumData,
} from "./transparencyReport.data";
import styles from "./TransparencyReportPage.module.css";

export function Bignum({ d }: { d: BignumData }) {
  return (
    <div className={styles.bignum}>
      <div className={styles.lbl}>{d.lbl}</div>
      <b>{d.b}</b>
      <p>{d.p}</p>
      {d.delta && (
        <span
          className={[styles.delta, d.down && styles.deltaDown]
            .filter(Boolean)
            .join(" ")}
        >
          {d.delta}
        </span>
      )}
    </div>
  );
}

export function MoneySection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="money">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.money.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>1</em>
        </span>
      </div>
      <p className={styles.secSub}>{t("marketing:transparency.money.sub")}</p>
      <div className={styles.miniH}>
        {t("marketing:transparency.money.sourcesHeading")}
      </div>
      <div className={styles.sourceGrid}>
        {SOURCES.map((s) => (
          <div className={styles.source} key={s.name}>
            <div className={styles.sourceAmt}>{s.amt}</div>
            <div className={styles.sourceName}>{s.name}</div>
            <div className={styles.sourceDetail}>{s.detail}</div>
          </div>
        ))}
      </div>
      <div className={styles.alloc}>
        <div className={styles.allocTotal}>
          <em>€267,420</em>
        </div>
        <div className={styles.allocTotalLbl}>
          {t("marketing:transparency.money.spentLabel")}
        </div>
        <div className={styles.allocBar}>
          {ALLOC.map((a, i) => (
            <span key={i} style={{ background: a.color, width: `${a.w}%` }} />
          ))}
        </div>
        <div className={styles.allocKey}>
          {ALLOC.map((a, i) => (
            <div className={styles.allocKeyRow} key={i}>
              <span className={styles.dot} style={{ background: a.color }} />
              <div>
                <div className={styles.label}>{a.label}</div>
                <div className={styles.detail}>{a.detail}</div>
              </div>
              <span className={styles.amt}>{a.amt}</span>
              <span className={styles.pct}>{a.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PeopleSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="people">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.people.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>2</em>
        </span>
      </div>
      <p className={styles.secSub}>{t("marketing:transparency.people.sub")}</p>
      <div className={styles.bignumRow}>
        {PEOPLE1.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <div className={styles.bignumRow} style={{ marginBottom: 0 }}>
        {PEOPLE2.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
    </section>
  );
}

export function ModerationSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="moderation">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.moderation.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>3</em>
        </span>
      </div>
      <p className={styles.secSub}>
        {t("marketing:transparency.moderation.sub")}
      </p>
      <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
        {MOD_STATS.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <div className={styles.modTable}>
        <div className={`${styles.modRow} ${styles.modHead}`}>
          <span>{t("marketing:transparency.moderation.colReason")}</span>
          <span>{t("marketing:transparency.moderation.colCount")}</span>
          <span>{t("marketing:transparency.moderation.colYoy")}</span>
          <span>{t("marketing:transparency.moderation.colPct")}</span>
        </div>
        {MOD_ROWS.map((r, i) => (
          <div className={styles.modRow} key={i}>
            <span className={styles.reason}>{r.reason}</span>
            <span className={styles.count}>{r.count}</span>
            <span
              className={[styles.delta, r.up && styles.deltaUp]
                .filter(Boolean)
                .join(" ")}
            >
              {r.delta}
            </span>
            <span className={styles.pct}>{r.pct}</span>
          </div>
        ))}
      </div>
      <p className={styles.modBreakdown}>
        <Translation
          i18nKey="marketing:transparency.moderation.breakdown"
          components={{ b: <b /> }}
        />
      </p>
    </section>
  );
}

export function RequestsSection() {
  return (
    <section className={styles.sec} id="requests">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.requests.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>4</em>
        </span>
      </div>
      <p className={styles.secSub}>
        <Translation
          i18nKey="marketing:transparency.requests.sub"
          components={{ em: <em /> }}
        />
      </p>
      {REQUESTS.map((r, i) => (
        <div className={styles.reqCard} key={i}>
          <div>
            <div className={styles.reqH}>{r.h}</div>
            <div className={styles.reqD}>{r.d}</div>
          </div>
          <div>
            <div className={styles.reqR}>{r.r}</div>
            <div className={styles.reqRL}>{r.rl}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

export function MistakesSection() {
  return (
    <section className={styles.sec} id="mistakes">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.mistakes.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>5</em>
        </span>
      </div>
      <p className={styles.secSub}>
        <Translation
          i18nKey="marketing:transparency.mistakes.sub"
          components={{ em: <em /> }}
        />
      </p>
      {MISTAKES.map((m, i) => (
        <div className={styles.mistake} key={i}>
          <div className={styles.mistakeMeta}>{m.meta}</div>
          <h3 className={styles.mistakeH}>{m.h}</h3>
          <p className={styles.mistakeText}>{m.text}</p>
          <div className={styles.mistakeFix}>{m.fix}</div>
        </div>
      ))}
    </section>
  );
}

export function GovernanceSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="governance">
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:transparency.governance.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>
          0<em>6</em>
        </span>
      </div>
      <p className={styles.secSub}>
        {t("marketing:transparency.governance.sub")}
      </p>
      <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
        {GOV_STATS.map((d) => (
          <Bignum d={d} key={d.lbl} />
        ))}
      </div>
      <p className={styles.modBreakdown}>
        {t("marketing:transparency.governance.seeMore")}
      </p>
    </section>
  );
}

const REPORT_TEXT = `QueerPulse — Annual Transparency Report 2025
============================================

This is a mock export from the QueerPulse prototype. The full 84-page report
is summarised below.

WHERE THE MONEY CAME FROM (2025): €278,400
WHERE IT WENT: €267,420 spent · €10,980 carried to reserves
MODERATION: 184 actions logged · median response 4.2h
GOVERNMENT/LEGAL DATA REQUESTS: see §04 — no informal asks complied with.

Prepared by Catarina Vaz & André Bento.
Independently audited by Dra. Helena Faria, Faria Auditoria.
Questions: transparency@queerpulse.pt
`;

const REPORT_CSV = `section,metric,value
finance,income_eur,278400
finance,spend_eur,267420
finance,surplus_eur,10980
people,members_year_end,1847
moderation,actions_logged,184
moderation,median_response_hours,4.2
governance,assembly_votes_cast,312
`;

export function Signoff() {
  const { t } = useTranslation();
  return (
    <div className={styles.signoff}>
      <h3>
        <Translation
          i18nKey="marketing:transparency.signoff.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p>
        <Translation
          i18nKey="marketing:transparency.signoff.body"
          components={{
            em: <em />,
            // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- false positive: an element template for <Translation>, which clones it with the translated children (its accessible name) at render.
            a: <a href="mailto:transparency@queerpulse.pt" />,
          }}
        />
      </p>
      <div className={styles.signRow}>
        <div className={styles.signAv}>CV</div>
        <div>
          <div className={styles.signName}>Catarina Vaz</div>
          <div className={styles.signRole}>
            {t("marketing:transparency.signoff.role.catarina")}
          </div>
        </div>
        <div
          className={styles.signAv}
          style={{
            background: "rgba(var(--jade-rgb),.18)",
            color: "var(--jade-soft)",
          }}
        >
          AB
        </div>
        <div>
          <div className={styles.signName}>André Bento</div>
          <div className={styles.signRole}>
            {t("marketing:transparency.signoff.role.andre")}
          </div>
        </div>
        <div
          className={styles.signAv}
          style={{
            background: "rgba(247,243,238,.10)",
            color: "rgba(247,243,238,.8)",
          }}
        >
          HF
        </div>
        <div>
          <div className={styles.signName}>Dra. Helena Faria</div>
          <div className={styles.signRole}>
            {t("marketing:transparency.signoff.role.auditor")}
          </div>
        </div>
      </div>
      <div className={styles.trActions}>
        <Button
          type="button"
          variant="primary"
          onClick={() =>
            downloadBlob(
              "transparency-report-2025.txt",
              REPORT_TEXT,
              "text/plain",
            )
          }
        >
          {t("marketing:transparency.signoff.downloadPdf")}
        </Button>
        <Button
          type="button"
          variant="ghost-dark"
          onClick={() =>
            downloadBlob(
              "transparency-figures-2025.csv",
              REPORT_CSV,
              "text/csv",
            )
          }
        >
          {t("marketing:transparency.signoff.downloadCsv")}
        </Button>
      </div>
    </div>
  );
}
