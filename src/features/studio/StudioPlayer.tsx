import { useState } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { StudioTipModal } from "./StudioTipModal";
import { PLAYER_ART } from "./studioShell.data";
import styles from "./studio.module.css";

export function StudioPlayer() {
  const [tipOpen, setTipOpen] = useState(false);
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
              Carta para a <em>santa</em>
            </div>
            <div className={styles.a}>Mariana Sol · Cidade dos santos</div>
          </div>
        </div>
        <div className={styles.fpC}>
          <div className={styles.fpTrans}>
            <button type="button" aria-label="Prev">
              <svg viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1v12M13 1L4 7l9 6V1z" />
              </svg>
            </button>
            <button type="button" className={styles.play} aria-label="Play">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </button>
            <button type="button" aria-label="Next">
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
            <b>paying</b>€0.05 to Mariana
          </div>
          <button
            type="button"
            className={styles.tipMini}
            onClick={() => setTipOpen(true)}
          >
            Tip €2
          </button>
        </div>
      </div>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </>
  );
}
