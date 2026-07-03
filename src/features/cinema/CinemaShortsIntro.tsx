import { Link } from "react-router-dom";
import { FiShare2 } from "react-icons/fi";
import { Avatar, Button, ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { ShortsShelf } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Programmer's weekly letter. */
export function CuratorNote() {
  return (
    <div className={styles.curatorNote}>
      <div className={styles.cnAv}>JR</div>
      <div>
        <div className={styles.cnEb}>From the programmer · week 27</div>
        <p className={styles.cnBody}>
          This week is about <em>staying</em> — films where nobody leaves the
          room, or wishes they hadn't. Start with <em>The first Sunday</em> if
          you only have half an hour, then let it lead you outward. Everything
          here was made by someone you could meet.
        </p>
        <p className={styles.cnSign}>
          — João Reis, community programmer ·{" "}
          <Link to={routes.cinemaAbout}>read past notes</Link>
        </p>
      </div>
    </div>
  );
}

/** Accessibility promise strip. */
export function AccessNote() {
  return (
    <p className={styles.accessNote}>
      <span className={styles.anDot} aria-hidden />
      <span>
        <strong>Every film is captioned.</strong> Content notes appear on each
        film, and audio-described works are marked <em>AD</em>. Filter by your
        access needs below.
      </span>
    </p>
  );
}

/** Most-watched hero film with a live tip goal. */
export function Spotlight({ shelf }: { shelf: ShortsShelf }) {
  return (
    <div className={styles.spotlight}>
      <div className={styles.spPoster}>
        <ImageSlot
          tint="coral"
          width="100%"
          height="100%"
          placeholder="spotlight poster"
          style={{ position: "absolute", inset: 0 }}
        />
        <span className={styles.spBadge}>Most watched this week</span>
      </div>
      <div className={styles.spText}>
        <div className={styles.spKicker}>
          <span className={styles.live} aria-hidden />
          Community pick · week 23
        </div>
        <h2 className={styles.spTitle}>
          The first <em>Sunday</em>
        </h2>
        <div className={styles.spMeta}>
          Inês Tavares &amp; collective · documentary · 28 min · 2026
        </div>
        <p className={styles.spDesc}>
          Inside Lisbon's first community-run queer Sunday roast at Casa do
          Comum. Made collectively, funded by 47 sustainers in 11 days through
          the spring micro-campaign. Shows what a room looks like when it
          decides to feed itself.
        </p>
        <div className={styles.spMaker}>
          <Avatar initials="IT" tint="coral" size={34} />
          <div>
            <div className={styles.name}>Inês Tavares &amp; collective</div>
            <div className={styles.grant}>
              Made with sustainer pool funding · Spring 2026
            </div>
          </div>
        </div>
        <div className={styles.spGoal}>
          <div className={styles.spGoalTop}>
            <span className={styles.gLead}>
              Tips so far: <b>€340</b> of €500 — funds the collective's next
              shoot
            </span>
            <span className={styles.gPct}>68%</span>
          </div>
          <div className={styles.spGoalBar}>
            <i style={{ width: "68%" }} />
          </div>
        </div>
        <div className={styles.spActions}>
          <Button to={routes.cinemaWatch}>Watch now · free</Button>
          <Button variant="ghost" to={`${routes.cinemaFilmmaker}/ines-tavares`}>
            Tip the collective
          </Button>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => shelf.onShare("The first Sunday")}
          >
            <FiShare2 aria-hidden />
            Share
          </button>
        </div>
        <div className={styles.spTip}>
          <strong>819 watches</strong> this week · 94 tips sent · PT spoken / EN
          subs
        </div>
        <div className={styles.spReact}>
          <span className={styles.rNote}>
            “I cried into my coffee. In the good way.”{" "}
            <span className={styles.who}>— Marta, sustainer</span>
          </span>
          <span className={styles.rMore}>+ 22 notes</span>
        </div>
        <div className={styles.spNudge}>
          <span className={styles.nDot} aria-hidden />
          <span>
            Sustainers funded this film through the spring pool — and they fund
            the €2.5k open grant.{" "}
            <Link to={routes.cinemaMembership}>Become one →</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
