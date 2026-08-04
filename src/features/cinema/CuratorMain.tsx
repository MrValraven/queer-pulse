import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CuratorProfile } from "./cinemaCurator.data";
import styles from "./CinemaCuratorPage.module.css";

export function CuratorMain({ curator }: { curator: CuratorProfile }) {
  const { t } = useTranslation();
  return (
    <div className={styles.main}>
      {/* Recent cover films */}
      <div>
        <div className={styles.s3}>
          <h2>
            <Translation
              i18nKey="cinema:curator.main.coverFilmsTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <span className={styles.sAll}>
            {t("cinema:curator.main.programmesTotal", {
              count: curator.programmesTotal,
            })}
          </span>
        </div>
        <div className={styles.progList}>
          {curator.programmes.map((p) => (
            <Link
              key={`${p.week}-${p.titlePre}`}
              to={p.to}
              className={styles.progItem}
            >
              <div className={styles.piWeek}>{p.week}</div>
              <div className={styles.piPoster}>
                <ImageSlot
                  src={p.poster}
                  alt={`${p.titlePre}${p.titleEm ?? ""}${p.titlePost ?? ""}`}
                  tint={p.posterTint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder={t("cinema:slot.poster")}
                  style={{ position: "absolute", inset: 0 }}
                />
              </div>
              <div className={styles.piText}>
                <div className={styles.piEb}>{p.eyebrow}</div>
                <div className={styles.piTitle}>
                  {p.titlePre}
                  {p.titleEm && <em>{p.titleEm}</em>}
                  {p.titlePost}
                </div>
                <div className={styles.piMeta}>{p.meta}</div>
                <div className={styles.piNote}>{p.note}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Collections by this curator */}
      <div>
        <div className={styles.s3}>
          <h2>
            <Translation
              i18nKey="cinema:curator.main.collectionsByTitle"
              values={{ name: curator.namePre.trim() }}
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.collsList}>
          {curator.collections.map((c) => (
            <Link
              key={`${c.titlePre}${c.titleEm ?? ""}`}
              to={c.to}
              className={styles.collTile}
            >
              <div className={styles.ctEb}>{c.eyebrow}</div>
              <h3 className={styles.ctTitle}>
                {c.titlePre}
                {c.titleEm && <em>{c.titleEm}</em>}
                {c.titlePost}
              </h3>
              <div className={styles.ctFoot}>
                <span>{c.foot}</span>
                <span
                  className={
                    c.statusKind === "new"
                      ? styles.statusNew
                      : styles.statusActive
                  }
                >
                  {c.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* From the notebook */}
      <div>
        <div className={styles.s3}>
          <h2>
            <Translation
              i18nKey="cinema:curator.main.notebookTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <span className={styles.sAll}>
            {t("cinema:curator.main.notebookEntries", {
              count: curator.notebookTotal,
            })}
          </span>
        </div>
        <div className={styles.notebookList}>
          {curator.notebook.map((n) => (
            <Link key={n.week} to={n.to} className={styles.nb}>
              <div className={styles.nbWeek}>{n.week}</div>
              <div className={styles.nbQuote}>{n.quote}</div>
              <div className={styles.nbFoot}>
                <span>{n.foot}</span>
                <span className={styles.nbRead}>
                  {t("cinema:programme.notebook.readMoreCta")}{" "}
                  <FiArrowRight aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
