import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  DEVICES,
  INITIAL_CUES,
  INITIAL_TIPS,
  INCOMING_TIPS,
  TALKBACK,
  type Cue,
  type Tip,
} from "./studioBroadcast.data";
import s from "./StudioBroadcastPage.module.css";

const badgeClass = {
  onair: s.badgeOnair,
  matched: s.badgeMatched,
  hold: s.badgeHold,
};

/* ---------- LEFT: audio in ---------- */
function LevelMeter({ reduced }: { reduced: boolean }) {
  const [levels, setLevels] = useState({ l: 62, r: 58 });
  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const rand = (n: number) => (Math.sin(i * 1.7 + n) + 1) / 2;
      setLevels({ l: 40 + rand(0) * 52, r: 40 + rand(3.3) * 52 });
    }, 140);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <div className={s.meter}>
      {(["L", "R"] as const).map((ch) => (
        <div key={ch} className={s.meterRow}>
          <span className={s.meterCh}>{ch}</span>
          <div className={s.meterTrack}>
            <div
              className={s.meterFill}
              style={{ width: `${ch === "L" ? levels.l : levels.r}%` }}
            />
          </div>
        </div>
      ))}
      <div className={s.meterScale}>
        <span>-∞</span>
        <span>-12</span>
        <span>-6</span>
        <span>0</span>
      </div>
    </div>
  );
}

export function AudioInColumn({ reduced }: { reduced: boolean }) {
  const [selected, setSelected] = useState(DEVICES[0]!.id);
  return (
    <div className={s.col}>
      <div className={s.panel}>
        <div className={s.panelLbl}>Audio in</div>
        {DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`${s.dev} ${selected === d.id ? s.on : ""}`}
            onClick={() => setSelected(d.id)}
            aria-pressed={selected === d.id}
          >
            <div className={s.devTop}>
              <span className={s.radio} />
              <span className={s.devName}>{d.name}</span>
            </div>
            <div className={s.devSub}>{d.sub}</div>
          </button>
        ))}
        <div style={{ marginTop: 18 }}>
          <LevelMeter reduced={reduced} />
        </div>
      </div>
      <div className={s.panel}>
        <div className={s.camCard}>
          <div className={s.camText}>
            <div className={s.camName}>Single-cam video</div>
            <div className={s.camSub}>
              Audio-only is the default for listening rooms. Camera ships in
              Phase 5 — flagged off for now.
            </div>
          </div>
          <span className={s.toggle} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/* ---------- CENTRE: now playing + cue sheet ---------- */
