import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import { toProfileEventsVM } from "./profileEvents.adapters";
import type {
  ProfileEventCardDTO,
  ProfileEventRole,
} from "./profileEvents.api";

/** The card adapter only translates chrome labels, so echoing the key is
 *  enough here. */
const translate = ((key: string) => key) as TFunction;

function card(
  slug: string,
  overrides: Partial<ProfileEventCardDTO> = {},
): ProfileEventCardDTO {
  return {
    slug,
    title: `Event ${slug}`,
    startAt: "2026-11-02T19:00:00.000Z",
    neighbourhood: "Anjos",
    role: "host",
    ...overrides,
  };
}

describe("toProfileEventsVM", () => {
  it("maps each card to a calendar event and keeps its role", () => {
    const viewModel = toProfileEventsVM(
      {
        upcoming: [card("supper"), card("walk", { role: "cohost" })],
        past: [card("brunch", { startAt: "2026-06-21T11:00:00.000Z" })],
      },
      translate,
    );
    expect(viewModel.upcoming.map((item) => item.event.slug)).toEqual([
      "supper",
      "walk",
    ]);
    expect(viewModel.upcoming.map((item) => item.role)).toEqual([
      "host",
      "cohost",
    ]);
    expect(viewModel.upcoming[0]?.event.title).toBe("Event supper");
    expect(viewModel.upcoming[0]?.event.date).toEqual(
      new Date("2026-11-02T19:00:00.000Z"),
    );
    expect(viewModel.past[0]?.event.slug).toBe("brunch");
    expect(viewModel.past[0]?.role).toBe("host");
  });

  it("keeps the order the server sent", () => {
    const viewModel = toProfileEventsVM(
      {
        upcoming: [
          card("later", { startAt: "2026-12-01T19:00:00.000Z" }),
          card("sooner", { startAt: "2026-11-01T19:00:00.000Z" }),
        ],
        past: [],
      },
      translate,
    );
    expect(viewModel.upcoming.map((item) => item.event.slug)).toEqual([
      "later",
      "sooner",
    ]);
  });

  it("reads a card with an unknown role as hosted", () => {
    const unknownRoleCard: ProfileEventCardDTO = {
      ...card("odd"),
      role: "lineup" as unknown as ProfileEventRole,
    };
    const viewModel = toProfileEventsVM(
      { upcoming: [unknownRoleCard], past: [] },
      translate,
    );
    expect(viewModel.upcoming[0]?.role).toBe("host");
  });

  it("returns two empty lists for a limited profile's answer", () => {
    expect(toProfileEventsVM({ upcoming: [], past: [] }, translate)).toEqual({
      upcoming: [],
      past: [],
    });
  });
});
