import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../shared/components/layout";
import type { BlockMuteState, MuteDurationId } from "./blockMute.data";
import {
  BlockMuteBlocked,
  BlockMuteChoose,
  BlockMuteMuted,
} from "./BlockMuteScreens";
import s from "./flows.module.css";

export function BlockMutePage() {
  const navigate = useNavigate();
  const [state, setState] = useState<BlockMuteState>("choose");
  const [chosen, setChosen] = useState<"mute" | "block" | null>(null);
  const [muteDur, setMuteDur] = useState<MuteDurationId>("untilUnmute");

  return (
    <>
      <div className={s.page}>
        {state === "choose" && (
          <BlockMuteChoose
            chosen={chosen}
            onChoose={setChosen}
            muteDur={muteDur}
            onMuteDur={setMuteDur}
            onContinue={() => setState(chosen === "mute" ? "muted" : "blocked")}
            onCancel={() => navigate(-1)}
          />
        )}

        {state === "muted" && (
          <BlockMuteMuted muteDur={muteDur} onUndo={() => setState("choose")} />
        )}

        {state === "blocked" && (
          <BlockMuteBlocked onUndo={() => setState("choose")} />
        )}
      </div>
      <Footer />
    </>
  );
}
