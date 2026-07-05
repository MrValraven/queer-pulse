import { useState } from "react";
import { Button, ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { DEMO_WAVE, HERO_SET_ART } from "./studioLanding.data";
import styles from "./StudioLandingPage.module.css";

const PayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export function StudioLandingHero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.heroInner}>
        <div>
          <div className={styles.eb}>
            <span className={styles.live} />
            <span>On the air now</span>
            <span className={styles.sep}>·</span>
            <span className={styles.clock}>Wed · 21:18 Lisbon</span>
          </div>
          <h1>
            Music, <em>programmed</em> by queer ears.
          </h1>
          <p className={styles.dek}>
            A co-op streaming room. <em>80%</em> of every listen to the artist.{" "}
            <em>100%</em> of every tip. The ledger is public. The curators have
            names. <em>No algorithm has ever set foot in here.</em>
          </p>
          <div className={styles.actions}>
            <Button variant="primary" size="lg" to={routes.sustainer}>
              Sustain the room · €7/mo
            </Button>
            <Button variant="ghost-dark" size="lg" href="#demo">
              Listen to a demo set · free
            </Button>
          </div>
        </div>

        <DemoCard />
      </div>
    </section>
  );
}

function DemoCard() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.demoCard} id="demo">
      <div className={styles.demoInner}>
        <div className={styles.demoEb}>
          <span className={styles.live} /> The Wednesday set · free preview
        </div>
        <h3>
          Vespertina, <em>vol. iv</em>
        </h3>
        <div className={styles.demoMeta}>
          programmed by Sara Marques · 1h 42m · 12 tracks · 312 listening
        </div>

        <div className={styles.demoRow}>
          <div className={styles.demoArt}>
            <ImageSlot
              src={HERO_SET_ART}
              tint="plum"
              width="100%"
              height="100%"
              radius={12}
              placeholder="cover · set art"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div>
            <div
              className={`${styles.wf} ${playing ? styles.playing : ""}`}
              aria-hidden
            >
              {DEMO_WAVE.map((bar, i) => (
                <span
                  key={i}
                  className={bar.played ? styles.played : undefined}
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
            <div className={styles.times}>
              <span className={styles.e}>1:42</span>
              <span>4:18</span>
            </div>
            <div className={styles.demoCtrl}>
              <button
                type="button"
                className={styles.demoPlay}
                aria-label={playing ? "Pause preview" : "Play preview"}
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? (
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <rect x="1" y="1" width="3.5" height="12" rx="1" />
                    <rect x="7.5" y="1" width="3.5" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 14" fill="currentColor">
                    <path d="M1 1l10 6-10 6z" />
                  </svg>
                )}
              </button>
              <div className={styles.demoInfo}>
                <div className={styles.t}>
                  Track 6 · Carta para a <em>santa</em>
                </div>
                <div className={styles.a}>
                  Mariana Sol · from Cidade dos santos
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.payPill}>
          <PayIcon />
          <span>
            This listen pays Mariana <em>€0.05</em> when you’re a sustainer.
            Right now, the room is open as a demo.
          </span>
        </div>

        <div className={styles.note}>
          “Stay through the second verse of track six.{" "}
          <em>The piano leaves you there on purpose.</em>” — Sara Marques,
          programming lead
        </div>
      </div>
    </div>
  );
}
