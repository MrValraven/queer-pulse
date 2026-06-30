import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { coverFilm } from "./data";
import { SECTION_NAV } from "./cinemaPage.data";
import styles from "./CinemaPage.module.css";
import { routes } from "../../app/routeMap";

export function CinemaMast() {
  return (
    <section className={styles.mast}>
      <div className="wrap">
        <div className={styles.mastRow}>
          <div>
            <div className={styles.issue}>Programme — Week 23 · 2026</div>
            <h1 className={styles.mastBrand}>
              Queer<em>Pulse</em> Cinema
            </h1>
          </div>
          <div className={styles.mastMeta}>
            <div className={styles.issue}>8 — 14 June</div>
            <div className={styles.mastTag}>
              A theatre, an archive, a co-op.{" "}
              <em>Eighty percent of every rent</em> goes to the filmmaker.
            </div>
          </div>
        </div>
        <div className={styles.secNav}>
          {SECTION_NAV.map((label, i) => (
            <Link
              key={label}
              to="/cinema/browse"
              className={[styles.cnLink, i === 0 && styles.cnLinkActive]
                .filter(Boolean)
                .join(" ")}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AskStrip() {
  return (
    <div className={styles.askStrip}>
      <div className="wrap">
        <div className={styles.askInner}>
          <div className={styles.askText}>
            <svg
              width={17}
              height={17}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <circle cx={12} cy={12} r={10} />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            Not sure what to watch? Tell us your mood and we'll pick one film —
            no algorithm, just curators.
          </div>
          <Button to="/cinema/browse">Ask the room →</Button>
        </div>
      </div>
    </div>
  );
}

export function CinemaCover() {
  return (
    <section className={styles.cover}>
      <div className={styles.cvImg}>
        <ImageSlot
          src={coverFilm.image}
          tint="plum"
          width="100%"
          height="100%"
          radius={0}
          placeholder="cover film · poster"
          style={{ position: "absolute", inset: 0 }}
        />
        <div className={styles.cvOverlay} />
        <div className={styles.cvMarks}>
          <span className="pulse" />
          <span>Now showing</span>
          <span className="dot" />
          <span>Free for sustainers</span>
          <span className="dot" />
          <span>Live Q&amp;A · Wed 21:00</span>
        </div>
      </div>
      <div className={styles.cvText}>
        <div className={styles.cvKicker}>{coverFilm.kicker}</div>
        <h2 className={styles.cvTitle}>
          {coverFilm.titlePre}
          <em>{coverFilm.titleEm}</em>
          {coverFilm.titlePost}
        </h2>
        <div className={styles.cvMetaLine}>{coverFilm.meta}</div>
        <div className={styles.cvCurator}>
          <div className="who">{coverFilm.curatorWho}</div>
          <div className="cbody">{coverFilm.curatorBody}</div>
        </div>
        <div className={styles.cvActions}>
          <Button size="lg" to={routes.film}>
            Watch now
          </Button>
          <Button variant="ghost-dark" to={routes.film}>
            Rent · €3
          </Button>
          <Button variant="ghost-dark" to="/rsvp">
            RSVP live Q&amp;A
          </Button>
        </div>
        <div className={styles.cvSplit}>
          If you rent, <strong>€2.40 goes directly to Maria.</strong> €0.60
          covers payments &amp; hosting.
        </div>
      </div>
    </section>
  );
}
