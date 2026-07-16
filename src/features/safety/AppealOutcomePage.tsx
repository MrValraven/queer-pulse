import { useState } from "react";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AppealOverturnedPanel,
  AppealPendingPanel,
  AppealUpheldPanel,
} from "./AppealPanels";
import s from "./flows.module.css";

type State = "pending" | "overturned" | "upheld";

const STATES: { id: State; labelKey: string }[] = [
  { id: "pending", labelKey: "safety:appeal.state.pending" },
  { id: "overturned", labelKey: "safety:appeal.state.overturned" },
  { id: "upheld", labelKey: "safety:appeal.state.upheld" },
];

export function AppealOutcomePage() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>("pending");

  return (
    <>
      <div className={s.page}>
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

        {state === "pending" && <AppealPendingPanel />}
        {state === "overturned" && <AppealOverturnedPanel />}
        {state === "upheld" && <AppealUpheldPanel />}
      </div>
      <Footer />
    </>
  );
}
