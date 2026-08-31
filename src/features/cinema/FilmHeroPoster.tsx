import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCornerDownRight } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILM_POSTER, TIP_AMOUNTS } from "./filmPage.data";
import { routes } from "../../app/routeMap";
import styles from "./FilmPage.module.css";

const FILMMAKER_NAME = "Maria";

export function FilmHeroPoster() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();
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
          placeholder={t("cinema:slot.filmPoster")}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        <Link to={routes.cinemaWatch} className={styles.playFab}>
          <span className={styles.playCircle}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </Link>
        <div className={styles.posterCaption}>
          {t("cinema:film.poster.trailerCta", { duration: "1:42" })}
        </div>
      </div>

      <div className={styles.tipjar}>
        <div className={styles.tipjarH}>
          <FiCornerDownRight aria-hidden />
          {t("cinema:film.tipjar.heading")}
        </div>
        {/* eslint-disable local/no-literal-string -- this film's filmmaker's own name; content per the scope rule */}
        <div className={styles.tipjarName}>
          Maria <em>Vasconcelos</em>
        </div>
        {/* eslint-enable local/no-literal-string */}
        <div className={styles.tipjarSub}>
          {t("cinema:film.tipjar.note", { name: FILMMAKER_NAME })}
        </div>
        <div className={styles.tipRow}>
          {TIP_AMOUNTS.map((amount, index) => (
            <button
              type="button"
              key={amount ?? "custom"}
              className={[styles.tipChip, tip === index && styles.tipChipOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setTip(index);
                if (amount != null) {
                  showToast(
                    t("cinema:film.tipjar.tippedToast", {
                      amount: fmt.currency(amount),
                      name: FILMMAKER_NAME,
                    }),
                    "success",
                  );
                }
              }}
            >
              {amount != null ? fmt.currency(amount) : "···"}
            </button>
          ))}
        </div>
        <div className={styles.tipFoot}>
          <Translation
            i18nKey="cinema:film.tipjar.footnote"
            values={{ count: 187 }}
            components={{ strong: <strong /> }}
          />
        </div>
      </div>
    </div>
  );
}
