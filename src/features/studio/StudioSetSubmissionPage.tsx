import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { StudioShell } from "./StudioShell";
import { StudioSetMatcher } from "./StudioSetMatcher";
import { StudioSetSidebar } from "./StudioSetSidebar";
import { useToast } from "../../shared/components/feedback/useToast";
import { TRACKS } from "./studioSetSubmission.data";
import s from "./funding.module.css";

export function StudioSetSubmissionPage() {
  const { showToast } = useToast();
  const [ran, setRan] = useState(true);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const matched = TRACKS.filter((t) => t.m).length;
  const held = TRACKS.length - matched;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function runMatcher() {
    if (running) return;
    setRunning(true);
    setRan(false);
    timer.current = window.setTimeout(() => {
      setRunning(false);
      setRan(true);
      showToast(
        `${matched} of ${TRACKS.length} matched · ${held} held for clearance`,
        "success",
      );
    }, 900);
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={`${s.eb} ${s.ebAccent}`}>
            New submission · DJ set or mix
          </div>
          <h1>
            Submit a <em>set</em>.
          </h1>
          <div className={s.dek}>
            Upload the long-form file, paste your tracklist with timecodes, and
            our matcher finds the source artists so{" "}
            <em>every track in the set pays its maker</em>. Unmatched tracks
            hold their payout safely until cleared — nobody loses a cent.
          </div>
        </div>

        <div className={s.djSteps}>
          <div className={`${s.djStep} ${s.djStepDone}`}>
            <span className={s.num}>
              <FiCheck />
            </span>
            File
          </div>
          <span className={s.djBar} />
          <div className={`${s.djStep} ${s.djStepOn}`}>
            <span className={s.num}>2</span>Tracklist &amp; matcher
          </div>
          <span className={s.djBar} />
          <div className={s.djStep}>
            <span className={s.num}>3</span>Notes &amp; publish
          </div>
        </div>

        <div className={s.djGrid}>
          <StudioSetMatcher ran={ran} running={running} onRun={runMatcher} />
          <StudioSetSidebar matched={matched} held={held} />
        </div>
      </div>
    </StudioShell>
  );
}
