import { m, useIsPresent } from "motion/react";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useFormat } from "../../shared/i18n/format";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlacementView } from "./api/studioDashboard.adapters";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import styles from "./StudioPlacements.module.css";

/** One public playlist holding the persona's tracks. The playlist name is the
 *  row's only interactive element and stretches over the whole row. */
export function StudioPlacementRow({
  placement,
  index,
}: {
  placement: StudioPlacementView;
  index: number;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const { playlist, tracks, hiddenTrackCount, latestAddedAt } = placement;
  const listItems = tracks.map((track) => track.title);
  if (hiddenTrackCount > 0) {
    listItems.push(
      t("studio:numbers.placements.moreTracks", { count: hiddenTrackCount }),
    );
  }
  const titles = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  }).format(listItems);
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  return (
    <m.li
      className={styles.row}
      inert={!isPresent}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={styles.rowInner}>
        <span className={styles.cover}>
          <StudioPlaylistCover
            coverUrls={playlist.coverUrls}
            tint={playlist.tint}
            label={playlist.name}
            radius={8}
          />
        </span>
        <div className={styles.text}>
          <Link to={playlist.href} className={styles.name}>
            {playlist.name}
          </Link>
          <p className={styles.byline}>
            {t("studio:share.card.byline", { name: playlist.credit.name })}
          </p>
          <p className={styles.tracks}>
            {t("studio:numbers.placements.yourTracks", { titles })}
          </p>
          <p className={styles.byline}>
            {t("studio:numbers.placements.lastAdded", {
              date: fmt.date(latestAddedAt, { day: "numeric", month: "short" }),
            })}
          </p>
        </div>
      </div>
    </m.li>
  );
}
