import { useState } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { StudioTipModal } from "./StudioTipModal";
import { PLAYER_ART } from "./studioShell.data";
import styles from "./studio.module.css";

const NOW_PLAYING_ARTIST = "Mariana Sol";
const NOW_PLAYING_TITLE = { pre: "Carta para a ", em: "santa" };
const NOW_PLAYING_ALBUM = "Cidade dos santos";
const PER_PLAY_AMOUNT = 0.05;
const TIP_AMOUNT = 2;

export function StudioPlayer() {
  const [tipOpen, setTipOpen] = useState(false);
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      <div className={styles.fp}>
        <div className={styles.fpL}>
          <div className={styles.fpArt}>
            <ImageSlot
              src={PLAYER_ART}
              tint="coral"
              width={52}
              height={52}
              radius={8}
              placeholder=""
            />
          </div>
          <div className={styles.fpInfo}>
            <div className={styles.t}>
              {NOW_PLAYING_TITLE.pre}
              <em>{NOW_PLAYING_TITLE.em}</em>
            </div>
            <div className={styles.a}>
              {NOW_PLAYING_ARTIST} · {NOW_PLAYING_ALBUM}
            </div>
          </div>
        </div>
        <div className={styles.fpC}>
          <div className={styles.fpTrans}>
            <button type="button" aria-label={t("studio:player.prev")}>
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1v12M13 1L4 7l9 6V1z" />
              </svg>
            </button>
            <button type="button" className={styles.play} aria-label={t("studio:player.play")}>
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button type="button" aria-label={t("studio:player.next")}>
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M12 1v12M1 1l9 6-9 6V1z" />
              </svg>
            </button>
          </div>
          <div className={styles.fpBar}>
            <span className={styles.t}>1:42</span>
            <div className={styles.track}>
              <div className={styles.fill} />
            </div>
            <span className={styles.t}>4:18</span>
          </div>
        </div>
        <div className={styles.fpR}>
          <div className={styles.payMini}>
            <Translation
              i18nKey="studio:player.payingLine"
              components={{ b: <b /> }}
              values={{ amount: fmt.currency(PER_PLAY_AMOUNT), artist: NOW_PLAYING_ARTIST }}
            />
          </div>
          <button
            type="button"
            className={styles.tipMini}
            onClick={() => setTipOpen(true)}
          >
            {t("studio:player.tipCta", { amount: fmt.currency(TIP_AMOUNT) })}
          </button>
        </div>
      </div>

      {tipOpen && (
        <StudioTipModal
          recipient={NOW_PLAYING_ARTIST}
          onClose={() => setTipOpen(false)}
        />
      )}
    </>
  );
}
