import { FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { STUDIO_KIND_LABEL_KEY } from "../studio/api/studio.adapters";
import {
  isStudioArtistPersonaKind,
  type StudioArtistRefDTO,
} from "../studio/api/studio.types";
import { AdminAvatar } from "./ui";
import css from "./StudioAdminSpotlight.module.css";

/** A spotlight artist as the console lists them: avatar, name, @handle and
 *  the persona kind. Persona fields only, since a spotlight row carries no
 *  member. */
export function StudioAdminSpotlightIdentity({
  artist,
}: {
  artist: StudioArtistRefDTO;
}) {
  const { t } = useTranslation();
  const kindLabelKey = isStudioArtistPersonaKind(artist.kind)
    ? STUDIO_KIND_LABEL_KEY[artist.kind]
    : null;
  return (
    <div className={css.identity}>
      <AdminAvatar
        size="md"
        src={artist.avatarUrl ?? undefined}
        initials={initialsFromName(artist.name, "?")}
        alt=""
      />
      <div className={css.identityText}>
        <span className={css.name}>{artist.name}</span>
        {artist.handle && <span className={css.meta}>@{artist.handle}</span>}
        {kindLabelKey && <span className={css.meta}>{t(kindLabelKey)}</span>}
      </div>
    </div>
  );
}

/** The curator's note as Studio home shows it, or a muted "No note". */
export function StudioAdminSpotlightNoteLine({
  note,
}: {
  note: string | null;
}) {
  const { t } = useTranslation();
  return note ? (
    <p className={css.note}>{note}</p>
  ) : (
    <p className={`${css.note} ${css.noteMissing}`}>
      {t("admin:studioAdmin.spotlight.noNote")}
    </p>
  );
}

/** The amber warning line for an artist listeners cannot hear yet. It wraps
 *  on a phone, the way the month card's stale line does. */
export function StudioAdminSpotlightHiddenLine() {
  const { t } = useTranslation();
  return (
    <p className={`${css.stale} ${css.warningLine}`}>
      <FiEyeOff aria-hidden className={css.warningIcon} />
      <span>{t("admin:studioAdmin.spotlight.notListenable")}</span>
    </p>
  );
}
