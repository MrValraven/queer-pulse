import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { memberName } from "../members/data/members";
import { ImageSlot, FadeIn } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { useToast } from "../../shared/components/feedback/useToast";
import s from "./funding.module.css";

const TRACKS: {
  tc: string;
  who: string;
  title: string;
  m: boolean;
  tint: "coral" | "plum" | "jade";
  image?: string;
}[] = [
  {
    tc: "00:00",
    who: memberName("ines"),
    title: "A summer in Cascais",
    m: true,
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop",
  },
  {
    tc: "06:40",
    who: "Akin Diallo",
    title: "Salt water, slowly",
    m: true,
    tint: "plum" as const,
    image:
      "https://images.unsplash.com/photo-1682579280153-5ea1d3bb95ac?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "12:18",
    who: "",
    title: "unknown bootleg edit",
    m: false,
    tint: "plum" as const,
    image:
      "https://images.unsplash.com/photo-1685378338540-30a5d312282f?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "18:30",
    who: "Yara Reis",
    title: "If you have to ask",
    m: true,
    tint: "jade" as const,
    image:
      "https://images.unsplash.com/photo-1709562499710-eaaf84729550?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "24:52",
    who: "Coro de Outubro",
    title: "Cantiga para a vizinha",
    m: true,
    tint: "plum" as const,
    image:
      "https://images.unsplash.com/photo-1721539584859-9fea914ae2fe?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "31:10",
    who: "",
    title: "white label — ID / ID",
    m: false,
    tint: "coral" as const,
    image:
      "https://images.unsplash.com/photo-1721539584865-134ea847dbaf?q=80&w=800&auto=format&fit=crop",
  },
  {
    tc: "37:44",
    who: "Mariana Sol",
    title: "Carta para a santa",
    m: true,
    tint: "coral" as const,
    image:
      "https://images.unsplash.com/photo-1722868453706-b248a23c6b54?q=80&w=800&auto=format&fit=crop",
  },
];

const PASTE = `00:00  ${memberName("ines")} — A summer in Cascais
06:40  Akin Diallo — Salt water, slowly
12:18  (unknown bootleg edit)
18:30  Yara Reis — If you have to ask
24:52  Coro de Outubro — Cantiga para a vizinha
31:10  white label — ID / ID
37:44  Mariana Sol — Carta para a santa`;

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
                  2h 08m · 24-bit / 48kHz · 1.4 GB · loudness −9.2 LUFS{" "}
                  <FiCheck />
                </p>
              </div>
              <span className={s.ok}>Uploaded</span>
            </div>

            <div className={s.secLbl}>
              Paste your tracklist · timecode — artist — title
            </div>
            <textarea className={s.paste} defaultValue={PASTE} />
            <div className={s.pasteHint}>
              One line per track. We accept most formats.{" "}
              <em>Re-run the matcher</em> whenever you edit.
            </div>
            <button
              className={`${s.bt} ${s.btP}`}
              style={{ marginTop: 14 }}
              onClick={runMatcher}
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
                              {t.who} ·{" "}
                              <em>€0.05/play to {t.who.split(" ")[0]}</em>
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

          <div className={s.djSide}>
            <div className={s.djCard}>
              <h3>
                Set <em>details</em>
              </h3>
              <div className={s.field}>
                <label>Set title</label>
                <input type="text" defaultValue="House for the tired" />
              </div>
              <div className={s.field}>
                <label>Type</label>
                <select defaultValue="Live DJ set">
                  <option>Live DJ set</option>
                  <option>Studio mix</option>
                  <option>Recorded broadcast</option>
                </select>
              </div>
            </div>

            <div className={s.djCard}>
              <h3>
                Payout <em>preview</em>
              </h3>
              <div className={s.djRow}>
                <span>Tracks in set</span>
                <span
                  className="v"
                  style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
                >
                  {TRACKS.length}
                </span>
              </div>
              <div className={s.djRow}>
                <span>Matched &amp; paying</span>
                <span
                  className={`${s.v} jade`}
                  style={{
                    fontFamily: "var(--serif)",
                    color: "var(--jade-light)",
                  }}
                >
                  {matched} tracks
                </span>
              </div>
              <div className={s.djRow}>
                <span>On hold (unmatched)</span>
                <span
                  className={`${s.v} warn`}
                  style={{ fontFamily: "var(--serif)", color: "var(--accent)" }}
                >
                  {held} tracks
                </span>
              </div>
              <div className={s.djRow}>
                <span>Set payout pool</span>
                <span
                  className="v"
                  style={{ fontFamily: "var(--serif)", color: "var(--cream)" }}
                >
                  €
                  <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
                    11.40
                  </em>
                </span>
              </div>
              <div className={s.holdNote}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>
                  Unmatched tracks <em>hold their share</em> until the council's
                  matcher clears them. The set goes live now; held money
                  releases the moment a source is confirmed.
                </span>
              </div>
            </div>

            <button
              className={`${s.bt} ${s.btJade} ${s.btLg}`}
              onClick={() =>
                showToast(
                  "Set submitted — live now, held shares pending clearance",
                  "success",
                )
              }
            >
              Submit set →
            </button>
          </div>
        </div>
      </div>
    </StudioShell>
  );
}
