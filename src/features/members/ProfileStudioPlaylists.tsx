import { useId } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMemberPlaylists } from "../studio/api/useStudioMemberPlaylists";
import { StudioPlaylistCover } from "../studio/StudioPlaylistCover";
import { studioLibraryPath } from "../studio/studioPaths";
import css from "./ProfileStudioPlaylists.module.css";

/**
 * Studio v2: the member's Studio playlists, for a viewer with a Studio
 * grant. Grows in once there is something to show and renders nothing
 * otherwise, so a profile never carries an empty heading.
 */
export function ProfileStudioPlaylists({
  memberSlug,
  isSelf,
  firstName,
}: {
  memberSlug: string;
  /** Owner view: "Your playlists" and a link to the Studio library. */
  isSelf: boolean;
  firstName: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { playlists, isEnabled } = useStudioMemberPlaylists(memberSlug || null);
  return (
    <Collapse isOpen={isEnabled && playlists.length > 0}>
      <section
        className={`${css.section} wrap`}
        aria-labelledby={headingId}
        data-profile-studio-playlists=""
      >
        <div className={css.head}>
          <h2 id={headingId} className={css.title}>
            {isSelf
              ? t("members:studioPlaylists.titleSelf")
              : t("members:studioPlaylists.title", { firstName })}
          </h2>
          {isSelf && (
            <Link to={studioLibraryPath()} className={css.libraryLink}>
              {t("members:studioPlaylists.libraryCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          )}
        </div>
        <ul
          className={css.grid}
          aria-label={t("members:studioPlaylists.listLabel")}
        >
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Link to={playlist.href} className={css.card}>
                <span className={css.cover}>
                  <StudioPlaylistCover
                    coverUrls={playlist.coverUrls}
                    tint={playlist.tint}
                    label=""
                  />
                </span>
                <span className={css.name}>
                  {playlist.name}
                  {playlist.visibilityLabelKey && (
                    <span className={css.chip}>
                      {t(playlist.visibilityLabelKey)}
                    </span>
                  )}
                </span>
                <span className={css.meta}>
                  {t("members:studioPlaylists.trackCount", {
                    count: playlist.trackCount,
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}
