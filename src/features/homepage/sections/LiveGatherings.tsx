import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHomepageGatherings } from "../api/useHomepageGatherings";
import styles from "./Gatherings.module.css";

/**
 * Live-mode counterpart to `Gatherings`: the next real gatherings on the
 * board, in the same row layout the demo teaser uses. Every value on a row
 * comes off the event itself — nothing is borrowed from `data/gatherings.ts`,
 * so no fabricated dinner can reach a live visitor.
 *
 * Renders nothing while loading, and nothing when the board is empty or the
 * source is unavailable (see `useHomepageGatherings` for why the data is
 * gated on a signed-in session): an absent section beats an empty shell.
 */
export function LiveGatherings() {
  const { t } = useTranslation();
  const format = useFormat();
  const { gatherings, isLoading, isError } = useHomepageGatherings();

  // A failed fetch renders nothing, like an empty slice does. This is the
  // marketing homepage: a visitor has no stake in this teaser row and cannot
  // act on a failure here, and an alert panel between the curated plum and
  // cream sections would cost more than the row is worth. The real board is a
  // click away in the nav. The flag is read explicitly so the choice is a
  // decision rather than an accident.
  if (isLoading || isError || gatherings.length === 0) return null;

  return (
    <section className={styles.gather} id="gather">
      <div className="wrap">
        <div className={styles.inner}>
          <Reveal>
            <SectionHead
              dark
              title={
                <Translation
                  i18nKey="homepage:gatherings.title"
                  components={{ em: <em /> }}
                />
              }
              subtitle={t("homepage:gatherings.subtitle")}
            />
          </Reveal>

          <div className={styles.list}>
            {gatherings.map((gathering, index) => (
              <Reveal key={gathering.to} delay={index * 50}>
                <Link to={gathering.to} className={styles.row}>
                  <div className={styles.date}>
                    <span className={styles.day}>
                      {format.date(gathering.date, { day: "numeric" })}
                    </span>
                    <span className={styles.month}>
                      {format.date(gathering.date, { month: "short" })}
                    </span>
                  </div>
                  <div>
                    <div className={styles.type}>{gathering.org}</div>
                    <h3 className={styles.title}>{gathering.title}</h3>
                    <div className={styles.meta}>
                      {gathering.hood && <span>{gathering.hood}</span>}
                      {gathering.hood && (
                        <span className={styles.dot} aria-hidden />
                      )}
                      <span>{format.time(gathering.date)}</span>
                    </div>
                  </div>
                  <div className={styles.right}>
                    {typeof gathering.attendeeCount === "number" && (
                      <div className={styles.spots}>
                        <b>{format.number(gathering.attendeeCount)}</b>{" "}
                        {t("homepage:gatherings.spots.going")}
                      </div>
                    )}
                    <span className={styles.cta}>
                      {t("homepage:gatherings.cta.seeDetails")}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
