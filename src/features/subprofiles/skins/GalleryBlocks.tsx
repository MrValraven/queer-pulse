import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** Gallery `top` slot: the "now on view" band in the hero (`skinData.onView`).
 *  `null` when the persona hasn't set one. */
export function OnView({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const onView = persona.skinData?.onView;
  if (!onView || !onView.title) return null;

  return (
    <div className="onview">
      <span className="onview-label">
        {t("subprofiles:skinExtras.gallery.onViewLabel")}
      </span>
      <b>{onView.title}</b>
      {onView.artist && <span className="onview-artist">{onView.artist}</span>}
      {onView.dates && <span className="onview-dates">{onView.dates}</span>}
      {onView.room && <span className="onview-room">{onView.room}</span>}
    </div>
  );
}

/** Gallery `end` slot: the "visiting" dl at the foot (`skinData.visit`).
 *  `null` when the persona hasn't set one. */
export function VisitBlock({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const visit = persona.skinData?.visit;
  if (!visit) return null;

  const rows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.gallery.hours"), visit.hours],
    [t("subprofiles:skinExtras.gallery.address"), visit.address],
    [t("subprofiles:skinExtras.gallery.access"), visit.access],
    [t("subprofiles:skinExtras.gallery.admission"), visit.admission],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;
  if (rows.length === 0) return null;

  return (
    <section className="visit">
      <h2>{t("subprofiles:skinExtras.gallery.visitTitle")}</h2>
      <SkinDefList rows={rows} />
    </section>
  );
}
