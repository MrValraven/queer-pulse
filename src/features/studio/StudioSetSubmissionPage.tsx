import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { StudioShell } from "./StudioShell";
import { StudioSetMatcher } from "./StudioSetMatcher";
import { StudioSetSidebar } from "./StudioSetSidebar";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TRACKS } from "./studioSetSubmission.data";
import s from "./funding.module.css";

export function StudioSetSubmissionPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [ran, setRan] = useState(true);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const matched = TRACKS.filter((track) => track.m).length;
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
        t("studio:setSubmission.matcher.matchedResultToast", {
          matched,
          total: TRACKS.length,
          held,
        }),
        "success",
      );
    }, 900);
  }

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={`${s.eb} ${s.ebAccent}`}>
            {t("studio:setSubmission.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="studio:setSubmission.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>
            <Translation
              i18nKey="studio:setSubmission.hero.dek"
              components={{ em: <em /> }}
            />
          </div>
        </div>

        <div className={s.djSteps}>
          <div className={`${s.djStep} ${s.djStepDone}`}>
            <span className={s.num}>
              <FiCheck />
            </span>
            {t("studio:setSubmission.steps.file")}
          </div>
          <span className={s.djBar} />
          <div className={`${s.djStep} ${s.djStepOn}`}>
            <span className={s.num}>2</span>
            {t("studio:setSubmission.steps.tracklist")}
          </div>
          <span className={s.djBar} />
          <div className={s.djStep}>
            <span className={s.num}>3</span>
            {t("studio:setSubmission.steps.notes")}
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
