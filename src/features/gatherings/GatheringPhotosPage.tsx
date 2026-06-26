import { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlay } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { PhotoViewer } from "./PhotoViewer";
import { CHIPS, PICS, CONTRIBUTORS } from "./gatheringPhotos.data";
import styles from "./GatheringPhotosPage.module.css";

const RECAP = routes.gatheringRecap;
const MEMBER = routes.members;
const CALENDAR = routes.calendar;
const REPORT = routes.report;

export function GatheringPhotosPage() {
  const { showToast } = useToast();
  const [chip, setChip] = useState(0);
  const [viewer, setViewer] = useState<{ index: number; slideshow: boolean } | null>(null);

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link to={RECAP} className={styles.back}>
            ← Back to recap
          </Link>
          <div className={styles.eyebrow}>
            <span>Photo album · 28 photos</span>
            <span className={styles.sep}>·</span>
            <span>Open clinic night</span>
            <span className={styles.sep}>·</span>
            <span>Café Beirão</span>
          </div>
          <h1 className={styles.h1}>
            Open clinic night · <em>12 Jun.</em>
          </h1>
          <p className={styles.dek}>
            A photo album from the back room of Café Beirão. Photos by André Bento and
            three attending members who opted to share. <em>Faces are blurred by default
            unless the person opted in by name</em> — that's our standard policy on
            gathering photography.
          </p>
          <div className={styles.meta}>
            <span>
              Hosted by <b>Anika Kovač</b> &amp; <b>Trans Hub</b>
            </span>
            <span>
              Photos by <Link to={MEMBER}>André Bento</Link> + 3 attendees
            </span>
            <span>
              <b>28</b> photos · <b>14</b> with consent to publish
            </span>
          </div>
        </div>
      </section>

      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          {CHIPS.map((c, i) => (
            <button
              key={c}
              type="button"
              className={[styles.chip, chip === i && styles.chipActive].filter(Boolean).join(" ")}
              onClick={() => setChip(i)}
            >
              {c}
              {i === 0 && <span> 28</span>}
            </button>
          ))}
          <div className={styles.right}>
            <button type="button" className={styles.action} onClick={() => showToast("Downloading album.zip", "success")}>
              Download all
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={() => setViewer({ index: 0, slideshow: true })}
            >
              <FiPlay style={{ verticalAlign: "-2px", marginRight: 4 }} /> Slideshow
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mosaic}>
        {PICS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={[styles.pic, p.span && styles[p.span], styles[p.tint]].filter(Boolean).join(" ")}
            onClick={() => setViewer({ index: i, slideshow: false })}
          >
            {p.tag && (
              <span className={[styles.tag, p.tagAccent && styles.tagAccent].filter(Boolean).join(" ")}>
                {p.tag}
              </span>
            )}
            {p.label}
          </button>
        ))}
      </div>

      <section className={styles.foot}>
        <div className={styles.footInner}>
          <h3>
            How we handle <em>gathering photos</em>
          </h3>
          <p>
            Every photo here was taken by an attending member with consent from the people
            in the frame. <b>Faces are blurred by default</b> unless the person
            specifically opted in by name. This isn't a privacy nicety — it's how we make
            sure people show up next time.
          </p>
          <p>
            If you see yourself in a photo and want it removed (or unblurred), email{" "}
            <a href="mailto:photos@queerpulse.app">photos@queerpulse.app</a> — we'll handle
            it within 24 hours, no questions. <em>You can also untick "appear in event
            photos" globally</em> in <Link to={routes.privacy}>Privacy settings</Link>.
          </p>

          <h3 style={{ marginTop: 24 }}>
            Photographers <em>this event</em>
          </h3>
          <div className={styles.contrib}>
            {CONTRIBUTORS.map((c) => (
              <Link to={MEMBER} className={styles.pill} key={c.name}>
                <span className={styles.pillAv} style={{ background: c.bg, color: c.color }}>
                  {c.initials}
                </span>
                <b>{c.name}</b>
                <span className={styles.ct}>{c.count}</span>
              </Link>
            ))}
          </div>

          <div className={styles.footActions}>
            <Button variant="primary" to={RECAP}>
              ← Read the recap
            </Button>
            <Button variant="ghost" to={CALENDAR}>
              Next clinic · 10 Jul
            </Button>
            <Button variant="ghost" to={REPORT}>
              Flag a photo
            </Button>
          </div>
        </div>
      </section>

      {viewer && (
        <PhotoViewer
          pics={PICS}
          startIndex={viewer.index}
          slideshow={viewer.slideshow}
          onClose={() => setViewer(null)}
        />
      )}
    </PageShell>
  );
}
