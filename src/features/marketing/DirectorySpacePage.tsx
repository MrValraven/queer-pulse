import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { getPlace, type Tint } from "./directoryPlaces";
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
  const place = getPlace(slug);
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
