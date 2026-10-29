import {
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioGenre,
  type StudioMood,
  type StudioWelcomeDTO,
  type StudioWelcomeUpdateDTO,
} from "./studio.types";

/** The welcome as the screens read it. `taste` is null until the account has
 *  closed the welcome or picked something. */
export interface StudioWelcomeView {
  hasSeenWelcome: boolean;
  taste: {
    genres: readonly StudioGenre[];
    moods: readonly StudioMood[];
  } | null;
}

export const DEFAULT_STUDIO_WELCOME_VIEW: StudioWelcomeView = {
  hasSeenWelcome: false,
  taste: null,
};

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);
const KNOWN_MOODS: ReadonlySet<string> = new Set(STUDIO_MOODS);

/** Values outside today's vocabularies (a newer server) are dropped, so the
 *  ordering never gets a tile it cannot place. */
export function toStudioWelcomeView(dto: StudioWelcomeDTO): StudioWelcomeView {
  const genres = (dto.genres ?? []).filter((genre) => KNOWN_GENRES.has(genre));
  const moods = (dto.moods ?? []).filter((mood) => KNOWN_MOODS.has(mood));
  const hasPicks = genres.length > 0 || moods.length > 0;
  return {
    hasSeenWelcome: dto.hasSeenWelcome === true,
    taste: dto.hasSeenWelcome === true || hasPicks ? { genres, moods } : null,
  };
}

/** What the cache shows while a save is in flight: the stored view with the
 *  update laid over it. */
export function applyStudioWelcomeUpdate(
  previous: StudioWelcomeView,
  update: StudioWelcomeUpdateDTO,
): StudioWelcomeView {
  return {
    hasSeenWelcome: previous.hasSeenWelcome || update.hasSeenWelcome === true,
    taste: {
      genres: update.genres ?? previous.taste?.genres ?? [],
      moods: update.moods ?? previous.taste?.moods ?? [],
    },
  };
}
