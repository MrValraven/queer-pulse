import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { EventVisibility } from "./api/events.api";
import { AudienceScopeField } from "./AudienceScopeField";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
};

function renderField(value: EventVisibility) {
  return render(
    <TestProviders>
      <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
        <AudienceScopeField
          value={value}
          onChange={vi.fn()}
          communityAvailable={false}
          fieldId="audience"
        />
      </EventHostScopeContext.Provider>
    </TestProviders>,
  );
}

describe("AudienceScopeField in the house scope", () => {
  it("offers Public and Invite only for an event saved with one of them", () => {
    renderField("invite_only");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(
      radios.filter((radio) => radio.getAttribute("aria-checked") === "true"),
    ).toHaveLength(1);
  });

  it("keeps a legacy audience on offer and chosen", () => {
    renderField("network");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    const checkedRadios = radios.filter(
      (radio) => radio.getAttribute("aria-checked") === "true",
    );
    expect(checkedRadios).toHaveLength(1);
  });
});
