import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DISB, DISB_MORE } from "./studioSolidarityFund.data";
import { downloadCsv } from "../../shared/lib/downloadBlob";
import type { TFunction } from "../../shared/i18n/types";
import type { DisbursementRow } from "./studioSolidarityFund.data";
import s from "./funding.module.css";

const rowDate = (row: DisbursementRow) => new Date(`${row.dateIso}T12:00:00Z`);

/** The recipient as plain text (the CSV has no markup). */
function plainName(row: DisbursementRow, t: TFunction): string {
  if (row.person) return `${row.person.first} ${row.person.last}`;
  return row.nameKey ? t(row.nameKey).replace(/<\/?em>/g, "") : "";
}

const tagClass: Record<string, string> = {
  trans: s.tagTrans!,
  emerg: s.tagEmerg!,
  grant: s.tagGrant!,
  access: s.tagAccess!,
};

function DisbursementRowSkeleton() {
  return (
    <div className={s.disbRow}>
      <div className={s.dt}>
        <div
          className={s.skel}
          style={{ width: 30, height: 22, margin: "0 auto" }}
        />
        <div
          className={s.skel}
          style={{ width: 26, height: 9, margin: "6px auto 0" }}
        />
      </div>
      <div className={s.di}>
        <div className={s.skel} style={{ width: "55%", height: 15 }} />
        <div
          className={s.skel}
          style={{ width: "80%", height: 12, marginTop: 8 }}
        />
      </div>
      <div className={s.skel} style={{ width: 56, height: 18 }} />
    </div>
  );
}

export function StudioFundLog() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [showFull, setShowFull] = useState(false);
  const rows = showFull ? [...DISB, ...DISB_MORE] : DISB;
  const loading = useSimulatedLoad();

  function exportCsv() {
    const data: string[][] = [
      [
        t("studio:fund.log.csv.date"),
        t("studio:fund.log.csv.category"),
        t("studio:fund.log.csv.recipient"),
        t("studio:fund.log.csv.note"),
        t("studio:fund.log.csv.amount"),
      ],
      ...[...DISB, ...DISB_MORE].map((r) => [
        fmt.date(rowDate(r), {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }),
        t(r.tagKey),
        plainName(r, t),
        t(r.noteKey),
        String(r.amount),
      ]),
    ];
    downloadCsv("solidarity-fund-disbursements.csv", data);
    showToast(t("studio:fund.log.exportToast"), "success");
  }

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="studio:fund.log.heading"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={s.secDek}>
        <Translation
          i18nKey="studio:fund.log.dek"
          components={{ em: <em /> }}
        />
      </div>
      {loading
        ? Array.from({ length: rows.length }).map((_, i) => (
            <DisbursementRowSkeleton key={i} />
          ))
        : rows.map((r, i) => (
            <FadeIn
              key={`${r.dateIso}-${r.noteKey}`}
              delay={Math.min(i, 8) * 60}
            >
              <div className={s.disbRow}>
                <div className={s.dt}>
                  <b>
                    {fmt.date(rowDate(r), { day: "numeric", timeZone: "UTC" })}
                  </b>
                  <span>
                    {fmt.date(rowDate(r), { month: "short", timeZone: "UTC" })}
                  </span>
                </div>
                <div className={s.di}>
                  <h5>
                    <span className={`${s.tag2} ${tagClass[r.tagClass]}`}>
                      {t(r.tagKey)}
                    </span>
                    {r.person ? (
                      <span className={s.diName}>
                        {r.person.first} <em>{r.person.last}</em>
                      </span>
                    ) : (
                      r.nameKey && (
                        <span className={s.diName}>
                          <Translation
                            i18nKey={r.nameKey}
                            components={{ em: <em /> }}
                          />
                        </span>
                      )
                    )}
                  </h5>
                  <p>{t(r.noteKey)}</p>
                </div>
                <div className={s.disbAmt}>
                  <em>{fmt.currency(r.amount)}</em>
                </div>
              </div>
            </FadeIn>
          ))}
      <div className={s.logNote}>
        {t("studio:fund.log.showingOf", {
          shown: rows.length,
          total: 148,
        })}{" "}
        ·{" "}
        <button type="button" onClick={() => setShowFull((v) => !v)}>
          {showFull
            ? t("studio:fund.log.showLess")
            : t("studio:fund.log.fullLog")}
        </button>{" "}
        ·{" "}
        <button type="button" onClick={exportCsv}>
          {t("studio:fund.log.exportCsv")}
        </button>
      </div>
    </section>
  );
}
