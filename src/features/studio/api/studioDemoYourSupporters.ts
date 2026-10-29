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

interface DemoSupporterRow {
  shownAsSubprofileId: string | null;
  since: string;
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

function stateOf(subprofileId: string): StudioSupporterStateDTO {
  const row = supporterRows().get(subprofileId);
  return {
    isSupporting: row !== undefined,
    shownAsSubprofileId: row?.shownAsSubprofileId ?? null,
    shownAs: row ? identityOf(row.shownAsSubprofileId) : null,
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
  if (
    existing === undefined ||
    existing.shownAsSubprofileId !== shownAsSubprofileId
  ) {
    supporterRows().set(subprofileId, {
      shownAsSubprofileId,
      since: existing?.since ?? new Date().toISOString(),
    });
  }
  return stateOf(subprofileId);
}

export function demoDeleteStudioSupporter(subprofileId: string): void {
  supporterRows().delete(subprofileId);
}

/** Newest opt-in first. */
export function demoStudioListeningSupporting(): StudioSupportingResponseDTO {
  const rows = [...supporterRows().entries()].sort(([, left], [, right]) =>
    right.since.localeCompare(left.since),
  );
  return {
    items: rows.flatMap(([subprofileId, row]) => {
      const artist = catalogueArtistOf(subprofileId);
      return artist
        ? [
            {
              artist,
              since: row.since,
              shownAs: identityOf(row.shownAsSubprofileId),
              supportLinks: demoSupportLinksFor(artist.id),
              isFollowing: demoIsFollowingArtist(artist.id),
            },
          ]
        : [];
    }),
  };
}
