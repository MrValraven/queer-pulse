import { useId } from "react";
import { Collapse, Toggle } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfilePlaylistsList } from "./ProfilePlaylistsList";
import type { ProfilePlaylistsDraft } from "./useProfilePlaylistsDraft";
import type { ProfileSection } from "./EditProfilePane";
import pageStyles from "./EditProfilePage.module.css";
import styles from "./ProfilePlaylistsSection.module.css";

/**
 * Edit profile "Playlists": whether the member's Studio playlists show on
 * their profile, and which ones to feature. Renders only for a viewer with a
 * Studio grant (or demo mode). The draft lives in the page, so the shared
 * save bar saves it.
 */
export function ProfilePlaylistsSection({
  playlistsDraft,
  onChange,
}: {
  playlistsDraft: ProfilePlaylistsDraft;
  onChange: (section: ProfileSection) => void;
}) {
  const { t } = useTranslation();
  const toggleId = useId();
  const { draft, view, isLoading, loadErrorKey, isEnabled } = playlistsDraft;

  function update(next: { isShown: boolean; featuredIds: string[] }) {
    playlistsDraft.setDraft(next);
    onChange("playlists");
  }

  return (
    <Collapse isOpen={isEnabled}>
      <div className={pageStyles.section} id="playlists">
        <h2 className={pageStyles.sectionTitle}>
          <Translation
            i18nKey="settings:editProfile.playlists.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={pageStyles.sectionSub}>
          {t("settings:editProfile.playlists.sub")}
        </p>
        {loadErrorKey && (
          <p className={styles.error} role="alert">
            {t(loadErrorKey)}
          </p>
        )}
        {isLoading && (
          <p className={styles.hint}>
            {t("settings:editProfile.playlists.loading")}
          </p>
        )}
        {draft && view && (
          <>
            <div className={styles.toggleRow}>
              <label htmlFor={toggleId}>
                {t("settings:editProfile.playlists.showToggle")}
              </label>
              <Toggle
                id={toggleId}
                checked={draft.isShown}
                label={t("settings:editProfile.playlists.showToggle")}
                onChange={(isShown) => update({ ...draft, isShown })}
              />
            </div>
            <Collapse isOpen={draft.isShown}>
              <ProfilePlaylistsList
                items={view.items}
                featuredIds={draft.featuredIds}
                maxFeatured={playlistsDraft.maxFeatured}
                onFeaturedChange={(featuredIds) =>
                  update({ ...draft, featuredIds })
                }
              />
            </Collapse>
          </>
        )}
      </div>
    </Collapse>
  );
}
