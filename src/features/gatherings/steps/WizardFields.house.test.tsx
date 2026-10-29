import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "../eventHostScope";
import type { GatheringForm } from "../useGatheringForm";
import { CapacityStepperField } from "./CapacityStepperField";
import { TitleField } from "./TitleField";

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
};

function renderIn(scope: EventHostScope, children: ReactNode) {
  return render(
    <I18nProvider>
      <EventHostScopeContext.Provider value={scope}>
        {children}
      </EventHostScopeContext.Provider>
    </I18nProvider>,
  );
}

/** A capacity the host typed, so no format default line shows. */
const formWithTypedCapacity = {
  cap: "40",
  capacityDefault: null,
  setCapTouched: vi.fn(),
} as unknown as GatheringForm;

/** A title already typed, so the suggestion chips stay away. */
const formWithTitle = {
  title: "Disco",
  setTitle: vi.fn(),
} as unknown as GatheringForm;

describe("Wizard fields in the house scope", () => {
  it("says what the capacity counts, with no seat held for the host", async () => {
    renderIn(
      HOUSE_TEST_SCOPE,
      <CapacityStepperField form={formWithTypedCapacity} />,
    );
    expect(
      await screen.findByText(/How many guests can come/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/This number includes you/)).toBeNull();
  });

  it("shows a music title example in the title field, with no supper club hint", async () => {
    renderIn(HOUSE_TEST_SCOPE, <TitleField form={formWithTitle} />);
    expect(
      await screen.findByPlaceholderText("Friday club night in Marvila"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Thursday supper club/)).toBeNull();
  });
});

describe("Wizard fields in the member scope", () => {
  it("keeps the host seat line and the supper club hint", async () => {
    renderIn(
      MEMBER_HOST_SCOPE,
      <>
        <CapacityStepperField form={formWithTypedCapacity} />
        <TitleField form={formWithTitle} />
      </>,
    );
    expect(
      await screen.findByText(/This number includes you/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Thursday supper club/)).toBeInTheDocument();
  });
});
