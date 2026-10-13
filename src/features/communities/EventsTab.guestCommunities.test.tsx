import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { EventsTab } from "./EventsTab";
import { getLiving } from "./livingCommunities.data";

describe("EventsTab guest gatherings", () => {
  it("says which community leads a gathering this one joined", () => {
    render(
      <TestProviders>
        <EventsTab
          events={[
            {
              id: "collab",
              dd: "1",
              mm: "Nov",
              title: "End-of-Month Run",
              meta: "Saturday · Tejo path",
              leadCommunityName: "Queer Runners Lisboa",
            },
            {
              id: "own",
              dd: "3",
              mm: "Nov",
              title: "Peer support circle",
              meta: "Monday · members only",
            },
          ]}
          communitySlug="trans-hub"
          isMember
          isStaff={false}
        />
      </TestProviders>,
    );
    expect(screen.getByText("With Queer Runners Lisboa")).toBeInTheDocument();
    expect(screen.queryAllByText(/^With /)).toHaveLength(1);
  });

  it("lists the demo collab on the guest community's page", () => {
    expect(
      getLiving("trans-hub")?.events.some(
        (event) => event.leadCommunityName === "Queer Runners Lisboa",
      ),
    ).toBe(true);
  });
});
