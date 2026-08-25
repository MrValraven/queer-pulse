import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MEMBERS_HERE } from "./directorySpace.data";
import { TINT } from "./directoryAsideTint";
import { DirectoryUpcoming } from "./DirectoryUpcoming";
import s from "./DirectorySpacePage.module.css";

interface Props {
  place: DirectoryPlace;
  preview: boolean;
}

/** Two small, independently-conditional aside cards: "what's happening here"
 * for a place with upcoming gatherings, and a demo-only "members here lately"
 * roster. Grouped in one file since neither is big enough to warrant its own
 * (see component-decomposition's "several small components per file" allowance).
 *
 * Upcoming gatherings lead: a night already booked at this venue can change a
 * plan, which is more than a roster of who dropped by can do. */
export function DirectoryAsideExtras({ place, preview }: Props) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  return (
    <>
      {place.upcoming && place.upcoming.length > 0 && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.upcomingHere")}</h4>
          <DirectoryUpcoming
            upcoming={place.upcoming}
            placeName={place.name}
            preview={preview}
          />
        </div>
      )}

      {/* "Members here lately" is a fabricated demo roster (directorySpace.data)
          with no per-place backing from the API — show it only in demo so real
          business pages never display invented visitors. */}
      {demoMode && (
        <div className={s.sideCard}>
          <h4>{t("marketing:directory.detail.membersHereLately")}</h4>
          <div className={s.whoHere}>
            {MEMBERS_HERE.map((member) => (
              <div key={member.initials} className={s.whoRow}>
                <span className={[s.whoAv, TINT[member.tint]].join(" ")}>
                  {member.initials}
                </span>
                <Link to={routes.members}>{member.name}</Link>
                <span className={s.whoWhen}>{t(member.whenKey)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