function Equaliser({ reduced }: { reduced: boolean }) {
  return (
    <div
      className={`${s.wave} ${reduced ? s.waveStatic : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className={s.waveBar}
          style={{ animationDelay: `${(i % 12) * 60}ms` }}
        />
      ))}
    </div>
  );
}

export function NowPlayingColumn({ reduced }: { reduced: boolean }) {
  const [cues, setCues] = useState<Cue[]>(INITIAL_CUES);
  const [draft, setDraft] = useState("");
  const nextId = useRef(100);

  function addCue(e: React.FormEvent) {
    e.preventDefault();
    const raw = draft.trim();
    if (!raw) return;
    const [title, whoRaw] = raw.split(/\s+[—-]\s+/);
    const cue: Cue = {
      id: nextId.current++,
      time: cues[0]?.time ?? "00:00:00",
      pre: (title ?? raw) + " ",
      em: "",
      who: whoRaw ?? "Just added",
      meta: "live, your own",
      badge: "onair",
      badgeLabel: "On air",
    };
    setCues((prev) => [
      cue,
      ...prev.map((c, i) =>
        i === 0 && c.badge === "onair"
          ? {
              ...c,
              badge: "matched" as const,
              badgeLabel: "€ matched",
              meta: "matched",
            }
          : c,
      ),
    ]);
    setDraft("");
  }

  return (
    <div className={s.col}>
      <div className={s.nowCard}>
        <div className={s.nowEb}>
          <span className={`${s.liveDot} ${reduced ? s.staticDot : ""}`} />
          On the air now
        </div>
        <div className={s.nowTitle}>
          Carta para a <em>santa</em>
        </div>
        <Equaliser reduced={reduced} />
      </div>

      <div>
        <div className={s.setLbl}>
          Set list · <em>type as you play</em> — it becomes the cue sheet on
          archive
        </div>
        <form className={s.setForm} onSubmit={addCue}>
          <input
            className={s.setInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What did you just play? Artist — title…"
            aria-label="Add a track to the set list"
          />
          <Button variant="jade" type="submit">
            Add
          </Button>
        </form>

        {cues.map((c) => (
          <div key={c.id} className={s.cue}>
            <span className={s.cueTime}>{c.time}</span>
            <div>
              <div className={s.cueTitle}>
                {c.pre}
                {c.em && <em>{c.em}</em>}
                {c.post}
              </div>
              <div className={s.cueWho}>
                {c.who} · {c.meta}
              </div>
            </div>
            <span className={`${s.badge} ${badgeClass[c.badge]}`}>
              {c.badgeLabel}
            </span>
          </div>
        ))}

        <div className={s.cueFoot}>
          Matched tracks pay their artists automatically from this set's payout.{" "}
          <em>Held tracks wait</em> until the council's matcher clears them —
          nobody loses a cent in the meantime.
        </div>
      </div>
    </div>
  );
}

/* ---------- RIGHT: tips / talkback ---------- */
export function AsideColumn({ reduced }: { reduced: boolean }) {
  const [tab, setTab] = useState<"tips" | "talkback">("tips");
  const [tips, setTips] = useState<Tip[]>(INITIAL_TIPS);
  const nextId = useRef(1000);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => {
      const pool = INCOMING_TIPS[i % INCOMING_TIPS.length]!;
      i += 1;
      setTips((prev) =>
        [{ ...pool, id: nextId.current++ }, ...prev].slice(0, 9),
      );
    }, 6500);
    return () => clearInterval(id);
  }, [reduced]);

  const total = tips.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={s.col}>
      <div className={s.panel}>
        <div className={s.tabs}>
          <button
            type="button"
            className={`${s.tab} ${tab === "tips" ? s.active : ""}`}
            onClick={() => setTab("tips")}
          >
            Live tips <em>€{total}</em>
          </button>
          <button
            type="button"
            className={`${s.tab} ${tab === "talkback" ? s.active : ""}`}
            onClick={() => setTab("talkback")}
          >
            Talkback <em>{TALKBACK.length}</em>
          </button>
        </div>

        {tab === "tips" ? (
          <>
            <div className={s.tipList}>
              {tips.map((t) => (
                <div
                  key={t.id}
                  className={`${s.tip} ${reduced ? s.tipStatic : ""}`}
                >
                  <span className={s.tipAv}>{t.initials}</span>
                  <div className={s.tipBody}>
                    <div className={s.tipTop}>
                      <span className={s.tipName}>{t.name}</span>
                      <span className={s.tipAmount}>€{t.amount}</span>
                    </div>
                    <div
                      className={`${s.tipNote} ${t.privateTip ? s.priv : ""}`}
                    >
                      {t.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.tipTotal}>
              <div className={s.tipTotalLbl}>
                Tonight, so far · <em>100% to you</em>
              </div>
              <div className={s.tipTotalV}>€{total}</div>
            </div>
          </>
        ) : (
          <TalkbackPane />
        )}
      </div>
    </div>
  );
}

function TalkbackPane() {
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  return (
    <>
      {TALKBACK.map((m) => (
        <div key={m.id} className={`${s.tb} ${m.own ? s.tbOwn : ""}`}>
          <span className={s.tbAv}>{m.initials}</span>
          <div className={s.tbBody}>
            <div className={s.tbName}>
              {m.name}
              {m.role && <em> · {m.role}</em>}
            </div>
            <div className={s.tbText}>{m.text}</div>
          </div>
        </div>
      ))}
      <form
        className={s.tbForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          showToast("Sent to your mods", "success");
          setDraft("");
        }}
      >
        <input
          className={s.tbInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Talk back to your mods (listeners can't see this)…"
          aria-label="Talk back to your mods"
        />
        <Button variant="ghost-dark" type="submit">
          Send
        </Button>
      </form>
    </>
  );
}
