/**
 * The demo VJ library's upcoming events and pack event links (contract 6.2,
 * 9.5), re-exported from `vjDemoStore.ts`. The three demo event fixtures
 * stand in for the published public and members events the backend lists,
 * so every one of them is linkable and `VJ_EVENT_NOT_LINKABLE` never arises.
 */
import type {
  VjEventOptionListDTO,
  VjPackDTO,
  VjPackEventDTO,
} from "../../../shared/contracts/vj";
import { VJ_DEMO_EVENTS, type VjDemoEventFixture } from "./vjDemoEvents.data";
import { isVjUuid, vjRefusal } from "./vjDemoRules";
import {
  toVjDemoEventCardDto,
  toVjDemoEventOptionDto,
  toVjDemoPackDto,
  vjDemoEventFixtureOf,
} from "./vjDemoStoreDto";
import {
  commitVjDemoLibrary,
  findVjDemoPack,
  isoAt,
  loadVjDemoLibrary,
  vjDemoNow,
} from "./vjDemoStorePersistence";

const HOUR_MS = 60 * 60 * 1000;
/** An event that started up to this long ago is still listed. */
const STARTED_LISTED_MS = 12 * HOUR_MS;
/** An event with no end counts as over this long after its start. */
const UNSET_END_MS = 6 * HOUR_MS;
const UPCOMING_EVENTS_MAX = 50;

/** The backend's upcoming rule: started at most 12 hours ago and not yet
 *  over, an unset end counting as six hours after the start. */
function isUpcoming(fixture: VjDemoEventFixture): boolean {
  const endOffsetMs =
    fixture.startOffsetMs + (fixture.durationMs ?? UNSET_END_MS);
  return fixture.startOffsetMs >= -STARTED_LISTED_MS && endOffsetMs >= 0;
}

function compareIds(first: string, second: string): number {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

/** The events a pack may link to now: start ascending, then id ascending,
 *  at most 50. */
export function demoGetVjUpcomingEvents(): VjEventOptionListDTO {
  const now = vjDemoNow();
  const fixtures = VJ_DEMO_EVENTS.filter(isUpcoming)
    .sort(
      (first, second) =>
        first.startOffsetMs - second.startOffsetMs ||
        compareIds(first.id, second.id),
    )
    .slice(0, UPCOMING_EVENTS_MAX);
  return {
    items: fixtures.map((fixture) => toVjDemoEventOptionDto(fixture, now)),
  };
}

/** The pack's event card. A pack with no link, or a link no fixture has,
 *  answers a null card and a null reason. */
export function demoGetVjPackEvent(packId: string): VjPackEventDTO {
  if (!isVjUuid(packId)) throw vjRefusal("VJ_PACK_NOT_FOUND");
  const pack = findVjDemoPack(loadVjDemoLibrary(), packId.toLowerCase());
  const fixture = vjDemoEventFixtureOf(pack.eventId);
  return {
    packId: pack.id,
    card: fixture === null ? null : toVjDemoEventCardDto(fixture, vjDemoNow()),
    unavailableReason: null,
  };
}

/** The `eventId` body: null unlinks, a uuid comes back lowercased, anything
 *  else (an absent field included) answers VJ_EVENT_NOT_FOUND. */
function readEventIdBody(value: unknown): string | null {
  if (value === null) return null;
  if (!isVjUuid(value)) throw vjRefusal("VJ_EVENT_NOT_FOUND");
  return value.toLowerCase();
}

/**
 * Links the pack to an event, or unlinks it with `eventId: null` (contract
 * 6.2 check order: the pack id, the body, the pack, then the event). The
 * event already linked, or null on an unlinked pack, writes nothing and
 * posts nothing before the event is checked (backend plan note 14); a change
 * bumps `updatedAt` and posts `pack_event_changed`.
 */
export function demoSetVjPackEvent(
  packId: string,
  body: { eventId: unknown },
): VjPackDTO {
  if (!isVjUuid(packId)) throw vjRefusal("VJ_PACK_NOT_FOUND");
  const eventId = readEventIdBody(body.eventId);
  const library = loadVjDemoLibrary();
  const pack = findVjDemoPack(library, packId.toLowerCase());
  if (pack.eventId === eventId) return toVjDemoPackDto(library, pack);
  if (eventId !== null && vjDemoEventFixtureOf(eventId) === null) {
    throw vjRefusal("VJ_EVENT_NOT_FOUND");
  }
  pack.eventId = eventId;
  pack.updatedAt = isoAt(vjDemoNow());
  commitVjDemoLibrary(library, {
    kind: "pack_event_changed",
    packId: pack.id,
    eventId,
  });
  return toVjDemoPackDto(library, pack);
}
