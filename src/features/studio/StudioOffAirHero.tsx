import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { nightcapImage } from "./studioOffAir.data";
import styles from "./StudioOffAirPage.module.css";

export function StudioOffAirHero() {
  const { showToast } = useToast();
  return (
    <section className={styles.offairHero}>
      <div className={styles.offairInner}>
        <div className={styles.offairEb}>
          <svg
            className={styles.moon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          Off air · 03:14 in Lisbon
          <span className={styles.sep} aria-hidden />
          the room is dark
        </div>

        <h1>
          The room is <em>closed</em> for the night.
        </h1>

        <p className={styles.signoff}>
          "We played fourteen songs and paid fourteen people. Go to sleep — the
          catalogue stays open, and we'll be back when the kettle's on."
          <span className={styles.signoffWho}>
            — Sara Marques, closing the Wednesday set at 01:58
          </span>
        </p>

        {/* Next broadcast */}
        <div className={styles.nextStrip}>
          <div className={styles.clock}>
            <div className={styles.clockTime}>
              <em>04</em>:46
            </div>
            <div className={styles.clockLabel}>until doors</div>
          </div>
          <div className={styles.vr} aria-hidden />
          <div className={styles.nsInfo}>
            <div className={styles.nsEb}>Next broadcast · 08:00 Lisbon</div>
            <h3>
              Morning pages with <em>D. Okoye</em>
            </h3>
            <p>Ambient &amp; trans composers · 90 minutes · captioned live</p>
          </div>
        </div>

        {/* Night-cap replay */}
        <div className={styles.nightcap}>
          <div className={styles.ncCover}>
            <ImageSlot
              src={nightcapImage}
              tint="plum"
              width={78}
              height={78}
              radius={10}
              placeholder="set art"
            />
          </div>
          <div className={styles.ncInfo}>
            <div className={styles.ncEb}>Last night's night-cap</div>
            <h3>
              Vespertina, <em>vol. iv</em>
            </h3>
            <p>
              Sara Marques · 1h 42m · 12 tracks · €8.20 paid out · replay any
              time
            </p>
          </div>
          <button
            type="button"
            className={styles.playBig}
            aria-label="Replay the night-cap"
            onClick={() =>
              showToast("Replaying Vespertina, vol. iv", "success")
            }
          >
            <svg viewBox="0 0 12 14" fill="currentColor" aria-hidden>
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
