import { useId } from "react";
import { FiArrowRight, FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaPostComposer } from "../subprofiles/PersonaPostComposer";
import type { StudioArtistView } from "./api/studio.adapters";
import { studioPressEditPath, studioPressPath } from "./studioPaths";
import ownerStyles from "./StudioArtistOwner.module.css";

/** The owner's tools on their Studio page: the press kit (view and edit)
 *  and "Post an update", which lands in the About tab's Updates and on the
 *  persona page. */
export function StudioArtistOwnerTools({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const composerHeadingId = useId();
  const personaId = artist.artist.id;
  return (
    <section className={ownerStyles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={ownerStyles.heading}>
        {t("studio:owner.v3.toolsHeading")}
      </h2>
      <div className={ownerStyles.toolLinks}>
        <Link to={studioPressPath(personaId)} className={ownerStyles.action}>
          {t("studio:owner.v3.pressKit")} <FiArrowRight aria-hidden />
        </Link>
        <Link
          to={studioPressEditPath(personaId)}
          className={ownerStyles.action}
        >
          <FiEdit2 aria-hidden /> {t("studio:owner.v3.editPressKit")}
        </Link>
      </div>
      <h3 id={composerHeadingId} className={ownerStyles.subheading}>
        {t("studio:owner.v3.postUpdateHeading")}
      </h3>
      <div role="group" aria-labelledby={composerHeadingId}>
        <PersonaPostComposer subprofileId={personaId} />
      </div>
    </section>
  );
}
