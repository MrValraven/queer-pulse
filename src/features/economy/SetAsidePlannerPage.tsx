import { useMemo, useState } from "react";
import type { TaxYear } from "./tax.calc";
import { estimateTakeHome } from "./tax.calc";
import { ToolPage } from "./tools/ToolPage";
import { useLocalStorage } from "./tools/useLocalStorage";
import { SetAsideForm } from "./SetAsideForm";
import { SetAsideResult } from "./SetAsideResult";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COEFFICIENT_FOR,
  POT_STORAGE_KEY,
  makeEntryId,
  todayIso,
  type Activity,
  type PotEntry,
} from "./setAside.data";

/**
 * Tax set-aside planner: works out what % of every invoice a freelancer should
 * park for IRS + Segurança Social, and keeps a running "set-aside pot" in
 * localStorage. All figures are ESTIMATES (regime simplificado) — see
 * TAX_DISCLAIMER in the result column.
 */
export function SetAsidePlannerPage() {
  const { t } = useTranslation();
  const [gross, setGross] = useState(30000);
  const [activity, setActivity] = useState<Activity>("services");
  const [year, setYear] = useState<TaxYear>(2026);
  const [pot, setPot] = useLocalStorage<PotEntry[]>(POT_STORAGE_KEY, []);

  /** Recommended set-aside %: effective rate, ceil'd and padded for safety. */
  const setAsidePct = useMemo(() => {
    if (!(gross > 0)) return 0;
    const { effectiveRate } = estimateTakeHome({
      gross,
      coefficient: COEFFICIENT_FOR[activity],
      year,
    });
    return Math.min(50, Math.ceil(effectiveRate * 100) + 2);
  }, [gross, activity, year]);

  const addEntry = (amount: number, date: string) =>
    setPot((prev) => [{ id: makeEntryId(), amount, date }, ...prev]);

  const removeEntry = (id: string) =>
    setPot((prev) => prev.filter((e) => e.id !== id));

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:setAside.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:setAside.sub")}
      form={
        <SetAsideForm
          gross={gross}
          activity={activity}
          year={year}
          pot={pot}
          today={todayIso()}
          onGross={setGross}
          onActivity={setActivity}
          onYear={setYear}
          onAdd={addEntry}
          onRemove={removeEntry}
        />
      }
      preview={
        <SetAsideResult gross={gross} setAsidePct={setAsidePct} pot={pot} />
      }
    />
  );
}
