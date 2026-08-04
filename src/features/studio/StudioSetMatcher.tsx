import { FiCheck } from "react-icons/fi";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TRACKS, PASTE } from "./studioSetSubmission.data";
import s from "./funding.module.css";

const PER_PLAY_RATE = 0.05;

interface StudioSetMatcherProps {
  ran: boolean;
  running: boolean;
  onRun: () => void;
}

export function StudioSetMatcher({
  ran,
  running,
  onRun,
}: StudioSetMatcherProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  return (
    <div>
      <div className={s.djFile}>
        <span className={s.fic}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx={6} cy={18} r={3} />
            <circle cx={18} cy={16} r={3} />
          </svg>
        </span>
        <div>
          <h5>house-for-the-tired_master.wav</h5>
          <p>
            2h 08m · 24-bit / 48kHz · 1.4 GB · loudness −9.2 LUFS <FiCheck />
          </p>
        </div>
        <span className={s.ok}>
          {t("studio:setSubmission.matcher.uploadedBadge")}
        </span>
      </div>

      <div className={s.secLbl}>
        {t("studio:setSubmission.matcher.tracklistLabel")}
      </div>
      <textarea
        className={s.paste}
        aria-label={t("studio:setSubmission.matcher.tracklistLabel")}
        defaultValue={PASTE}
      />
      <div className={s.pasteHint}>
        <Translation
          i18nKey="studio:setSubmission.matcher.pasteHint"
          components={{ em: <em /> }}
        />
      </div>
      <button
        type="button"
        className={`${s.bt} ${s.btP}`}
        style={{ marginTop: 14 }}
        onClick={onRun}
        disabled={running}
      >
        {running
          ? t("studio:setSubmission.matcher.matchingCta")
          : t("studio:setSubmission.matcher.runCta")}
      </button>

      {ran && (
        <>
          <div className={s.secLbl} style={{ marginTop: 22 }}>
            <Translation
              i18nKey="studio:setSubmission.matcher.resultsLabel"
              components={{ em: <em /> }}
            />
          </div>
          <div className={s.matcher}>
            {TRACKS.map((track, i) => (
              <FadeIn
                key={track.tc}
                delay={Math.min(i, 8) * 60}
                className={s.mtRow}
              >
                <span className={s.tc}>{track.tc}</span>
                <span className={s.cv}>
                  <ImageSlot
                    src={track.image}
                    tint={track.tint}
                    width={36}
                    height={36}
                    radius={6}
                    placeholder=""
                  />
                </span>
                <div>
                  <h5>{track.m ? <em>{track.title}</em> : track.title}</h5>
                  <p>
                    {track.m ? (
                      <Translation
                        i18nKey="studio:setSubmission.matcher.payLine"
                        components={{ em: <em /> }}
                        values={{
                          who: track.who,
                          amount: fmt.currency(PER_PLAY_RATE),
                          firstName: track.who.split(" ")[0] ?? track.who,
                        }}
                      />
                    ) : (
                      t("studio:setSubmission.matcher.noSourceFound")
                    )}
                  </p>
                </div>
                {track.m ? (
                  <span className={`${s.st} ${s.stMatched}`}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {t("studio:setSubmission.matcher.matchedBadge")}
                  </span>
                ) : (
                  <span className={s.st}>
                    <button
                      type="button"
                      className={s.resolve}
                      onClick={() =>
                        showToast(
                          t("studio:setSubmission.matcher.identifyToast"),
                          "info",
                        )
                      }
                    >
                      {t("studio:setSubmission.matcher.identifyCta")}
                    </button>
                  </span>
                )}
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
