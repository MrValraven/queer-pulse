import { FiCheck } from "react-icons/fi";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { TRACKS, PASTE } from "./studioSetSubmission.data";
import s from "./funding.module.css";

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
        <span className={s.ok}>Uploaded</span>
      </div>

      <div className={s.secLbl}>
        Paste your tracklist · timecode — artist — title
      </div>
      <textarea className={s.paste} defaultValue={PASTE} />
      <div className={s.pasteHint}>
        One line per track. We accept most formats. <em>Re-run the matcher</em>{" "}
        whenever you edit.
      </div>
      <button
        type="button"
        className={`${s.bt} ${s.btP}`}
        style={{ marginTop: 14 }}
        onClick={onRun}
        disabled={running}
      >
        {running ? "Matching…" : "▸ Run the matcher"}
      </button>

      {ran && (
        <>
          <div className={s.secLbl} style={{ marginTop: 22 }}>
            Matcher results ·{" "}
            <em>resolved against the catalogue + PRO database</em>
          </div>
          <div className={s.matcher}>
            {TRACKS.map((t, i) => (
              <FadeIn
                key={t.tc}
                delay={Math.min(i, 8) * 60}
                className={s.mtRow}
              >
                <span className={s.tc}>{t.tc}</span>
                <span className={s.cv}>
                  <ImageSlot
                    src={t.image}
                    tint={t.tint}
                    width={36}
                    height={36}
                    radius={6}
                    placeholder=""
                  />
                </span>
                <div>
                  <h5>{t.m ? <em>{t.title}</em> : t.title}</h5>
                  <p>
                    {t.m ? (
                      <>
                        {t.who} · <em>€0.05/play to {t.who.split(" ")[0]}</em>
                      </>
                    ) : (
                      "no source found · payout held"
                    )}
                  </p>
                </div>
                {t.m ? (
                  <span className={`${s.st} ${s.stMatched}`}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.4}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Matched
                  </span>
                ) : (
                  <span className={s.st}>
                    <span
                      className={s.resolve}
                      onClick={() =>
                        showToast(
                          "Search opened to identify this track",
                          "info",
                        )
                      }
                    >
                      Identify
                    </span>
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
