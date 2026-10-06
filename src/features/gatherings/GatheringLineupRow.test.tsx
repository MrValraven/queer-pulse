import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { EventLineupEntryDTO, LineupEntryStatus } from "./api/events.api";
import { GatheringLineupRow } from "./GatheringLineupRow";

/**
 * One row of the host's lineup editor. Each status reads as its own chip
 * (Invited, Confirmed, Declined); a declined row swaps the role control for
 * "Invite again", which waits while the lineup is at its cap.
 */
function entryWith(status: LineupEntryStatus): EventLineupEntryDTO {
  return {
    id: `entry-${status}`,
    slug: "ines",
    name: "Inês Tavares",
    avatarUrl: null,
    role: "dj",
    status,
  };
}

function renderRow(
  status: LineupEntryStatus,
  { isInviteAgainDisabled = false }: { isInviteAgainDisabled?: boolean } = {},
) {
  render(
    <TestProviders>
      <GatheringLineupRow
        entry={entryWith(status)}
        isCreating={false}
        isInviteAgainDisabled={isInviteAgainDisabled}
        onRoleChange={vi.fn()}
        onRemove={vi.fn()}
        onInviteAgain={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("GatheringLineupRow", () => {
  it("marks a pending invite as Invited and keeps the role control", async () => {
    renderRow("pending");
    expect(await screen.findByText("Invited")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Their role" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Invite again" }),
    ).not.toBeInTheDocument();
  });

  it("marks an accepted invite as Confirmed and keeps the role control", async () => {
    renderRow("accepted");
    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Their role" }),
    ).toBeInTheDocument();
  });

  it("marks a decline as Declined and offers Invite again in place of the role control", async () => {
    renderRow("declined");
    expect(await screen.findByText("Declined")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite again" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Their role" }),
    ).not.toBeInTheDocument();
  });

  it("disables Invite again while the lineup is at its cap", async () => {
    renderRow("declined", { isInviteAgainDisabled: true });
    expect(
      await screen.findByRole("button", { name: "Invite again" }),
    ).toBeDisabled();
  });
});
