import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Toggle, Seg, RadioCards } from "./StudioSettingsControls";
import {
  STREAM_QUALITY_OPTS,
  TIP_PRIVACY_OPTS,
  DOWNLOAD_QUALITY_OPTS,
  CAPTION_SIZE_OPTS,
  TIP_AMOUNTS,
} from "./studioSettings.data";
import s from "./StudioSettingsPage.module.css";

export function AudioSection() {
  const [streamQ, setStreamQ] = useState("flac");
  const [dlQ, setDlQ] = useState("FLAC");
  const [normalise, setNormalise] = useState(true);
  const [crossfade, setCrossfade] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>Audio</div>
      <h2>
        Sound <em>quality</em>
      </h2>
      <p className={s.secDek}>
        FLAC is lossless and bigger; AAC is lighter on data. Streaming and
        downloads can differ — pick per context.
      </p>
      <div className={`${s.opt} ${s.optBlock}`}>
        <div className={s.ot} style={{ marginBottom: 12 }}>
          <h4>Default streaming quality</h4>
          <p>
            On a good connection we'll go as high as you allow. We never
            auto-upgrade on cellular without asking.
          </p>
        </div>
        <RadioCards
          opts={STREAM_QUALITY_OPTS}
          active={streamQ}
          onChange={setStreamQ}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Download quality</h4>
          <p>
            What we cache when you save a track for offline (sustainers only).
          </p>
        </div>
        <Seg opts={DOWNLOAD_QUALITY_OPTS} active={dlQ} onChange={setDlQ} />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Normalise loudness</h4>
          <p>
            Even out volume across tracks and sets. <em>Off</em> if you want the
            artist's intended dynamics.
          </p>
        </div>
        <Toggle on={normalise} onToggle={() => setNormalise((v) => !v)} />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Crossfade between tracks in a set</h4>
          <p>
            Only applies inside DJ sets and live rooms, never on album playback.
          </p>
        </div>
        <Toggle on={crossfade} onToggle={() => setCrossfade((v) => !v)} />
      </div>
    </section>
  );
}

export function PrivacySection() {
  const [history, setHistory] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const [tipPrivacy, setTipPrivacy] = useState("private");
  const [receipts, setReceipts] = useState(true);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>Privacy</div>
      <h2>
        What the room <em>remembers</em>
      </h2>
      <p className={s.secDek}>
        The short version: almost nothing, by default. We never sell, share, or
        train on what you play. Aggregate plays feed the public ledger — nothing
        that identifies you.
      </p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Listening history</h4>
          <p>
            Off by default — nothing about what you played leaves your browser.
            Turn on for a private, deletable record only you can see.
          </p>
        </div>
        <Toggle on={history} onToggle={() => setHistory((v) => !v)} />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Cloud-sync my library</h4>
          <p>
            Saves and follows move between devices. Without this they live on
            this device only.
          </p>
        </div>
        <Toggle on={cloudSync} onToggle={() => setCloudSync((v) => !v)} />
      </div>
      <div className={`${s.opt} ${s.optBlock}`}>
        <div className={s.ot} style={{ marginBottom: 12 }}>
          <h4>Tip notes — who sees them</h4>
          <p>
            The note you write when you tip. <em>Private is the default</em>:
            only you and the artist ever read it.
          </p>
        </div>
        <RadioCards
          opts={TIP_PRIVACY_OPTS}
          active={tipPrivacy}
          onChange={setTipPrivacy}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Public tip receipts</h4>
          <p>
            Each tip mints a receipt showing the split — no personal data. On,
            it can be shared as a "look what the room paid this artist" card.
          </p>
        </div>
        <Toggle on={receipts} onToggle={() => setReceipts((v) => !v)} />
      </div>
    </section>
  );
}

