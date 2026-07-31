import { useSimulatedLoad } from "../../shared/hooks";
import { StudioCreatorShell } from "./StudioCreatorShell";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PAYOUTS } from "./studioPayouts.data";
import {
  PayoutsHero,
  PayoutsList,
  PayoutsSidebar,
} from "./StudioPayoutsSections";
import { downloadCsv } from "../../shared/lib/downloadBlob";
import s from "./creator.module.css";

export function StudioPayoutsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const loading = useSimulatedLoad();

  function exportCsv() {
    const data: string[][] = [
      [
        t("studio:payouts.export.headers.period"),
        t("studio:payouts.export.headers.date"),
        t("studio:payouts.export.headers.detail"),
        t("studio:payouts.export.headers.amount"),
        t("studio:payouts.export.headers.status"),
      ],
      ...PAYOUTS.map((payout) => [
        payout.period,
        `${payout.d} ${payout.m}`,
        payout.csvMeta,
        payout.amt.replace(/,/g, ""),
        payout.status,
      ]),
    ];
    downloadCsv("studio-payout-history.csv", data);
    showToast(t("studio:payouts.export.toast"), "success");
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
