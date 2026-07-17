import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  DEVICES,
  INITIAL_CUES,
  INITIAL_TIPS,
  INCOMING_TIPS,
  TALKBACK,
  CUE_BADGE_LABEL_KEYS,
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
  const { t } = useTranslation();
  const [selected, setSelected] = useState(DEVICES[0]!.id);
  return (
    <div className={s.col}>
      <div className={s.panel}>
        <div className={s.panelLbl}>
          {t("studio:broadcast.audioIn.panelLabel")}
        </div>
        {DEVICES.map((device) => (
          <button
            key={device.id}
            type="button"
            className={`${s.dev} ${selected === device.id ? s.on : ""}`}
            onClick={() => setSelected(device.id)}
            aria-pressed={selected === device.id}
          >
            <div className={s.devTop}>
              <span className={s.radio} />
              <span className={s.devName}>{device.name}</span>
            </div>
            <div className={s.devSub}>{device.sub}</div>
          </button>
        ))}
        <div style={{ marginTop: 18 }}>
          <LevelMeter reduced={reduced} />
        </div>
      </div>
      <div className={s.panel}>
        <div className={s.camCard}>
          <div className={s.camText}>
            <div className={s.camName}>
              {t("studio:broadcast.audioIn.singleCamVideo")}
            </div>
            <div className={s.camSub}>
              {t("studio:broadcast.audioIn.cameraNote")}
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
  const { t } = useTranslation();
  const [cues, setCues] = useState<Cue[]>(INITIAL_CUES);
  const [draft, setDraft] = useState("");
  const nextId = useRef(100);

  function addCue(event: React.FormEvent) {
    event.preventDefault();
    const raw = draft.trim();
    if (!raw) return;
    const [title, whoRaw] = raw.split(/\s+[—-]\s+/);
    const cue: Cue = {
      id: nextId.current++,
      time: cues[0]?.time ?? "00:00:00",
      pre: (title ?? raw) + " ",
      em: "",
      who: whoRaw ?? t("studio:broadcast.nowPlaying.justAdded"),
      meta: t("studio:broadcast.nowPlaying.liveYourOwn"),
      badge: "onair",
    };
    setCues((prev) => [
      cue,
      ...prev.map((existingCue, cueIndex) =>
        cueIndex === 0 && existingCue.badge === "onair"
          ? {
              ...existingCue,
              badge: "matched" as const,
              meta: "matched",
            }
          : existingCue,
      ),
    ]);
    setDraft("");
  }

  return (
    <div className={s.col}>
      <div className={s.nowCard}>
        <div className={s.nowEb}>
          <span className={`${s.liveDot} ${reduced ? s.staticDot : ""}`} />
          {t("studio:broadcast.nowPlaying.onAirNow")}
        </div>
        <div className={s.nowTitle}>
          Carta para a <em>santa</em>
        </div>
        <Equaliser reduced={reduced} />
      </div>

      <div>
        <div className={s.setLbl}>
          <Translation
            i18nKey="studio:broadcast.nowPlaying.setListLabel"
            components={{ em: <em /> }}
          />
        </div>
        <form className={s.setForm} onSubmit={addCue}>
          <input
            className={s.setInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("studio:broadcast.nowPlaying.inputPlaceholder")}
            aria-label={t("studio:broadcast.nowPlaying.inputAria")}
          />
          <Button variant="jade" type="submit">
            {t("studio:broadcast.nowPlaying.addCta")}
          </Button>
        </form>

        {cues.map((cue) => (
          <div key={cue.id} className={s.cue}>
            <span className={s.cueTime}>{cue.time}</span>
            <div>
              <div className={s.cueTitle}>
                {cue.pre}
                {cue.em && <em>{cue.em}</em>}
                {cue.post}
              </div>
              <div className={s.cueWho}>
                {cue.who} · {cue.meta}
              </div>
            </div>
            <span className={`${s.badge} ${badgeClass[cue.badge]}`}>
              {t(CUE_BADGE_LABEL_KEYS[cue.badge])}
            </span>
          </div>
        ))}

        <div className={s.cueFoot}>
          <Translation
            i18nKey="studio:broadcast.nowPlaying.footer"
            components={{ em: <em /> }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- RIGHT: tips / talkback ---------- */
export function AsideColumn({ reduced }: { reduced: boolean }) {
  const fmt = useFormat();
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

  const total = tips.reduce((sum, tip) => sum + tip.amount, 0);

  return (
    <div className={s.col}>
      <div className={s.panel}>
        <div className={s.tabs}>
          <button
            type="button"
            className={`${s.tab} ${tab === "tips" ? s.active : ""}`}
            onClick={() => setTab("tips")}
          >
            <Translation
              i18nKey="studio:broadcast.aside.tipsTab"
              components={{ em: <em /> }}
              values={{ amount: fmt.currency(total) }}
            />
          </button>
          <button
            type="button"
            className={`${s.tab} ${tab === "talkback" ? s.active : ""}`}
            onClick={() => setTab("talkback")}
          >
            <Translation
              i18nKey="studio:broadcast.aside.talkbackTab"
              components={{ em: <em /> }}
              values={{ count: TALKBACK.length }}
            />
          </button>
        </div>

        {tab === "tips" ? (
          <>
            <div className={s.tipList}>
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className={`${s.tip} ${reduced ? s.tipStatic : ""}`}
                >
                  <span className={s.tipAv}>{tip.initials}</span>
                  <div className={s.tipBody}>
                    <div className={s.tipTop}>
                      <span className={s.tipName}>{tip.name}</span>
                      <span className={s.tipAmount}>
                        {fmt.currency(tip.amount)}
                      </span>
                    </div>
                    <div
                      className={`${s.tipNote} ${tip.privateTip ? s.priv : ""}`}
                    >
                      {tip.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.tipTotal}>
              <div className={s.tipTotalLbl}>
                <Translation
                  i18nKey="studio:broadcast.aside.tipsTotalLabel"
                  components={{ em: <em /> }}
                />
              </div>
              <div className={s.tipTotalV}>{fmt.currency(total)}</div>
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  return (
    <>
      {TALKBACK.map((message) => (
        <div
          key={message.id}
          className={`${s.tb} ${message.own ? s.tbOwn : ""}`}
        >
          <span className={s.tbAv}>{message.initials}</span>
          <div className={s.tbBody}>
            <div className={s.tbName}>
              {message.name}
              {message.role && <em> · {message.role}</em>}
            </div>
            <div className={s.tbText}>{message.text}</div>
          </div>
        </div>
      ))}
      <form
        className={s.tbForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          showToast(t("studio:broadcast.aside.talkback.sentToast"), "success");
          setDraft("");
        }}
      >
        <input
          className={s.tbInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("studio:broadcast.aside.talkback.placeholder")}
          aria-label={t("studio:broadcast.aside.talkback.aria")}
        />
        <Button variant="ghost-dark" type="submit">
          {t("studio:broadcast.aside.talkback.sendCta")}
        </Button>
      </form>
    </>
  );
}
