import { useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioAuthPane } from "./StudioAuthPane";
import {
  ASIDE_NOW_PLAYING,
  ASIDE_TIP_PERCENT,
  type StudioAuthMode,
} from "./studioSignIn.data";
import styles from "./StudioSignInPage.module.css";

export function StudioSignInPage() {
  const [activeMode, setActiveMode] = useState<StudioAuthMode>("in");
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.asideBrand}>
          <span className={styles.pulseDot} />
          <span className={styles.wordmark}>
            <Translation
              i18nKey="studio:brand.lockup"
              components={{ em: <em /> }}
            />
          </span>
          <span className={styles.product}>
            {t("studio:brand.studioLabel")}
          </span>
        </div>
        <div className={styles.asideBody}>
          <div className={styles.asideEb}>
            <span className={styles.live} />
            {t("studio:signin.aside.onAirNow", {
              count: ASIDE_NOW_PLAYING.listening,
            })}
          </div>
          <h2>
            <Translation
              i18nKey="studio:signin.aside.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.asideSub}>
            <Translation
              i18nKey="studio:signin.aside.body"
              components={{ em: <em /> }}
              values={{
                tipPercent: format.number(ASIDE_TIP_PERCENT, {
                  style: "percent",
                }),
              }}
            />
          </p>
          <div className={styles.nowPlaying}>
            <div className={styles.cover} />
            <div className={styles.nowInfo}>
              <div className={styles.nowTitle}>
                {ASIDE_NOW_PLAYING.titlePre}
                <em>{ASIDE_NOW_PLAYING.titleEm}</em>
              </div>
              <div className={styles.nowArtist}>
                {ASIDE_NOW_PLAYING.artist} · {ASIDE_NOW_PLAYING.album}
              </div>
            </div>
            <div className={styles.bars}>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={styles.asideFoot}>
            <Translation
              i18nKey="studio:signin.aside.paidThisMonth"
              components={{ em: <em /> }}
              values={{
                amount: format.currency(ASIDE_NOW_PLAYING.paidThisMonth),
              }}
            />
          </div>
        </div>
      </aside>

      <main className={styles.authMain}>
        <div className={styles.authCard}>
          <div className={styles.mobrand}>
            <span className={styles.pulseDot} />
            <span className={styles.wordmark}>
              <Translation
                i18nKey="studio:brand.lockup"
                components={{ em: <em /> }}
              />
            </span>
            <span className={styles.product}>
              {t("studio:brand.studioLabel")}
            </span>
          </div>

          <div className={styles.segTabs}>
            <button
              type="button"
              className={activeMode === "in" ? styles.segOn : ""}
              onClick={() => setActiveMode("in")}
            >
              {t("studio:signin.tabs.signIn")}
            </button>
            <button
              type="button"
              className={activeMode === "join" ? styles.segOn : ""}
              onClick={() => setActiveMode("join")}
            >
              {t("studio:signin.tabs.join")}
            </button>
          </div>

          <StudioAuthPane
            mode={activeMode}
            onSwitch={() => setActiveMode(activeMode === "in" ? "join" : "in")}
          />
        </div>
      </main>
    </div>
  );
}
