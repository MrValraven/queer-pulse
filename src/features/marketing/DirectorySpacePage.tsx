import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlace } from "./api/useDirectory";
import { useDirectoryListings } from "./listBusiness/api/useDirectoryListings";
import { routes, businessPath } from "../../app/routeMap";
import { DirectorySpaceView } from "./DirectorySpaceView";
import { DirectoryRelatedPlaces } from "./DirectoryRelatedPlaces";
import { CAT_LABEL_KEYS } from "./directorySpace.data";
import { PageMeta } from "../../shared/seo/PageMeta";
import { JsonLd } from "../../shared/seo/JsonLd";
import { buildLocalBusinessSchema } from "../../shared/seo/jsonLd.data";
import { toAbsoluteUrl } from "../../shared/seo/seo.data";
import s from "./DirectorySpacePage.module.css";

/** Truncate a listing's tagline/description to a sensible social-meta length. */
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? `${clean.slice(0, 197).trimEnd()}…` : clean;
}

export function DirectorySpacePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { place, isLoading } = useDirectoryPlace(slug);
  // Owner detection: match the viewer's own listings against this slug.
  // `useDirectoryListings` is the same demo-aware "is this mine" source
  // `PlacesSection` reads (the session overlay in demo, overlay + GET
  // /listings/mine deduped in live) — unlike `useAllMyListings`, which is
  // hook-disabled in demo mode (`enabled: !demoMode`) and so left `owned`
  // permanently undefined there, this resolves in both modes. Logged-out
  // visitors simply never match (an empty `submitted`), same as before.
  const { submitted } = useDirectoryListings();
  const owned = submitted.find((listing) => listing.slug === slug);

  // In live mode the fetch is async: hold the layout while it's in flight
  // rather than redirecting on the initial undefined. Only redirect once the
  // read has settled with no matching live listing.
  if (isLoading) {
    return (
      <PageShell>
        <div className={s.page}>
          <div className={s.grid}>
            <div>
              <SkeletonLine width="45%" height={16} />
              <SkeletonLine width="80%" height={34} style={{ marginTop: 12 }} />
              <SkeletonLine width="60%" height={16} style={{ marginTop: 12 }} />
            </div>
            <SkeletonLine width="100%" height={220} />
          </div>
        </div>
      </PageShell>
    );
  }
  if (!place) return <Navigate to={routes.directory} replace />;

  const canonicalPath = businessPath(place.slug);
  const categoryLabelKey = CAT_LABEL_KEYS[place.cat];

  return (
    <PageShell>
      <PageMeta
        title={`${place.name} — QueerPulse`}
        description={clampDescription(place.tagline || place.desc)}
        canonical={canonicalPath}
        image={place.photos?.wide ?? undefined}
        type="website"
      />
      <JsonLd
        schema={buildLocalBusinessSchema(place, toAbsoluteUrl(canonicalPath))}
      />
      <div className={s.cover}>
        <div className={s.coverInner}>
          <div className={s.coverTop}>
            <nav
              aria-label={t("marketing:directory.detail.breadcrumbAria")}
              className={s.breadcrumb}
            >
              <ol className={s.breadcrumbList}>
                <li>
                  <Link to={routes.directory}>
                    {t("marketing:directory.detail.breadcrumbHome")}
                  </Link>
                </li>
                <li>
                  {categoryLabelKey ? (
                    <Link to={`${routes.directory}?cat=${place.cat}`}>
                      {t(categoryLabelKey)}
                    </Link>
                  ) : (
                    <span>{place.cat}</span>
                  )}
                </li>
                <li aria-current="page">{place.name}</li>
              </ol>
            </nav>
            {owned && (
              <Link
                to={routes.listBusinessEdit.replace(":ref", owned.ref)}
                className={s.ownerEdit}
              >
                {t("marketing:directory.editThisListing")}
              </Link>
            )}
          </div>
        </div>
      </div>
      <DirectorySpaceView place={place} ownerRef={owned?.ref} />
      <DirectoryRelatedPlaces place={place} />
    </PageShell>
  );
}
