import { useState } from "react";
import { Footer } from "../../shared/components/layout";
import type { LeaveState } from "./leave.data";
import {
  LeaveConfirmed,
  LeaveConsidering,
  LeavePaused,
  LeavePausing,
} from "./LeaveScreens";
import s from "./flows.module.css";

export function LeavePage() {
  const [state, setState] = useState<LeaveState>("considering");
  const [dur, setDur] = useState("1 month");

  return (
    <>
      <div className={s.page}>
        {state === "considering" && (
          <LeaveConsidering
            onPause={() => setState("pausing")}
            onDelete={() => setState("confirmed")}
          />
        )}

        {state === "pausing" && (
          <LeavePausing
            dur={dur}
            onDur={setDur}
            onBack={() => setState("considering")}
            onPaused={() => setState("paused")}
            onDelete={() => setState("considering")}
          />
        )}

        {state === "paused" && (
          <LeavePaused dur={dur} onSettings={() => setState("considering")} />
        )}

        {state === "confirmed" && <LeaveConfirmed />}
      </div>
      <Footer />
    </>
  );
}
