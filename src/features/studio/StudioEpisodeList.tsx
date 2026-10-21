import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse, useChipMotion } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseView } from "./api/studio.adapters";
import {
  orderedEpisodes,
  type StudioEpisodeOrder,
  type StudioEpisodeRowView,
} from "./api/studioEpisodes";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioEpisodeRow } from "./StudioEpisodeRow";
import { studioEpisodeUploadPath } from "./studioPaths";
import css from "./StudioShow.module.css";

const ORDER_OPTIONS: { id: StudioEpisodeOrder; labelKey: string }[] = [
  { id: "newest", labelKey: "studio:show.sortNewest" },
  { id: "oldest", labelKey: "studio:show.sortOldest" },
];

/** Rows glide to their new place when the order flips and fade in and out
 *  when an episode arrives or leaves. The labelled list exists only with
 *  rows in it, and folds away with its last one. */
function EpisodeItems({
  episodes,
  release,
  label,
  headingLevel,
}: {
  episodes: StudioEpisodeRowView[];
  release: StudioReleaseView;
  label: string;
  headingLevel: 3 | 4;
}) {
  const shouldHideExplicit = useStudioHideExplicit();
  return (
    <Collapse isOpen={episodes.length > 0}>
      <ol className={css.list} aria-label={label}>
        <AnimatePresence initial={false}>
          {episodes.map((episode) => (
            <StudioEpisodeRow
              key={episode.id}
              episode={episode}
              release={release}
              index={(episode.number ?? episode.position) - 1}
              headingLevel={headingLevel}
              shouldHideExplicit={shouldHideExplicit}
            />
          ))}
        </AnimatePresence>
      </ol>
    </Collapse>
  );
}

/** Episodes newest or oldest first; the owner's drafts below, apart, with
 *  Add episode on a live show (spec 5.2, 6.2). */
export function StudioEpisodeList({
  release,
  published,
  drafts,
}: {
  release: StudioReleaseView;
  published: StudioEpisodeRowView[];
  drafts: StudioEpisodeRowView[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const [order, setOrder] = useState<StudioEpisodeOrder>("newest");
  const { chip } = useChipMotion();
  const canAddEpisode = release.isOwner && release.status === "published";
  // An order to choose needs two episodes at least.
  const isOrderShown = published.length >= 2;
  return (
    <section className={css.episodes} aria-labelledby={headingId}>
      <div className={css.listHead}>
        <h2 id={headingId}>{t("studio:show.episodesHeading")}</h2>
        <AnimatePresence initial={false}>
          {isOrderShown && (
            <m.div
              key="order"
              role="group"
              aria-label={t("studio:show.sortLabel")}
              className={css.sort}
              {...chip}
            >
              {ORDER_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant="quiet"
                  size="sm"
                  className={css.sortButton}
                  aria-pressed={order === option.id}
                  onClick={() => setOrder(option.id)}
                >
                  {t(option.labelKey)}
                </Button>
              ))}
            </m.div>
          )}
        </AnimatePresence>
        {canAddEpisode && (
          <Link to={studioEpisodeUploadPath(release.id)} className={css.add}>
            <FiPlus aria-hidden /> {t("studio:show.addEpisodeCta")}
          </Link>
        )}
      </div>
      <Collapse isOpen={published.length === 0}>
        <p className={css.empty}>{t("studio:show.noEpisodes")}</p>
      </Collapse>
      <EpisodeItems
        episodes={orderedEpisodes(published, order)}
        release={release}
        label={t("studio:show.listLabel", { title: release.title })}
        headingLevel={3}
      />
      {release.isOwner && (
        <Collapse isOpen={drafts.length > 0}>
          <h3 className={css.draftsHeading}>
            {t("studio:show.draftsHeading")}
          </h3>
          <EpisodeItems
            episodes={drafts}
            release={release}
            label={t("studio:show.draftsHeading")}
            headingLevel={4}
          />
        </Collapse>
      )}
    </section>
  );
}
