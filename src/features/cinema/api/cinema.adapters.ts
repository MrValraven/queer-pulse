import type { TitleKind, TitleListItemDTO } from "./cinema.api";

/**
 * A catalog title mapped to what the live browse grid and watch header render.
 * Kept deliberately lean — the rich mock `CinemaFilm` fields (curator notes,
 * tint, badges, subtitle chips) have no backend home, so live mode shows the
 * real title, cover, runtime, view count and resume progress instead.
 */
export interface CinemaTitleCard {
  id: string;
  kind: TitleKind;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  /** Human runtime label ("1h 32m" / "18 min"), or null when unknown. */
  durationLabel: string | null;
  durationSeconds: number | null;
  viewCount: number;
  /** Resume progress 0–100, or null when there is no saved position. */
  progressPercent: number | null;
  /** True once the member has watched to the end. */
  finished: boolean;
  resumePositionSeconds: number;
}

/** Seconds → "1h 32m" / "18 min"; null when duration is unknown or zero. */
export function formatDurationLabel(
  durationSeconds: number | null,
): string | null {
  if (durationSeconds == null || durationSeconds <= 0) return null;
  const totalMinutes = Math.round(durationSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}

function progressPercentOf(dto: TitleListItemDTO): number | null {
  if (
    !dto.myProgress ||
    dto.durationSeconds == null ||
    dto.durationSeconds <= 0
  ) {
    return null;
  }
  if (dto.myProgress.finished) return 100;
  const percent = (dto.myProgress.positionSeconds / dto.durationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/** Map a catalog title DTO to the browse/watch card view-model. */
export function titleToCard(dto: TitleListItemDTO): CinemaTitleCard {
  return {
    id: dto.id,
    kind: dto.kind,
    title: dto.title,
    description: dto.description,
    coverImageUrl: dto.coverImageUrl,
    durationLabel: formatDurationLabel(dto.durationSeconds),
    durationSeconds: dto.durationSeconds,
    viewCount: dto.viewCount,
    progressPercent: progressPercentOf(dto),
    finished: dto.myProgress?.finished ?? false,
    resumePositionSeconds: dto.myProgress?.positionSeconds ?? 0,
  };
}
