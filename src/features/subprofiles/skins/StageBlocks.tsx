import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isUpcoming } from "../personaSkinRender";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** The soonest upcoming item across every non-link section, or `null` when
 *  nothing is upcoming. Not stored — `date` is a freeform string, so "next"
 *  is derived at render the same way `isUpcoming` is. */
function findNextUp(
  sections: SubprofileSectionView[],
): SubprofileItemView | null {
  const upcoming = sections
    .filter((section) => section.section !== "links")
    .flatMap((section) => section.items)
    .filter((item) => isUpcoming(item.date));
  if (upcoming.length === 0) return null;
  return upcoming.reduce((soonest, item) =>
    Date.parse(item.date) < Date.parse(soonest.date) ? item : soonest,
  );
}

/** Stage `top` slot: a marquee bar for the next upcoming gig, when there is
 *  one. `null` when nothing on the persona's gigs/shows is upcoming. */
export function StageNextUp({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const next = findNextUp(persona.sections);
  if (!next) return null;
  const when = [next.date, next.venue].filter(Boolean).join(" · ");

  return (
    <div className="nextup">
      <span className="nextup-label">
        {t("subprofiles:skinExtras.stage.nextUpLabel")}
      </span>
      <b>{next.title}</b>
      {when && <span className="nextup-when">{when}</span>}
    </div>
  );
}

/** Stage `end` slot: booking details (`skinData.booker`). `null` when the
 *  persona hasn't set any booker info. */
export function StageBooker({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const booker = persona.skinData?.booker;
  if (!booker) return null;

  const allRows: Array<[string, string]> = [
    [t("subprofiles:skinExtras.stage.bookerFee"), booker.fee],
    [t("subprofiles:skinExtras.stage.bookerRider"), booker.rider],
    [t("subprofiles:skinExtras.stage.bookerPress"), booker.press],
    [t("subprofiles:skinExtras.stage.bookerContact"), booker.contact],
  ];
  const rows = allRows.filter(([, value]) => Boolean(value));
  if (rows.length === 0) return null;

  return (
    <div className="booker">
      <h2>{t("subprofiles:skinExtras.stage.bookerTitle")}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
