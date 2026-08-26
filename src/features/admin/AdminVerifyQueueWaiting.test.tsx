import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminVerifyQueueWaiting } from "./AdminVerifyQueueWaiting";
import { makeJoinRequestRow } from "./joinRequestTestRow";
import { useJoinRequestAssignment } from "./useJoinRequestAssignment";
import { useJoinRequestQueueDecisions } from "./useJoinRequestQueueDecisions";
import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * Selection is the gate on every bulk action, so it is exercised through the
 * real hooks rather than with stand-in props: the checkbox on a card, the
 * select-all above them and the bar that appears are one wiring, and a test
 * that hand-fed a selection would pass with that wiring broken.
 */
function Harness({ rows }: { rows: JoinRequestView[] }) {
  const assignment = useJoinRequestAssignment();
  const decisions = useJoinRequestQueueDecisions(rows);
  return (
    <AdminVerifyQueueWaiting
      pending={rows}
      waitlisted={[]}
      isLoading={false}
      decisions={decisions}
      assignment={assignment}
    />
  );
}

const rows = [
  makeJoinRequestRow({ id: "req-1", name: "Kai Mendes" }),
  makeJoinRequestRow({ id: "req-2", name: "Ana Ferreira" }),
];

function renderQueue() {
  render(<Harness rows={rows} />, { wrapper: TestProviders });
}

describe("AdminVerifyQueueWaiting selection", () => {
  it("keeps the bulk bar hidden until something is selected", async () => {
    renderQueue();

    // Waits on the lazily-loaded admin namespace before asserting an absence.
    await screen.findByRole("checkbox", {
      name: "Select Kai Mendes's request",
    });
    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();
  });

  it("names the applicant on every checkbox and the exact set on select-all", async () => {
    renderQueue();

    expect(
      await screen.findByRole("checkbox", {
        name: "Select Kai Mendes's request",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select Ana Ferreira's request" }),
    ).toBeInTheDocument();
    // Select-all says the set it takes: the requests waiting on this page,
    // never the whole queue and never the waitlisted section.
    expect(
      screen.getByRole("checkbox", {
        name: "Select all 2 requests waiting here",
      }),
    ).toBeInTheDocument();
  });

  it("brings up the bulk bar with a live count as rows are selected", async () => {
    const user = userEvent.setup();
    renderQueue();

    await user.click(
      await screen.findByRole("checkbox", {
        name: "Select Kai Mendes's request",
      }),
    );

    expect(
      await screen.findByRole("region", { name: "Bulk actions" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Select Ana Ferreira's request" }),
    );
    expect(await screen.findByText("2 selected")).toBeInTheDocument();
  });

  it("takes the whole visible page with select-all, and gives it back again", async () => {
    const user = userEvent.setup();
    renderQueue();

    const selectAll = await screen.findByRole("checkbox", {
      name: "Select all 2 requests waiting here",
    });
    await user.click(selectAll);

    expect(await screen.findByText("2 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select Kai Mendes's request" }),
    ).toBeChecked();

    await user.click(selectAll);
    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();
  });
});
