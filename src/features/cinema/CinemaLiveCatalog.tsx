import { Link } from "react-router-dom";
import { FiFilm } from "react-icons/fi";
import { EmptyState, FadeIn, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { CinemaShell } from "./CinemaShell";
import { CinemaBrowseGridSkeleton } from "./CinemaBrowseSkeleton";
import { useCinemaTitles } from "./api/useCinemaTitles";
import type { CinemaTitleCard } from "./api/cinema.adapters";
import styles from "./CinemaBrowsePage.module.css";
import { routes } from "../../app/routeMap";

function LiveFilmCard({ title }: { title: CinemaTitleCard }) {
  const { t } = useTranslation();
  return (
    <Link to={`${routes.cinemaWatch}?title=${title.id}`} className={styles.fc}>
      <div className={styles.fcPoster}>
        <ImageSlot
          src={title.coverImageUrl ?? undefined}
          tint="plum"
          width="100%"
          height="100%"
          radius={14}
          placeholder={t("cinema:slot.poster")}
          style={{ position: "absolute", inset: 0 }}
        />
        {title.durationLabel && (
          <span className={`${styles.fcBadge} ${styles.member}`}>
            {title.durationLabel}
          </span>
        )}
      </div>
      <div className={styles.fcEb}>
        {t(
          title.kind === "short"
            ? "cinema:format.short"
            : "cinema:format.feature",
        )}
      </div>
      <div className={styles.fcTitle}>{title.title}</div>
      <div className={styles.fcMeta}>
        {t("cinema:live.viewCount", { count: title.viewCount })}
        {title.finished
          ? ` · ${t("cinema:live.finished")}`
          : title.progressPercent != null
            ? ` · ${t("cinema:live.resumeAt", {
                percent: title.progressPercent,
              })}`
            : ""}
      </div>
    </Link>
  );
}

/**
 * Live-mode cinema catalogue: real titles from GET /cinema/titles rendered as
 * browse cards that deep-link into the live watch player. Titles require an
 * active member session, so a logged-out visitor sees a sign-in prompt and an
 * empty live catalogue shows a tasteful EmptyState — never a mock fallback.
 */
export function CinemaLiveCatalog() {
  const { t } = useTranslation();
  const { loggedIn, checking } = useAuth();
  const { titles, isLoading, isError } = useCinemaTitles();

  return (
    <CinemaShell>
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>
            {t("cinema:browse.hero.eyebrow")}
          </div>
          <h1>{t("cinema:live.catalog.title")}</h1>
          <p>{t("cinema:live.catalog.lead")}</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="wrap">
          {!checking && !loggedIn ? (
            <EmptyState
              icon={<FiFilm />}
              title={t("cinema:live.signIn.title")}
              description={t("cinema:live.signIn.description")}
              action={{
                label: t("cinema:live.signIn.cta"),
                to: routes.signIn,
              }}
            />
          ) : checking || isLoading ? (
            <CinemaBrowseGridSkeleton count={6} />
          ) : isError ? (
            <EmptyState
              icon={<FiFilm />}
              title={t("cinema:live.error.title")}
              description={t("cinema:live.error.description")}
            />
          ) : titles.length === 0 ? (
            <EmptyState
              icon={<FiFilm />}
              title={t("cinema:live.empty.title")}
              description={t("cinema:live.empty.description")}
            />
          ) : (
            <div className={styles.grid}>
              {titles.map((title, index) => (
                <FadeIn key={title.id} delay={Math.min(index, 8) * 60}>
                  <LiveFilmCard title={title} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </CinemaShell>
  );
}
