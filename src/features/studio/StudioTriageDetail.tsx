import { useToast } from "../../shared/components/feedback/useToast";
import { FILE, WF } from "./studioTriage.data";
import s from "./council.module.css";

export function StudioTriageDetail() {
  const { showToast } = useToast();

  return (
    <aside className={s.aside}>
      <h2>
        The piano <em>I waited for</em>
      </h2>
      <div className={s.asideWho}>Renato V. · Porto · single · 4:40</div>

      <div className={s.playerMini}>
        <div className={s.pmWf}>
          {WF.map((h, i) => (
            <span
              key={i}
              className={i < 6 ? s.played : undefined}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className={s.pmCtrl}>
          <button type="button" className={s.pmPlay} aria-label="Play">
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </button>
          <div className={s.pmTimes}>
            <span className="e" style={{ color: "var(--accent)" }}>
              1:48
            </span>
            <span>4:40</span>
          </div>
        </div>
      </div>

      <div className={s.claimRow}>
        <div className="av">SM</div>
        <div className={s.text}>
          <b>Claimed by Sara M.</b>
          You're answering this one. <em>D. Okoye second-reading queued.</em>
        </div>
      </div>

      <div className={s.detailBlock}>
        <h4>The file</h4>
        <div className={s.dGrid}>
          {FILE.map(([k, v], i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className={s.k}>{k}</span>
              <span className={s.v}>{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={s.detailBlock}>
        <h4>What other curators flagged (3)</h4>
        <p style={{ fontStyle: "italic", color: "rgba(247,243,238,.6)" }}>
          D. Okoye: "the bridge at 2:14 is the thing." · João R.: "PT feels
          regional — Porto, not Lisbon." · Yara R.: "i'd put this on the
          standards collection in a year, easily."
        </p>
      </div>

      <h3 className={s.shortlistH}>
        Your <em>answer</em>
      </h3>
      <div className={s.decision}>
        <h4>
          If you pass — write one sentence. This goes to Renato as the answer.
        </h4>
        <textarea placeholder="A small sentence that explains the no. We never send a form letter, ever." />
        <div
          className="hint"
          style={{
            fontSize: 11.5,
            color: "rgba(247,243,238,.5)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            marginTop: 8,
          }}
        >
          Required for pass.{" "}
          <em style={{ color: "var(--accent)" }}>Not required</em> for slate.
        </div>
        <div
          className="actions"
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={s.bt}
            onClick={() => showToast("Held for a second read", "info")}
          >
            Hold &amp; second-read
          </button>
          <button
            type="button"
            className={s.bt}
            onClick={() =>
              showToast("Passed with your sentence — sent to Renato", "success")
            }
          >
            Pass · with the sentence
          </button>
          <button
            type="button"
            className={`${s.bt} ${s.btP}`}
            onClick={() => showToast("Added to the next slate", "success")}
          >
            ＋ Add to next slate
          </button>
        </div>
      </div>
    </aside>
  );
}
