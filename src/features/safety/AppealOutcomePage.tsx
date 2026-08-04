import { useState } from "react";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AppealResultPanel } from "./AppealPanels";
import { buildAppealResultConfigs, type AppealTone } from "./appealPanels.data";
import s from "./flows.module.css";

type State = AppealTone;

const STATES: { id: State; labelKey: string }[] = [
  { id: "pending", labelKey: "safety:appeal.state.pending" },
  { id: "overturned", labelKey: "safety:appeal.state.overturned" },
  { id: "upheld", labelKey: "safety:appeal.state.upheld" },
];

export function AppealOutcomePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [state, setState] = useState<State>("pending");
  const configs = buildAppealResultConfigs(t, fmt);

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

        <AppealResultPanel config={configs[state]} />
      </div>
      <Footer />
    </>
  );
}
