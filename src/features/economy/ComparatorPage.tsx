import { useState } from "react";
import { ToolPage } from "./tools/ToolPage";
import { ComparatorForm } from "./ComparatorForm";
import { ComparatorResult } from "./ComparatorResult";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ActivityKey, StartupYear } from "./comparator.data";
import type { TaxYear } from "./tax.calc";

/**
 * Freelance (recibos verdes) vs salaried (Categoria A) take-home comparator.
 * Live client-side calc — no actions, the preview recomputes on every change.
 */
export function ComparatorPage() {
  const { t } = useTranslation();
  const [gross, setGross] = useState("30000");
  const [activity, setActivity] = useState<ActivityKey>("services");
  const [year, setYear] = useState<TaxYear>(2026);
  const [startupYear, setStartupYear] = useState<StartupYear>(0);

  const onChange = (
    patch: Partial<{
      gross: string;
      activity: ActivityKey;
      year: TaxYear;
      startupYear: StartupYear;
    }>,
  ) => {
    if (patch.gross !== undefined) setGross(patch.gross);
    if (patch.activity !== undefined) setActivity(patch.activity);
    if (patch.year !== undefined) setYear(patch.year);
    if (patch.startupYear !== undefined) setStartupYear(patch.startupYear);
  };

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowFreelance")}
      title={
        <Translation
          i18nKey="economy:comparator.title"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("economy:comparator.sub")}
      form={
        <ComparatorForm
          gross={gross}
          activity={activity}
          year={year}
          startupYear={startupYear}
          onChange={onChange}
        />
      }
      preview={
        <ComparatorResult
          gross={gross}
          activity={activity}
          year={year}
          startupYear={startupYear}
        />
      }
    />
  );
}
