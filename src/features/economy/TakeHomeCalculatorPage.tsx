import { useState } from "react";
import { ToolPage } from "./tools/ToolPage";
import { TakeHomeForm } from "./TakeHomeForm";
import { TakeHomeResult } from "./TakeHomeResult";
import type { TaxYear } from "./tax.calc";
import type { ActivityKey, StartupYear, WorkerStatus } from "./takeHome.data";

interface TakeHomeState {
  gross: string;
  activity: ActivityKey;
  year: TaxYear;
  startupYear: StartupYear;
  status: WorkerStatus;
}

const INITIAL: TakeHomeState = {
  gross: "30000",
  activity: "services",
  year: 2026,
  startupYear: 0,
  status: "freelancer",
};

/**
 * Live take-home calculator: turns a Portuguese freelancer's annual gross into
 * estimated net after IRS + Segurança Social. All math goes through
 * `estimateTakeHome` and the constants in `tax.constants.ts`.
 */
export function TakeHomeCalculatorPage() {
  const [state, setState] = useState<TakeHomeState>(INITIAL);
  const patch = (next: Partial<TakeHomeState>) =>
    setState((s) => ({ ...s, ...next }));

  return (
    <ToolPage
      eyebrow="Freelance tools"
      title={
        <>
          What you actually <em>take home.</em>
        </>
      }
      sub="Punch in your yearly gross and we'll estimate what's left after IRS and Segurança Social on the regime simplificado — recalculated live as you go."
      form={
        <TakeHomeForm
          gross={state.gross}
          activity={state.activity}
          year={state.year}
          startupYear={state.startupYear}
          status={state.status}
          onChange={patch}
        />
      }
      preview={
        <TakeHomeResult
          gross={state.gross}
          activity={state.activity}
          year={state.year}
          startupYear={state.startupYear}
          status={state.status}
        />
      }
    />
  );
}
