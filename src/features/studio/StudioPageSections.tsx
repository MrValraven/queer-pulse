/** The demo's Wednesday set and its side column. Shown only in demo mode
 *  (StudioRoom gates it on useStudioShowcase). */
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SET, WEDNESDAY_SET, RECAP_AVATARS } from "./studioPage.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

export function StudioSetSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.row} aria-labelledby="studio-home-set">
      <div className={styles.rowH}>
        <h2 id="studio-home-set">
          <Translation
            i18nKey="studio:room.set.title"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.sub}>
          {t("studio:room.set.subtitle", {
            curator: WEDNESDAY_SET.curator,
            count: WEDNESDAY_SET.listeners,
          })}
        </div>
      </div>
      <div className={styles.split}>
        <div className={styles.setCard}>
          <h3>
            {WEDNESDAY_SET.titlePre}
            <em>{WEDNESDAY_SET.titleEm}</em>
          </h3>
          <div className={styles.setDesc}>{WEDNESDAY_SET.description}</div>
          {SET.map((row) => (
            <div
              key={row.n}
              className={[styles.setRow, row.now && styles.setRowNow]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.n}>{row.n}</div>
              <div className={styles.srCov}>
                <ImageSlot
                  src={row.image}
                  tint={row.cvTint}
                  width={36}
                  height={36}
                  radius={5}
                  placeholder=""
                />
              </div>
              <div>
                <h4>
                  {row.titlePre}
                  {row.titleEm && <em>{row.titleEm}</em>}
                </h4>
                <div className={styles.who}>{row.who}</div>
              </div>
              <div className={styles.pay}>
                {row.statusKey && <b>{t(row.statusKey)}</b>}
                {row.isUpNext && (
                  <>
                    {t("studioShowcase:room.set.upNext")}{" "}
                    <FiArrowRight aria-hidden />
                  </>
                )}
              </div>
              <div className={styles.tm}>{row.tm}</div>
            </div>
          ))}
        </div>

        <StudioSideCol />
      </div>
    </section>
  );
}

function StudioSideCol() {
  const { t } = useTranslation();
  return (
    <div className={styles.sideCol}>
      <div className={styles.sideCard}>
        <div className={styles.eb}>
          <span className={styles.live} />
          {t("studio:room.set.sideHeading")}
        </div>
        <div className={styles.ct}>
          <Translation
            i18nKey="studio:room.hero.listening"
            components={{ em: <em /> }}
            values={{ count: WEDNESDAY_SET.listeners }}
          />
        </div>
        <div className={styles.sub}>
          {t("studio:room.set.sideSub", {
            sustainers: WEDNESDAY_SET.sustainers,
            casual: WEDNESDAY_SET.casual,
            cities: WEDNESDAY_SET.cities,
          })}
        </div>
        <div className={styles.avStack}>
          {RECAP_AVATARS.map((a, i) => (
            <span
              key={a}
              className={[styles.av, i % 2 === 1 && styles.jade]
                .filter(Boolean)
                .join(" ")}
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>{t("studio:room.set.fee.heading")}</div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:room.set.fee.hosting")}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:room.set.fee.curators")}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:room.set.fee.fund")}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:room.set.fee.artistShare")}
          </span>
          <span className={styles.v}>
            {t("studio:room.set.fee.artistShareStatus")}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:room.set.readPlanCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
