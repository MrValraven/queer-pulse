import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "../eventHostScope";
import type { GatheringForm } from "../useGatheringForm";
import { PreviewHostRow } from "./PreviewHostRow";

vi.mock("../../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/authContext")
  >()),
  useAuth: () => ({
    user: {
      profile: {
        slug: "beatriz-s",
        firstName: "Beatriz",
        lastName: "Santos",
        avatarUrl: null,
      },
    },
  }),
}));

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
};

/** Only the members the host row reads. */
const freeFormWithNoCohosts = {
  cost: "",
  costKind: "free",
  cohosts: [],
} as unknown as GatheringForm;

describe("PreviewHostRow", () => {
  it("names QueerPulse as the host of a house event, with no staff face", async () => {
    render(
      <I18nProvider>
        <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
          <PreviewHostRow form={freeFormWithNoCohosts} />
        </EventHostScopeContext.Provider>
      </I18nProvider>,
    );
    const hostName = await screen.findByText("QueerPulse");
    expect(hostName.tagName).toBe("B");
    expect(screen.queryByText("Beatriz")).toBeNull();
    expect(screen.queryByText("BS")).toBeNull();
  });

  it("names the signed-in member in the member scope", async () => {
    render(
      <I18nProvider>
        <PreviewHostRow form={freeFormWithNoCohosts} />
      </I18nProvider>,
    );
    expect(await screen.findByText("Beatriz")).toBeInTheDocument();
    expect(screen.queryByText("QueerPulse")).toBeNull();
  });
});
