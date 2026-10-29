import { useState } from "react";
import { FiDisc } from "react-icons/fi";
import type { ImageSlotTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  genreLabelKeyOf,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  tintForId,
} from "../studio/api/studio.adapters";
import { releaseFactsLine } from "../studio/studioFacts";
import type { AdminStudioReleaseCardDTO } from "./api/studioDiscoveryAdmin.api";
import css from "./StudioAdminPickDialog.module.css";

const TINT_CLASS: Record<ImageSlotTint, string | undefined> = {
  default: css.tintDefault,
  coral: css.tintCoral,
  jade: css.tintJade,
  plum: css.tintPlum,
};

const COVER_SIZE_PX = { sm: 44, md: 64 } as const;

export type StudioAdminReleaseSummarySize = keyof typeof COVER_SIZE_PX;

const COVER_SIZE_CLASS: Record<
  StudioAdminReleaseSummarySize,
  string | undefined
> = {
  sm: css.coverSm,
  md: css.coverMd,
};

const SUMMARY_SIZE_CLASS: Record<
  StudioAdminReleaseSummarySize,
  string | undefined
> = {
  sm: css.summarySm,
  md: css.summaryMd,
};

/** The cover in its tinted frame. Spans and an <img> only, so it can sit
 *  inside a result row's <button>. A missing or failed cover shows a disc
 *  on the tint. Decorative: the text beside it names the release. */
function StudioAdminReleaseCover({
  release,
  size,
}: {
  release: AdminStudioReleaseCardDTO;
  size: StudioAdminReleaseSummarySize;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const tintClass = TINT_CLASS[tintForId(release.id)];
  const isCoverShown =
    release.coverUrl !== null && release.coverUrl !== failedSrc;
  const sizePx = COVER_SIZE_PX[size];
  return (
    <span
      className={[css.cover, COVER_SIZE_CLASS[size], tintClass]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      {isCoverShown ? (
        <img
          className={css.coverImage}
          src={release.coverUrl ?? undefined}
          alt=""
          width={sizePx}
          height={sizePx}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(release.coverUrl)}
        />
      ) : (
        <FiDisc className={css.coverFallback} aria-hidden />
      )}
    </span>
  );
}

/** "EP · 5 faixas · 22 min · Fado": the facts line, plus the lead genre
 *  when `isGenreShown`. */
function useReleaseMetaLine(
  release: AdminStudioReleaseCardDTO,
  isGenreShown: boolean,
): string {
  const { t } = useTranslation();
  const facts = releaseFactsLine(
    {
      typeLabelKey: STUDIO_RELEASE_TYPE_LABEL_KEY[release.type],
      trackCount: release.trackCount,
      totalDurationSeconds: release.totalDurationSeconds,
    },
    t,
  );
  const leadGenre = release.genre ?? release.genres[0] ?? null;
  if (!isGenreShown || !leadGenre) return facts;
  const genreKey = genreLabelKeyOf(leadGenre);
  return `${facts} · ${genreKey ? t(genreKey) : leadGenre}`;
}

/** A release at a glance: cover, serif title, artist and the meta line.
 *  The sm size (result rows) keeps artist and facts on one line, "Rita
 *  Ferreira · Single · 4 min", so a row stays compact; the md size (chosen
 *  card, note dialog) gives the artist its own line and adds the genre.
 *  Phrasing content only, so a result row's <button> can wrap it. */
export function StudioAdminReleaseSummary({
  release,
  size,
}: {
  release: AdminStudioReleaseCardDTO;
  size: StudioAdminReleaseSummarySize;
}) {
  const isCompact = size === "sm";
  const metaLine = useReleaseMetaLine(release, !isCompact);
  return (
    <span className={`${css.summary} ${SUMMARY_SIZE_CLASS[size]}`}>
      <StudioAdminReleaseCover release={release} size={size} />
      <span className={css.summaryText}>
        <span className={css.summaryTitle}>{release.title}</span>
        {isCompact ? (
          <span className={css.summaryByline}>
            <span className={css.summaryArtist}>{release.artist.name}</span>
            {` · ${metaLine}`}
          </span>
        ) : (
          <>
            <span className={css.summaryArtist}>{release.artist.name}</span>
            <span className={css.summaryMeta}>{metaLine}</span>
          </>
        )}
      </span>
    </span>
  );
}
