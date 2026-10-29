import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "../eventHostScope";
import type { GatheringForm } from "../useGatheringForm";
import { FormatPicker } from "./FormatPicker";

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
};

/** Only the members `FormatPicker` reads: a form on the fixed family with no
 *  format picked yet. */
function musicFormWithNoFormat(): GatheringForm {
  return {
    family: "music",
    format: "",
    otherText: "",
    setOtherText: vi.fn(),
    selectFamily: vi.fn(),
    selectFormat: vi.fn(),
  } as unknown as GatheringForm;
}

describe("FormatPicker in the house scope", () => {
  it("shows the five Music formats and Something else, with no family row", async () => {
    render(
      <I18nProvider>
        <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
          <FormatPicker form={musicFormWithNoFormat()} />
        </EventHostScopeContext.Provider>
      </I18nProvider>,
    );
    expect(await screen.findByText("Club night")).toBeInTheDocument();
    const options = screen.getAllByRole("radio");
    const expectedNames = [
      "Club night",
      "Listening party",
      "Karaoke",
      "Jam session",
      "Live performance",
      "Something else",
    ];
    expect(options).toHaveLength(expectedNames.length);
    expectedNames.forEach((name, optionIndex) => {
      expect(within(options[optionIndex]!).getByText(name)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("radiogroup", { name: "Kind of event" }),
    ).toBeNull();
    expect(screen.queryByText("Kind of event")).toBeNull();
  });

  it("suggests music formats in the search field", async () => {
    render(
      <I18nProvider>
        <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
          <FormatPicker form={musicFormWithNoFormat()} />
        </EventHostScopeContext.Provider>
      </I18nProvider>,
    );
    expect(
      await screen.findByPlaceholderText("Club night, karaoke, jam session"),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Picnic, karaoke, book club"),
    ).toBeNull();
  });
});
