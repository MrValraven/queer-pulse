import { useSimulatedLoad } from "../../shared/hooks";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { PAYOUTS } from "./studioPayouts.data";
import {
  PayoutsHero,
  PayoutsList,
  PayoutsSidebar,
} from "./StudioPayoutsSections";
import s from "./creator.module.css";

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

export function StudioPayoutsPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();

  function exportCsv() {
    const data: string[][] = [
      ["Period", "Date", "Detail", "Amount (EUR)", "Status"],
      ...PAYOUTS.map((p) => [
        p.period,
        `${p.d} ${p.m}`,
        p.csvMeta,
        p.amt.replace(/,/g, ""),
        p.status,
      ]),
    ];
    downloadCsv("studio-payout-history.csv", data);
    showToast("Payout history exported as CSV", "success");
  }

  return (
    <StudioCreatorShell>
      <PayoutsHero />
      <section className={s.body}>
        <PayoutsList loading={loading} onExport={exportCsv} />
        <PayoutsSidebar />
      </section>
    </StudioCreatorShell>
  );
}
