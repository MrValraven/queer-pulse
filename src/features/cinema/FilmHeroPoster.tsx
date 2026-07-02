import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { FILM_POSTER, TIPS } from "./filmPage.data";
import { routes } from "../../app/routeMap";
import styles from "./FilmPage.module.css";

export function FilmHeroPoster() {
  const { showToast } = useToast();
  const [tip, setTip] = useState(1);

  return (
    <div className={styles.posterCol}>
      <div className={styles.poster}>
        <ImageSlot
          src={FILM_POSTER}
          tint="plum"
          width="100%"
          height="100%"
          radius={18}
          placeholder="film poster · 3:4"
          style={{ position: "absolute", inset: 0 }}
        />
        <Link to={routes.cinemaWatch} className={styles.playFab}>
          <span className={styles.playCircle}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </Link>
        <div className={styles.posterCaption}>Press play · trailer 1:42</div>
      </div>

      <div className={styles.tipjar}>
        <div className={styles.tipjarH}>↳ tip the filmmaker</div>
        <div className={styles.tipjarName}>
          Maria <em>Vasconcelos</em>
        </div>
        <div className={styles.tipjarSub}>
          100% goes to Maria. No fees skimmed.
        </div>
        <div className={styles.tipRow}>
          {TIPS.map((t, i) => (
            <button
              type="button"
              key={t}
              className={[styles.tipChip, tip === i && styles.tipChipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setTip(i);
                if (t !== "···") showToast(`Tipped ${t} to Maria`, "success");
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className={styles.tipFoot}>
          <strong>187 members</strong> have tipped this week.
        </div>
      </div>
    </div>
  );
}
