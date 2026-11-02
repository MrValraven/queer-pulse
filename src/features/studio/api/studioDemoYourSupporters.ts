import { ApiError } from "../../../shared/api/client";
import type {
  StudioArtistRefDTO,
  StudioPlaylistPersonDTO,
} from "./studio.types";
import type {
  StudioSupporterIdentityDTO,
  StudioSupporterOptionDTO,
  StudioSupporterPersonaDTO,
  StudioSupporterStateDTO,
  StudioSupportingResponseDTO,
} from "./studioListening.types";
import { demoIsFollowingArtist, demoSupportLinksFor } from "./studioDemoCards";
import { DEMO_ARTISTS } from "./studioDemo.data";
import { DEMO_FORMAT_ARTISTS } from "./studioDemoFormats.data";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import {
  DEMO_ACCOUNT_MEMBER,
  DEMO_SUPPORTER_SEEDS,
} from "./studioDemoYourListening.data";

// The demo viewer is shown among the top listeners of every artist they
// play until they hide from one. A row exists only once the viewer changed
// that default: it keeps the identity even while hidden, so turning the
// switch back on restores it.
interface DemoSupporterRow {
  shownAsSubprofileId: string | null;
  isShown: boolean;
  /** When the viewer last turned it on; null while hidden. */
  since: string | null;
}

let supporterStore: Map<string, DemoSupporterRow> | null = null;

function supporterRows(): Map<string, DemoSupporterRow> {
  if (supporterStore === null) {
    const nowMilliseconds = Date.now();
    supporterStore = new Map(
      DEMO_SUPPORTER_SEEDS.map((seed) => [
        seed.subprofileId,
        {
          shownAsSubprofileId: seed.shownAsSubprofileId,
          isShown: true,
          since: new Date(
            nowMilliseconds - seed.daysAgo * 24 * 3600 * 1000,
          ).toISOString(),
        },
      ]),
    );
  }
  return supporterStore;
}

export function resetDemoYourSupporters(): void {
  supporterStore = null;
}

function catalogueArtistOf(subprofileId: string): StudioArtistRefDTO | null {
  return (
    [...DEMO_ARTISTS, ...DEMO_FORMAT_ARTISTS].find(
      (artist) => artist.id === subprofileId,
    ) ?? null
  );
}

export function personaIdentityOf(
  persona: StudioArtistRefDTO,
): StudioSupporterIdentityDTO {
  const identityPersona: StudioSupporterPersonaDTO = {
    id: persona.id,
    handle: persona.handle,
    name: persona.name,
    kind: persona.kind,
    avatarUrl: persona.avatarUrl,
    isLinkable: persona.handle !== "",
  };
  return { kind: "persona", persona: identityPersona };
}

const accountIdentity = (
  member: StudioPlaylistPersonDTO,
): StudioSupporterIdentityDTO => ({ kind: "account", member });

export function identityOf(
  shownAsSubprofileId: string | null,
): StudioSupporterIdentityDTO {
  const persona = DEMO_STUDIO_ME.uploadablePersonas.find(
    (candidate) => candidate.id === shownAsSubprofileId,
  );
  return persona
    ? personaIdentityOf(persona)
    : accountIdentity(DEMO_ACCOUNT_MEMBER);
}

/** The server's order: 404 for an artist outside the catalogue, then 403 for
 *  a persona the viewer owns. */
function artistToSupport(subprofileId: string): StudioArtistRefDTO {
  const artist = catalogueArtistOf(subprofileId);
  if (artist === null) {
    throw new ApiError(404, "This artist is not available to support.", {
      statusCode: 404,
      code: "studio_supporter_artist_not_found",
    });
  }
  if (
    DEMO_STUDIO_ME.uploadablePersonas.some((owned) => owned.id === artist.id)
  ) {
    throw new ApiError(
      403,
      "You are a member of this artist, so you cannot be its supporter.",
      { statusCode: 403, code: "studio_supporter_own_persona" },
    );
  }
  return artist;
}

export function optionsOfViewer(): StudioSupporterOptionDTO[] {
  const personas = [...DEMO_STUDIO_ME.uploadablePersonas].sort(
    (left, right) =>
      left.name.localeCompare(right.name) || left.id.localeCompare(right.id),
  );
  return [
    {
      shownAsSubprofileId: null,
      identity: accountIdentity(DEMO_ACCOUNT_MEMBER),
    },
    ...personas.map((persona) => ({
      shownAsSubprofileId: persona.id,
      identity: personaIdentityOf(persona),
    })),
  ];
}

/** No row reads as the default: shown as the account, with no since. */
function stateOf(subprofileId: string): StudioSupporterStateDTO {
  const row = supporterRows().get(subprofileId);
  const shownAsSubprofileId = row?.shownAsSubprofileId ?? null;
  return {
    isSupporting: row?.isShown ?? true,
    shownAsSubprofileId,
    shownAs: identityOf(shownAsSubprofileId),
    since: row?.since ?? null,
    options: optionsOfViewer(),
  };
}

export function demoStudioSupporterState(
  subprofileId: string,
): StudioSupporterStateDTO {
  artistToSupport(subprofileId);
  return stateOf(subprofileId);
}

export function demoPutStudioSupporter(
  subprofileId: string,
  shownAsSubprofileId: string | null,
): StudioSupporterStateDTO {
  artistToSupport(subprofileId);
  if (
    shownAsSubprofileId !== null &&
    !DEMO_STUDIO_ME.uploadablePersonas.some(
      (persona) => persona.id === shownAsSubprofileId,
    )
  ) {
    throw new ApiError(
      403,
      "You can show yourself only as your account or a persona you are a member of.",
      { statusCode: 403, code: "studio_supporter_identity_not_yours" },
    );
  }
  const existing = supporterRows().get(subprofileId);
  supporterRows().set(subprofileId, {
    shownAsSubprofileId,
    isShown: true,
    since:
      existing?.isShown === true && existing.since !== null
        ? existing.since
        : new Date().toISOString(),
  });
  return stateOf(subprofileId);
}

/** Hides the viewer and keeps the identity they showed as. */
export function demoDeleteStudioSupporter(subprofileId: string): void {
  const existing = supporterRows().get(subprofileId);
  supporterRows().set(subprofileId, {
    shownAsSubprofileId: existing?.shownAsSubprofileId ?? null,
    isShown: false,
    since: null,
  });
}

/** The artists the viewer played in the last 28 days (`recentArtistIds`,
 *  in the caller's order) that the viewer did not hide from, each with the
 *  identity it sees. */
export function demoSupportingOf(
  recentArtistIds: readonly string[],
): StudioSupportingResponseDTO {
  return {
    items: recentArtistIds.flatMap((subprofileId) => {
      const artist = catalogueArtistOf(subprofileId);
      const row = supporterRows().get(subprofileId);
      const isOwned = DEMO_STUDIO_ME.uploadablePersonas.some(
        (owned) => owned.id === subprofileId,
      );
      if (artist === null || isOwned || row?.isShown === false) return [];
      return [
        {
          artist,
          since: row?.since ?? null,
          shownAs: identityOf(row?.shownAsSubprofileId ?? null),
          supportLinks: demoSupportLinksFor(artist.id),
          isFollowing: demoIsFollowingArtist(artist.id),
        },
      ];
    }),
  };
}
