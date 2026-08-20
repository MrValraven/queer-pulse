import { useState } from "react";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { AppealResultPanel } from "./AppealPanels";
import { buildAppealResultConfigs, type AppealTone } from "./appealPanels.data";
import { AppealOutcomeLive } from "./AppealOutcomeLive";
import { QuickExit } from "./QuickExit";
import s from "./flows.module.css";

type State = AppealTone;

const STATES: { id: State; labelKey: string }[] = [
  { id: "pending", labelKey: "safety:appeal.state.pending" },
  { id: "overturned", labelKey: "safety:appeal.state.overturned" },
  { id: "upheld", labelKey: "safety:appeal.state.upheld" },
];

/**
 * Demo-only showcase: the original interactive three-way toggle over the
 * pending/overturned/upheld mock result panels. Never rendered in live mode
 * — `AppealOutcomePage` branches on `useDemoMode()` before this ever mounts,
 * so there is nothing here for a real member to mistake for their own status.
 */
function AppealOutcomeDemo() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [state, setState] = useState<State>("pending");
  const configs = buildAppealResultConfigs(t, fmt);

  return (
    <>
      <div className={s.stateBar}>
        {STATES.map((st) => (
          <button
            type="button"
            key={st.id}
            className={[s.stateBtn, state === st.id && s.stateBtnActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setState(st.id)}
          >
            {t(st.labelKey)}
          </button>
        ))}
      </div>

      <AppealResultPanel config={configs[state]} />
    </>
  );
}

/**
 * `/safety/appeal-outcome` — where a member tracks their appeal. Demo mode
 * keeps the interactive toggle showcase (`AppealOutcomeDemo`); live mode
 * fetches the member's real appeal via `GET /appeals/me` (`AppealOutcomeLive`)
 * instead of narrating whichever demo state was last clicked. `QuickExit` is
 * mounted here (not just on the report/hate-crime pages) because a member
 * reading a real appeal outcome — especially an upheld suspension/ban — is
 * exactly the kind of high-stakes moment the quick-exit safety net exists for.
 */
export function AppealOutcomePage() {
  const { demoMode } = useDemoMode();

  return (
    <>
      <div className={s.page}>
        {demoMode ? <AppealOutcomeDemo /> : <AppealOutcomeLive />}
      </div>
      <QuickExit />
      <Footer />
    </>
  );
}
