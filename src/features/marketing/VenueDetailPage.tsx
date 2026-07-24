import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiClock, FiMapPin } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { useLocalVenue } from "./api/useLocalPlaces";
import { TYPE_LABEL_KEYS, VIBE_LABEL_KEYS } from "./map.data";
import s from "./VenueDetailPage.module.css";

/**
 * Detail page for a single venue (demo-only). Venues are mock content, so in
 * live mode useLocalVenue returns undefined and we redirect to the directory —
 * mirroring the not-found pattern in useDirectoryPlace.
 */
export function VenueDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { venue } = useLocalVenue(id);

  if (!venue) return <Navigate to={routes.directory} replace />;

  const mapPath = `${routes.directory}?view=map`;

  return (
    <PageShell>
      <div className={s.page}>
        <div className="wrap">
          <Link to={mapPath} className={s.back}>
            <FiArrowLeft /> {t("marketing:local.venue.back")}
          </Link>

          <header className={s.head}>
            <div className={s.tag}>{t(TYPE_LABEL_KEYS[venue.type]!)}</div>
            <h1 className={s.name}>{venue.name}</h1>
            <div className={s.sub}>
              <span className={s.hood}>
                <FiMapPin /> {venue.bairro}, {venue.freguesia}
              </span>
              {venue.accessible && (
                <span className={s.access}>
                  <FiCheckCircle /> {t("marketing:local.venue.accessible")}
                </span>
              )}
            </div>
          </header>

          <div className={s.body}>
            <p className={s.note}>{venue.note}</p>

            <dl className={s.details}>
              <div>
                <dt>{t("marketing:local.venue.address")}</dt>
                <dd>{venue.address}</dd>
              </div>
              <div>
                <dt>
                  <FiClock /> {t("marketing:local.venue.hours")}
                </dt>
                <dd>{venue.hours}</dd>
              </div>
            </dl>

            {venue.vibe.length > 0 && (
              <div className={s.vibes}>
                <span className={s.vibesLabel}>
                  {t("marketing:local.filter.vibeLabel")}
                </span>
                {venue.vibe.map((vibe) => (
                  <span key={vibe} className={s.vibe}>
                    {t(VIBE_LABEL_KEYS[vibe]!)}
                  </span>
                ))}
              </div>
            )}

            <div className={s.been}>
              <Translation
                i18nKey="marketing:local.venue.been"
                values={{ count: venue.beenHere }}
              />
            </div>

            <Button variant="ghost" to={mapPath}>
              {t("marketing:local.venue.onMap")}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
