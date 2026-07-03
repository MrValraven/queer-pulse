import { useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { TIP_AMOUNTS, type Filmmaker } from "./cinemaFilmmaker.data";
import styles from "./CinemaFilmmakerPage.module.css";

interface FilmmakerAsideProps {
  filmmaker: Filmmaker;
  tipRef: RefObject<HTMLDivElement | null>;
}

export function FilmmakerAside({ filmmaker, tipRef }: FilmmakerAsideProps) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState(TIP_AMOUNTS[1]);
  const name = filmmaker.namePre.trim();

  return (
    <aside className={styles.aside}>
      <div className={styles.tipjar} ref={tipRef}>
        <div className={styles.tjHead}>Tip {name}</div>
        <div className={styles.tjSub}>
          “100% goes to {name} — the co-op takes nothing off a tip. Tipping
          keeps her making things.”
        </div>
        <div className={styles.tjChips}>
          {TIP_AMOUNTS.map((v) => (
            <button
              key={v}
              type="button"
              className={`${styles.tjChip} ${amount === v ? styles.on : ""}`}
              aria-pressed={amount === v}
              onClick={() => setAmount(v)}
            >
              €{v}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          className={styles.tjSend}
          onClick={() =>
            showToast(`€${amount} on its way to ${name} — thank you`, "success")
          }
        >
          Send €{amount}
        </Button>
        <div className={styles.tjNote}>
          <strong>187 members</strong> have tipped {name} this month.
        </div>
      </div>

      <div className={styles.asideCard}>
        <div className={styles.acHead}>The co-op split</div>
        <div className={styles.acBody}>
          When you rent any of {name}'s films, <strong>80%</strong> goes to her.
          When you buy, the same. Tips are 100%. The split is the same for every
          filmmaker on the cinema.
        </div>
        <Link to={routes.governance} className={styles.acLink}>
          Read the deed →
        </Link>
      </div>

      <div className={styles.asideCard}>
        <div className={styles.acHead}>Open calls</div>
        <div className={styles.acBody} style={{ marginBottom: 14 }}>
          {name} is a mentor for the “First feature, any stage” open call.
          Applications close 15 July.
        </div>
        <Button
          variant="ghost"
          to={routes.studioCalls}
          style={{ width: "100%" }}
        >
          See open calls
        </Button>
      </div>
    </aside>
  );
}
