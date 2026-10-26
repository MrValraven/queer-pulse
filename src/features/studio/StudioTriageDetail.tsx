import { useId, useMemo, useState } from "react";
import { FiPause, FiPlay, FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, IconButton } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioIconSwap } from "./player/ui/StudioIconSwap";
import { buildFile, WF, type Sub } from "./studioTriage.data";
import {
  triageDetailOf,
  type TriageSubmissionDetail,
} from "./StudioTriageDetail.data";
import s from "./council.module.css";
import css from "./StudioTriage.module.css";

/** The demo's mini player: the waveform and Play, which marks the bars as
 *  heard while it runs (the demo has no audio for submissions). */
function TriagePlayerMini({ detail }: { detail: TriageSubmissionDetail }) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const playedBars = isPlaying ? WF.length : detail.playedBars;
  return (
    <div className={s.playerMini}>
      <div className={s.pmWf}>
        {WF.map((barHeight, barIndex) => (
          <span
            key={barIndex}
            className={barIndex < playedBars ? s.played : undefined}
            style={{ height: `${barHeight}%` }}
          />
        ))}
      </div>
      <div className={s.pmCtrl}>
        <IconButton
          size="sm"
          tooltip
          aria-label={t(
            isPlaying
              ? "studio:triage.detail.pauseAria"
              : "studio:triage.detail.playAria",
          )}
          onClick={() => setIsPlaying((wasPlaying) => !wasPlaying)}
        >
          <StudioIconSwap iconKey={isPlaying ? "pause" : "play"}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </StudioIconSwap>
        </IconButton>
        <div className={s.pmTimes}>
          <span>{detail.durationLabel}</span>
        </div>
      </div>
    </div>
  );
}

/** "Your answer": the pass sentence and the three decisions. The decision
 *  is held in local state and shown under the actions, so it is visibly
 *  recorded; a bare toast alone would imply it was saved (Studio is coming
 *  soon in live). */
function TriageDecision({ artistName }: { artistName: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const noteId = useId();
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<string | null>(null);
  const trimmedNote = note.trim();

  function record(message: string, tone: "info" | "success") {
    setDecision(message);
    showToast(message, tone);
  }

  return (
    <div className={s.decision}>
      <h4>{t("studio:triage.detail.decision.heading", { artistName })}</h4>
      <textarea
        id={noteId}
        aria-label={t("studio:triage.detail.decision.placeholder")}
        placeholder={t("studio:triage.detail.decision.placeholder")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className={s.hint}>
        <Translation
          i18nKey="studio:triage.detail.decision.hint"
          components={{ em: <em /> }}
        />
      </div>
      <div className={s.actions}>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => record(t("studio:triage.detail.toast.held"), "info")}
        >
          {t("studio:triage.detail.holdCta")}
        </Button>
        <Button
          variant="quiet"
          size="sm"
          onClick={() =>
            record(
              t("studio:triage.detail.toast.passed", { artistName }),
              "success",
            )
          }
        >
          {t("studio:triage.detail.passCta")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            record(t("studio:triage.detail.toast.addedToSlate"), "success")
          }
        >
          <FiPlus aria-hidden /> {t("studio:triage.detail.addToSlateCta")}
        </Button>
      </div>
      <div role="status">
        <Collapse isOpen={decision !== null}>
          <div className={css.decisionRecord}>
            <b>{decision}</b>
            {trimmedNote ? (
              <p className={css.decisionNote}>&ldquo;{trimmedNote}&rdquo;</p>
            ) : null}
          </div>
        </Collapse>
      </div>
    </div>
  );
}

/** The selected submission: title, who, the mini player, the claim, the
 *  file and what other curators flagged, then the answer. The page keys it
 *  by submission, so picking another row starts a fresh answer. */
export function StudioTriageDetail({
  submission,
  id,
}: {
  submission: Sub;
  id?: string;
}) {
  const { t } = useTranslation();
  const detail = triageDetailOf(submission);
  const fileRows = useMemo(() => buildFile(t), [t]);
  return (
    <aside
      className={s.aside}
      id={id}
      aria-label={t("studio:triage.detail.regionLabel")}
    >
      <h2>
        {submission.titlePre}
        {submission.titleEm ? <em>{submission.titleEm}</em> : null}
      </h2>
      <div className={s.asideWho}>{detail.artistLine || submission.who}</div>
      <TriagePlayerMini detail={detail} />
      {detail.claim ? (
        <div className={s.claimRow}>
          <div className={s.av}>{detail.claim.initials}</div>
          <div className={`${s.text} ${css.claimText}`}>
            <b>
              {t("studioShowcase:triage.detail.claim.headline", {
                name: detail.claim.claimantName,
              })}
            </b>
            {t("studioShowcase:triage.detail.claim.note")}{" "}
            <em>
              {t("studioShowcase:triage.detail.claim.secondReader", {
                name: detail.claim.secondReaderName,
              })}
            </em>
          </div>
        </div>
      ) : null}
      <div className={s.detailBlock}>
        <h4>{t("studio:triage.detail.fileHeading")}</h4>
        {detail.hasFileSheet ? (
          <dl className={s.dGrid}>
            {fileRows.map(([labelKey, value]) => (
              <div key={labelKey} className={css.fileRow}>
                <dt className={s.k}>{t(labelKey)}</dt>
                <dd className={s.v}>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <ul className={css.metaList}>
            {submission.meta.map((metaItem, metaIndex) => (
              <li key={metaIndex}>{metaItem}</li>
            ))}
          </ul>
        )}
      </div>
      {detail.flagged.length > 0 ? (
        <div className={s.detailBlock}>
          <h4>
            {t("studio:triage.detail.flaggedHeading", {
              count: detail.flagged.length,
            })}
          </h4>
          <ul className={css.flaggedList}>
            {detail.flagged.map(({ curator, quoteKey }) => (
              <li key={curator}>
                {curator}: &ldquo;{t(quoteKey)}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <h3 className={s.shortlistH}>
        <Translation
          i18nKey="studio:triage.detail.answerHeading"
          components={{ em: <em /> }}
        />
      </h3>
      <TriageDecision artistName={detail.artistName} />
    </aside>
  );
}
