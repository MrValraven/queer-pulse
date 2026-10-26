import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "../studio/api/studio.adapters";
import { StudioPlaylistCover } from "../studio/StudioPlaylistCover";
import styles from "./ProfilePlaylistsSection.module.css";

/**
 * The pick list of Edit profile "Playlists": featured playlists first in
 * pick order with move controls, then the rest with a checkbox. Picks stop
 * at `maxFeatured`; unpicked rows disable until one is dropped.
 */
export function ProfilePlaylistsList({
  items,
  featuredIds,
  maxFeatured,
  onFeaturedChange,
}: {
  items: StudioPlaylistCardView[];
  featuredIds: string[];
  maxFeatured: number;
  onFeaturedChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const isAtCap = featuredIds.length >= maxFeatured;
  const featuredItems = featuredIds.flatMap((id) =>
    items.filter((item) => item.id === id),
  );
  const restItems = items.filter((item) => !featuredIds.includes(item.id));

  function toggle(playlistId: string) {
    onFeaturedChange(
      featuredIds.includes(playlistId)
        ? featuredIds.filter((id) => id !== playlistId)
        : [...featuredIds, playlistId],
    );
  }

  function move(playlistId: string, delta: -1 | 1) {
    const from = featuredIds.indexOf(playlistId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= featuredIds.length) return;
    const next = [...featuredIds];
    next[from] = featuredIds[to]!;
    next[to] = featuredIds[from]!;
    onFeaturedChange(next);
  }

  if (items.length === 0)
    return (
      <p className={styles.hint}>{t("settings:editProfile.playlists.empty")}</p>
    );

  return (
    <div className={styles.listWrap}>
      <p className={styles.hint}>{t("settings:editProfile.playlists.rule")}</p>
      <p className={styles.counter}>
        {t("settings:editProfile.playlists.counter", {
          count: featuredIds.length,
          max: maxFeatured,
        })}
      </p>
      <ul className={styles.list}>
        {[...featuredItems, ...restItems].map((item) => {
          const position = featuredIds.indexOf(item.id);
          const isFeatured = position >= 0;
          return (
            <li key={item.id} className={styles.row}>
              <label className={styles.pick}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isFeatured}
                  disabled={!isFeatured && isAtCap}
                  onChange={() => toggle(item.id)}
                />
                <span className={styles.cover}>
                  <StudioPlaylistCover
                    coverUrls={item.coverUrls}
                    tint={item.tint}
                    label=""
                  />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>
                    {item.name}
                    {item.visibilityLabelKey &&
                      item.visibility !== "public" && (
                        <span className={styles.chip}>
                          {t(item.visibilityLabelKey)}
                        </span>
                      )}
                  </span>
                  <span className={styles.meta}>
                    {t("members:studioPlaylists.trackCount", {
                      count: item.trackCount,
                    })}
                  </span>
                </span>
              </label>
              {isFeatured && (
                <span className={styles.actions}>
                  <button
                    type="button"
                    className={styles.reorder}
                    aria-label={t("settings:editProfile.playlists.moveUp", {
                      name: item.name,
                    })}
                    disabled={position === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    <FiArrowUp aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.reorder}
                    aria-label={t("settings:editProfile.playlists.moveDown", {
                      name: item.name,
                    })}
                    disabled={position === featuredIds.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    <FiArrowDown aria-hidden />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
