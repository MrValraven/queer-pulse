import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./AudioPlayerPage.module.css";

const SHOW = linkToPath("QueerPulse Podcast Show.html");
const HOME = "/";
const MEMBER = linkToPath("QueerPulse Profile.html");
const ARTICLE = linkToPath("QueerPulse Article.html");

type TabId = "notes" | "chapters" | "transcript";
const SPEEDS = ["0.8×", "1.0×", "1.2×", "1.5×", "2.0×"];

const CHAPTERS = [
  { time: "00:00", title: 'Cold open · "I make €38 less per hour than my non-affirming colleagues"' },
  { time: "05:23", title: "How Inês ended up in Anjos · the Amsterdam years" },
  { time: "19:42", title: "The 2022 protocol · what it actually says", current: true },
  { time: "30:45", title: "The morning her boss tried to fire her" },
  { time: "39:24", title: "Saturday phone calls · the unwritten part of the job" },
  { time: "47:00", title: "What she'd want a young GP to know · closing" },
];

const TRANSCRIPT = [
  { who: "Catarina", time: "00:01", text: "Inês, thank you for staying past closing. Set the scene — for someone who's never been here, what do we see when we walk in?" },
  { who: "Inês", time: "00:14", text: "The first thing you see is the reception desk, but the second thing you see is that there isn't a reception form. It's been that way since 2022. People come in, give a name — whichever name they want — and we go from there. The receptionist has a small notebook and a very good memory." },
  { who: "Catarina", time: "00:42", text: "That's the protocol change you're famous for. But that's only one of about a dozen, right?" },
  { who: "Inês", time: "19:42", text: "So the protocol — the actual document — is two pages. People assume it's enormous because of how much friction it removed, but it's two pages. The first page is everything we stopped asking. The second page is everything we instead looked up from the patient's existing chart, with their consent, before they walked in.", current: true },
  { who: "Catarina", time: "20:18", text: "And the bureaucratic gauntlet on the way to getting that signed off was — how long?" },
  { who: "Inês", time: "20:25", text: "Eight months. Most of which was about who's liable if a patient is \"misidentified\" — a word I am, to be clear, not using approvingly. The legal team got there. Eventually." },
];

