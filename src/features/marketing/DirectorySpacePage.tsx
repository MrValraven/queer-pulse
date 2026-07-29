import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlace } from "./api/useDirectory";
import { useAllMyListings } from "./listBusiness/api/useListings";
import { routes } from "../../app/routeMap";
import { DirectorySpaceView } from "./DirectorySpaceView";
import s from "./DirectorySpacePage.module.css";

export function DirectorySpacePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { place, isLoading } = useDirectoryPlace(slug);
  // Owner detection: match the viewer's own listings against this slug. The
  // query is disabled in demo/logged-out, so `mine` is undefined there and
  // the edit control simply never renders — no extra guard needed.
  const { data: mine } = useAllMyListings();
  const owned = mine?.items.find((listing) => listing.slug === slug);

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

  return (
    <PageShell>
      <div className={s.cover}>
        <div className={s.coverInner}>
          <div className={s.coverTop}>
            <Link to={routes.directory} className={s.back}>
              {t("marketing:directory.detail.backCta")}
            </Link>
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
      <DirectorySpaceView place={place} />
    </PageShell>
  );
}
