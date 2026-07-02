import { useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ImageSlot } from "../../shared/components/ui";
import { StudioShell } from "./StudioShell";
import { StudioTrackHero } from "./StudioTrackHero";
import { StudioTrackLyrics } from "./StudioTrackLyrics";
import { StudioTrackSidebar } from "./StudioTrackSidebar";
import { StudioTipModal } from "./StudioTipModal";
import { MORE } from "./studioTrack.data";
import ss from "./studio.module.css";
import t from "./track.module.css";

export function StudioTrackPage() {
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <div className={t.crumb}>
        <Link to={routes.studioArtist}>Mariana Sol</Link>
        <span>›</span>
        <Link to={routes.studioAlbum}>Cidade dos santos</Link>
        <span>›</span>
        <em>track 6</em>
      </div>

      <StudioTrackHero onTip={() => setTipOpen(true)} />

      <div className={t.inSet}>
        <span className={t.live} />
        <span>
          You're listening with <b>312 people</b> in the <em>Wednesday set</em>,
          programmed by Sara Marques. Track 7 starts in <b>2:36</b>.
        </span>
        <Link to={routes.studioLive}>Join the room →</Link>
      </div>

      <div className={t.body}>
        <StudioTrackLyrics />
        <StudioTrackSidebar />
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            More from <em>Cidade dos santos</em>
          </h2>
          <Link to={routes.studioAlbum} className={ss.all}>
            Full album →
          </Link>
        </div>
        <div className={ss.rowGrid}>
          {MORE.map((mr) => (
            <Link key={mr.pre} to={routes.studioTrack} className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot
                  src={mr.image}
                  tint={mr.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder="cv"
                  style={{ position: "absolute", inset: 0 }}
                />
              </div>
              <h4>
                {mr.pre}
                {mr.em && <em>{mr.em}</em>}
                {mr.post}
              </h4>
              <div className={ss.meta}>{mr.meta}</div>
            </Link>
          ))}
        </div>
      </section>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