export function AudioPlayerPage() {
  const { showToast } = useToast();
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState("1.0×");
  const [tab, setTab] = useState<TabId>("notes");
  const [chapter, setChapter] = useState(2);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  const share = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(location.href);
    showToast("Link copied", "success");
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to={SHOW} className={styles.back}>
          ← Back to show
        </Link>
        <Link to={HOME} className={styles.brand}>
          <span className={styles.brandDot} />
          Queer<span className={styles.brandItalic}>Pulse</span>
        </Link>
        <div className={styles.extra}>
          <button type="button" className={styles.iconBtn} title="Share" onClick={share}>
            <svg viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            title="Cast / AirPlay"
            onClick={() => showToast("Looking for nearby devices", "info")}
          >
            <svg viewBox="0 0 24 24">
              <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
              <line x1="2" y1="20" x2="2.01" y2="20" />
            </svg>
          </button>
        </div>
      </div>

      <main className={styles.wrap}>
        <div className={styles.cover}>The Back Room · cover art</div>
        <div className={styles.info}>
          <div className={styles.show}>
            <Link to={SHOW}>The Back Room</Link> · Episode <em>34</em>
          </div>
          <h1 className={styles.title}>
            Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>
          </h1>
          <p className={styles.guest}>
            In conversation with{" "}
            <Link to={MEMBER}>
              <b>Catarina Vaz</b>
            </Link>{" "}
            · recorded 6 May at Café Beirão · 52 min
          </p>

          <div>
            <div
              className={styles.bar}
              onClick={() => showToast("Seeking…", "info")}
            >
              <div className={styles.barFill} style={{ width: "38%" }} />
            </div>
            <div className={styles.times}>
              <span>
                <b>19:42</b>
              </span>
              <span>52:14</span>
            </div>
          </div>

          <div className={styles.controls}>
            <button type="button" className={styles.ctrl} title="Previous chapter" onClick={() => showToast("Previous chapter", "info")}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" />
              </svg>
            </button>
            <button type="button" className={styles.ctrl} title="-15s" onClick={() => showToast("-15s", "info")}>
              <svg viewBox="0 0 24 24">
                <path d="M2.5 2v6h6" />
                <path d="M21.5 12A9 9 0 1 1 6 5.3L2.5 8" />
              </svg>
            </button>
            <button type="button" className={styles.playBtn} onClick={() => setPlaying((p) => !p)}>
              {playing ? (
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <polygon points="6 4 20 12 6 20" />
                </svg>
              )}
            </button>
            <button type="button" className={styles.ctrl} title="+30s" onClick={() => showToast("+30s", "info")}>
              <svg viewBox="0 0 24 24">
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 12A9 9 0 1 0 18 5.3L21.5 8" />
              </svg>
            </button>
            <button type="button" className={styles.ctrl} title="Next chapter" onClick={() => showToast("Next chapter", "info")}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" />
              </svg>
            </button>
          </div>

          <div className={styles.secondary}>
            <div className={styles.speed}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={[styles.speedBtn, speed === s && styles.speedActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSpeed(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className={styles.actionsRow}>
              <button
                type="button"
                className={[styles.actionBtn, saved && styles.actionActive].filter(Boolean).join(" ")}
                onClick={() => setSaved((v) => !v)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Save
              </button>
              <button
                type="button"
                className={[styles.actionBtn, liked && styles.actionActive].filter(Boolean).join(" ")}
                onClick={() => setLiked((v) => !v)}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Like
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => showToast("Sleep timer · 30 min", "info")}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Sleep
              </button>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.below}>
        <div className={styles.tabs}>
          <button type="button" className={[styles.tab, tab === "notes" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("notes")}>
            Show notes
          </button>
          <button type="button" className={[styles.tab, tab === "chapters" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("chapters")}>
            Chapters · 6
          </button>
          <button type="button" className={[styles.tab, tab === "transcript" && styles.tabActive].filter(Boolean).join(" ")} onClick={() => setTab("transcript")}>
            Transcript
          </button>
        </div>

        {tab === "notes" && (
          <div className={styles.notesText}>
            <p>
              Dr. Inês Pereira is the Anjos GP who quietly changed the protocol at
              Clínica do Largo, the clinic where most of our members go for
              trans-affirming care in Lisbon. We sat with her for an hour, after
              closing time, with two glasses of port. <em>She drank one.</em>
            </p>
            <p>
              This conversation is about <strong>the fifteen minutes</strong> that most
              trans patients spend, every visit, explaining themselves before any
              clinical work begins. Inês has spent ten years removing that fifteen
              minutes from her practice — sometimes through paperwork, sometimes
              through a phone call to a pharmacist at 06:00. The result is a clinic
              with 600 trans patients and a waiting list.
            </p>
            <p>
              We talk about the protocol change of 2022, the moment she nearly quit
              medicine in 2018, why she does <em>not</em> consider herself a
              "trans-affirming GP" but rather a GP who can read a paper, and a cameo
              from her former boss who tried to fire her over it.
            </p>
            <p>
              <strong>Mentioned in this episode:</strong>
            </p>
            <p>
              Clínica do Largo · the 2022 protocol PDF (linked) · WPATH SOC 8 ·
              Farmácia do Carmo · the <Link to={ARTICLE}>cover piece of Issue 09</Link>{" "}
              by Sara Pinheiro, which prompted the recording.
            </p>
            <p>
              <strong>Music:</strong> "Verde" by Tó Cunha, used with permission. The
              Back Room is produced by Jonas Ferreira, recorded at Café Beirão, mixed
              at Atelier Pulso.
            </p>
          </div>
        )}

        {tab === "chapters" && (
          <div className={styles.chapters}>
            {CHAPTERS.map((c, i) => (
              <button
                type="button"
                key={c.time}
                className={[styles.chapter, chapter === i && styles.chapterCurrent]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setChapter(i)}
              >
                <div className={styles.chTime}>{c.time}</div>
                <div className={styles.chTitle}>{c.title}</div>
                {chapter === i ? (
                  <div className={styles.chNow}>Now</div>
                ) : (
                  <div className={styles.chArrow}>→</div>
                )}
              </button>
            ))}
          </div>
        )}

        {tab === "transcript" && (
          <>
            <div className={styles.trControls}>
              <div className={styles.trSearch}>
                <svg viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input type="text" placeholder="Search transcript" />
              </div>
              <button type="button" className={styles.actionBtn} onClick={() => showToast("Auto-scroll on", "info")}>
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                Auto-scroll
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => showToast("Download transcript .txt", "success")}>
                <svg viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
            <div className={styles.transcript}>
              {TRANSCRIPT.map((t, i) => (
                <div
                  key={i}
                  className={[styles.trBlock, t.current && styles.trCurrent]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.trWho}>
                    {t.who} <time>{t.time}</time>
                  </div>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
