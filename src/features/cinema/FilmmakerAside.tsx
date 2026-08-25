import { useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { TIP_AMOUNTS, type Filmmaker } from "./cinemaFilmmaker.data";
import styles from "./CinemaFilmmakerPage.module.css";

interface FilmmakerAsideProps {
  filmmaker: Filmmaker;
  tipRef: RefObject<HTMLDivElement | null>;
}

export function FilmmakerAside({ filmmaker, tipRef }: FilmmakerAsideProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [amount, setAmount] = useState(TIP_AMOUNTS[1] ?? TIP_AMOUNTS[0] ?? 7);
  const name = filmmaker.namePre.trim();

  return (
    <aside className={styles.aside}>
      <div className={styles.tipjar} ref={tipRef}>
        <div className={styles.tjHead}>
          {t("cinema:filmmaker.aside.tipHeading", { name })}
        </div>
        <div className={styles.tjSub}>
          “{t("cinema:filmmaker.aside.tipSub", { name })}”
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
              {fmt.currency(v)}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          className={styles.tjSend}
          onClick={() =>
            showToast(
              t("cinema:filmmaker.aside.tippedToast", {
                amount: fmt.currency(amount),
                name,
              }),
              "success",
            )
          }
        >
          {t("cinema:filmmaker.aside.sendCta", {
            amount: fmt.currency(amount),
          })}
        </Button>
        <div className={styles.tjNote}>
          <Translation
            i18nKey="cinema:filmmaker.aside.tippedNote"
            values={{ count: 187, name }}
            components={{ strong: <strong /> }}
          />
        </div>
      </div>

      <div className={styles.asideCard}>
        <div className={styles.acHead}>
          {t("cinema:filmmaker.aside.splitHeading")}
        </div>
        <div className={styles.acBody}>
          <Translation
            i18nKey="cinema:filmmaker.aside.splitBody"
            values={{ name }}
            components={{ strong: <strong /> }}
          />
        </div>
        <Link to={routes.governance} className={styles.acLink}>
          {t("cinema:film.split.readDeedCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className={styles.asideCard}>
        <div className={styles.acHead}>{t("cinema:nav.openCalls")}</div>
        {/* eslint-disable local/no-literal-string -- this open call's own instance content (this filmmaker's mentor role and its close date); content per the scope rule */}
        <div className={styles.acBody} style={{ marginBottom: 14 }}>
          {name} is a mentor for the “First feature, any stage” open call.
          Applications close 15 July.
        </div>
        {/* eslint-enable local/no-literal-string */}
        <Button
          variant="ghost"
          to={routes.studioCalls}
          style={{ width: "100%" }}
        >
          {t("cinema:filmmaker.aside.seeOpenCallsCta")}
        </Button>
      </div>
    </aside>
  );
}
