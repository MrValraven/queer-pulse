import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Tint } from "./directoryPlaces";
import { useDirectoryPlace } from "./api/useDirectory";
import { routes } from "../../app/routeMap";
import { DirectorySpaceMain } from "./DirectorySpaceMain";
import { DirectorySpaceAside } from "./DirectorySpaceAside";
import s from "./DirectorySpacePage.module.css";

const GCELL: Record<Tint, string> = {
  coral: "",
  jade: s.gCellJade!,
  plum: s.gCellPlum!,
};

export function DirectorySpacePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { place, isLoading } = useDirectoryPlace(slug);

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
          <Link to={routes.directory} className={s.back}>
            {t("marketing:directory.detail.backCta")}
          </Link>
          <div className={s.gallery}>
            {place.gallery.map((cap, i) => (
              <div key={i} className={[s.gCell, GCELL[place.tint]].join(" ")}>
                <span className={s.gCap}>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.page}>
        <div className={s.grid}>
          <DirectorySpaceMain place={place} />
          <DirectorySpaceAside place={place} />
        </div>
      </div>
    </PageShell>
  );
}
