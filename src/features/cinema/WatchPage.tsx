import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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
          <Link to={routes.film}>{t("cinema:watch.nav.backToFilm")}</Link>
          <Link to={routes.cinema}>{t("cinema:watch.nav.cinemaHome")}</Link>
        </div>
        <div className={styles.navRight}>
          <span>
            <Translation
              i18nKey="cinema:watch.nav.watchingAs"
              values={{ name: "Anon" }}
              components={{ strong: <strong /> }}
            />
          </span>
          <Button
            variant="ghost-dark"
            to={routes.signIn}
            style={{ padding: "8px 16px" }}
          >
            {t("cinema:watch.nav.signInCta")}
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
              placeholder={t("cinema:slot.filmFrame")}
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
