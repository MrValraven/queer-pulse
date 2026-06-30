import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import {
  WatchOverlay,
  WatchPlayState,
  WatchControls,
  WatchSidePanel,
  WatchBelow,
} from "./WatchPageSections";
import { PLAYER_STILL } from "./watchPage.data";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

export function WatchPage() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [cc, setCc] = useState(true);
  const [ad, setAd] = useState(false);

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link to={routes.film} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<em style={{ fontStyle: "italic" }}>Pulse</em>
          <span className={styles.cin}>Cinema</span>
        </Link>
        <div className={styles.navLinks}>
          <Link to={routes.film}>← Film info</Link>
          <Link to={routes.cinema}>Cinema home</Link>
        </div>
        <div className={styles.navRight}>
          <span>
            Watching as <strong>Anon</strong>
          </span>
          <Button
            variant="ghost-dark"
            to={routes.signIn}
            style={{ padding: "8px 16px" }}
          >
            Sign in to save progress
          </Button>
        </div>
      </nav>

      <div className={styles.stage}>
        <div className={styles.zone}>
          <div className={styles.screen}>
            <ImageSlot
              src={PLAYER_STILL}
              tint="plum"
              width="100%"
              height="100%"
              radius={0}
              placeholder="film frame · cinematic still"
              style={{ position: "absolute", inset: 0 }}
            />

            {showOverlay ? (
              <WatchOverlay onDismiss={() => setShowOverlay(false)} />
            ) : (
              <WatchPlayState />
            )}
          </div>

          <WatchControls
            cc={cc}
            ad={ad}
            onCcToggle={() => setCc((v) => !v)}
            onAdToggle={() => setAd((v) => !v)}
          />
        </div>

        <WatchSidePanel />
      </div>

      <WatchBelow />
    </div>
  );
}