export function CaptionsSection() {
  const [captions, setCaptions] = useState(true);
  const [captionSize, setCaptionSize] = useState("M");
  const [showBoth, setShowBoth] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>Captions &amp; lyrics</div>
      <h2>
        Words on the <em>screen</em>
      </h2>
      <p className={s.secDek}>
        Live rooms are captioned (auto, with a human pass on council
        broadcasts). Lyrics scroll in time with the track where the artist
        supplied them.
      </p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Show captions in live rooms</h4>
          <p>
            The talk between songs, transcribed. <em>On</em> by default for
            every broadcast.
          </p>
        </div>
        <Toggle on={captions} onToggle={() => setCaptions((v) => !v)} />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Caption size</h4>
          <p>How large captions and the scrolling lyric line appear.</p>
        </div>
        <Seg
          opts={CAPTION_SIZE_OPTS}
          active={captionSize}
          onChange={setCaptionSize}
        />
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Lyric language</h4>
          <p>
            Show lyrics in the original, or a community translation where one
            exists.
          </p>
        </div>
        <select className={s.selectMini}>
          <option>Original (as recorded)</option>
          <option>English translation</option>
          <option>Português</option>
          <option>Español</option>
          <option>Français</option>
        </select>
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Show both original &amp; translation</h4>
          <p>Two lines at once, original above the translation.</p>
        </div>
        <Toggle on={showBoth} onToggle={() => setShowBoth((v) => !v)} />
      </div>
    </section>
  );
}

export function TippingSection() {
  const [tipAmt, setTipAmt] = useState("€2");
  const [roundUp, setRoundUp] = useState(false);

  return (
    <section className={s.sec}>
      <div className={s.secLbl}>Tipping</div>
      <h2>
        Your default <em>tip</em>
      </h2>
      <p className={s.secDek}>
        What the one-tap tip pill sends. 100% reaches the artist — there is no
        platform cut on tips, ever.
      </p>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Default amount</h4>
          <p>You can always pick a different figure at tip time.</p>
        </div>
        <div className={s.chips}>
          {TIP_AMOUNTS.map((a) => (
            <div
              key={a}
              className={`${s.chip} ${tipAmt === a ? s.chipOn : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setTipAmt(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTipAmt(a);
                }
              }}
            >
              {a}
            </div>
          ))}
        </div>
      </div>
      <div className={s.opt}>
        <div className={s.ot}>
          <h4>Round up album buys into a tip</h4>
          <p>
            A €3.40 album becomes €4, the €0.60 going to the artist as a tip.
          </p>
        </div>
        <Toggle on={roundUp} onToggle={() => setRoundUp((v) => !v)} />
      </div>
    </section>
  );
}

export function EraseSection() {
  const { showToast } = useToast();

  return (
    <section className={s.sec}>
      <div className={`${s.secLbl} ${s.secLblDanger}`}>Erase &amp; exit</div>
      <h2>
        One tap, <em>no questions</em>
      </h2>
      <p className={s.secDek}>
        These don't ask twice and don't show a modal. We mean it: leaving should
        be as easy as arriving.
      </p>
      <div className={s.danger}>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>Erase my listening history</h4>
            <p className={s.eraseNote}>
              Wipes the private record from this device and the cloud.{" "}
              <em>Done instantly. No undo.</em>
            </p>
          </div>
          <button
            type="button"
            className={s.btDanger}
            onClick={() =>
              showToast(
                "History erased — gone from this device and the cloud.",
                "success",
              )
            }
          >
            Erase history
          </button>
        </div>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>Download everything we hold on you</h4>
            <p className={s.eraseNote}>
              A JSON of your saves, tips, receipts and settings — emailed within
              the hour.
            </p>
          </div>
          <button
            type="button"
            className={s.bt}
            onClick={() =>
              showToast("We'll email your data export within the hour.", "info")
            }
          >
            Request export
          </button>
        </div>
        <div className={s.opt}>
          <div className={s.ot}>
            <h4>Close my Studio account</h4>
            <p className={s.eraseNote}>
              Stops your sustainer fee, removes your library. Past tips stay
              paid to artists.{" "}
              <em>Banking, if you're also an artist, is untouched.</em>
            </p>
          </div>
          <button
            type="button"
            className={s.btDanger}
            onClick={() =>
              showToast("Account closure opens in a separate flow.", "info")
            }
          >
            Close account
          </button>
        </div>
      </div>
    </section>
  );
}
