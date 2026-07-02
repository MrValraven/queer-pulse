import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { DISB, DISB_MORE } from "./studioSolidarityFund.data";
import s from "./funding.module.css";

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

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function StudioFundLog() {
  const { showToast } = useToast();
  const [showFull, setShowFull] = useState(false);
  const rows = showFull ? [...DISB, ...DISB_MORE] : DISB;
  const loading = useSimulatedLoad();

  function exportCsv() {
    const data: string[][] = [
      ["Date", "Category", "Recipient", "Note", "Amount (EUR)"],
      ...[...DISB, ...DISB_MORE].map((r) => [
        `${r.d} ${r.m}`,
        r.tag,
        r.csvName,
        r.note,
        r.amt.replace(/,/g, ""),
      ]),
    ];
    downloadCsv("solidarity-fund-disbursements.csv", data);
    showToast("Disbursement log exported as CSV", "success");
  }

  return (
    <section className={s.sec}>
      <h2>
        Recent <em>disbursements</em>
      </h2>
      <div className={s.secDek}>
        Every payment from the fund is logged here with a name (where consent is
        given) and a reason. <em>No black box.</em>
      </div>
      {loading
        ? Array.from({ length: rows.length }).map((_, i) => (
            <DisbursementRowSkeleton key={i} />
          ))
        : rows.map((r, i) => (
            <FadeIn
              key={`${r.csvName}-${r.d}${r.m}-${r.amt}`}
              delay={Math.min(i, 8) * 60}
            >
              <div className={s.disbRow}>
                <div className={s.dt}>
                  <b>{r.d}</b>
                  <span>{r.m}</span>
                </div>
                <div className={s.di}>
                  <h5>
                    <span className={`${s.tag2} ${tagClass[r.tagClass]}`}>
                      {r.tag}
                    </span>
                    {r.name}
                  </h5>
                  <p>{r.note}</p>
                </div>
                <div className={s.disbAmt}>
                  €<em>{r.amt}</em>
                </div>
              </div>
            </FadeIn>
          ))}
      <div className={s.logNote}>
        Showing {rows.length} of 148 this year ·{" "}
        <button type="button" onClick={() => setShowFull((v) => !v)}>
          {showFull ? "show less" : "full log"}
        </button>{" "}
        ·{" "}
        <button type="button" onClick={exportCsv}>
          export CSV
        </button>
      </div>
    </section>
  );
}
