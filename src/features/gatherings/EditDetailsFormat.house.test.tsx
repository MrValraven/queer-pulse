import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { TestProviders } from "../../test/TestProviders";
import { resolveGathering } from "./data";
import { EditDetailsFormat } from "./EditDetailsFormat";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";
import { formatsForFamily, OTHER_FORMAT_KEY } from "./gatheringCatalog";
import { HOUSE_MUSIC_DEMO_SLUGS } from "./houseMusicEvents.data";
import { editDraftFromState, liveInitialState } from "./manageGatheringState";

// A native select stands in for the design-system one, so the test can read
// every option the format list offers.
vi.mock("../../shared/components/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/components/ui")>()),
  Select: ({
    label,
    options,
    value,
    onChange,
  }: {
    label?: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string | null) => void;
  }) => (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const t: TFunction = (key) => key;
const fmt = createFormatters("en-GB");

const houseScope: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  isHouseEvent: true,
  fixedFamily: "music",
};

describe("EditDetailsFormat in the house scope", () => {
  it("keeps the family on Music and lists Music formats only", async () => {
    const draft = editDraftFromState(
      liveInitialState(
        resolveGathering(HOUSE_MUSIC_DEMO_SLUGS.clubNight),
        fmt,
        t,
      ),
    );
    render(
      <TestProviders>
        <EventHostScopeContext.Provider value={houseScope}>
          <EditDetailsFormat draft={draft} onChange={vi.fn()} />
        </EventHostScopeContext.Provider>
      </TestProviders>,
    );

    // The fixed family is quiet static text with its hint, no input.
    expect(await screen.findByText("Music")).toBeInTheDocument();
    expect(
      screen.getByText("A QueerPulse music event stays in Music"),
    ).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Music")).not.toBeInTheDocument();
    // The value is a named group described by the hint, since a paragraph
    // takes neither a label nor a description.
    expect(
      screen.getByRole("group", {
        name: "Kind of event",
        description: "A QueerPulse music event stays in Music",
      }),
    ).toHaveTextContent("Music");

    expect(
      screen.queryByRole("combobox", { name: "Kind of event" }),
    ).not.toBeInTheDocument();
    const formatSelect = screen.getByRole("combobox", { name: "Format" });
    const offeredKeys = Array.from(
      formatSelect.querySelectorAll("option"),
      (option) => option.value,
    );
    expect(offeredKeys).toEqual([
      "",
      ...formatsForFamily("music").map((format) => format.key),
      OTHER_FORMAT_KEY,
    ]);
  });
});
