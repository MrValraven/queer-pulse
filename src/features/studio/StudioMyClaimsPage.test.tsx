import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioMyClaimView } from "./api/studioSafety.adapters";
import { StudioMyClaimCard } from "./StudioMyClaimCard";

const withdraw = vi.fn();
vi.mock("./api/useStudioClaims", () => ({
  useWithdrawStudioClaim: () => ({ mutate: withdraw, isPending: false }),
  useReplyToStudioClaim: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: () => {},
  }),
}));

const countered: StudioMyClaimView = {
  id: "claim-1",
  status: "countered",
  claimantRole: "rights_holder",
  originalWork: "Kitchen light",
  originalLink: null,
  details: "The loop from 1:10",
  counterNote: "I made that loop in 2022",
  claimantReply: null,
  staffNote: null,
  createdAt: "2026-10-13T10:00:00.000Z",
  acceptedAt: "2026-10-13T12:00:00.000Z",
  counteredAt: "2026-10-14T09:00:00.000Z",
  repliedAt: null,
  decidedAt: null,
  canReply: true,
  canWithdraw: true,
  track: {
    id: "track-9",
    title: "The kitchen in April",
    href: "/studio/track?id=track-9",
    releaseId: "release-9",
    releaseTitle: "The kitchen in April",
    releaseHref: "/studio/album?id=release-9",
    artistName: "Rita",
    artistHref: "/studio/artist?id=p9",
  },
};

describe("StudioMyClaimCard", () => {
  it("shows the counter-notice, Reply and Withdraw claim", () => {
    render(
      <TestProviders>
        <StudioMyClaimCard claim={countered} isFocused={false} />
      </TestProviders>,
    );
    expect(screen.getByText("I made that loop in 2022")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^write a reply$/i }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /withdraw claim/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("offers neither on a closed claim", () => {
    render(
      <TestProviders>
        <StudioMyClaimCard
          claim={{
            ...countered,
            status: "upheld",
            canReply: false,
            canWithdraw: false,
            staffNote: "The loop matches",
          }}
          isFocused={false}
        />
      </TestProviders>,
    );
    expect(
      screen.queryByRole("button", { name: /^write a reply$/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /withdraw claim/i }),
    ).toBeNull();
    expect(screen.getByText("The loop matches")).toBeTruthy();
  });

  it("links the title to the release, since a held track answers 410", () => {
    render(
      <TestProviders>
        <StudioMyClaimCard claim={countered} isFocused={false} />
      </TestProviders>,
    );
    expect(
      screen
        .getByRole("link", { name: "The kitchen in April" })
        .getAttribute("href"),
    ).toBe("/studio/album?id=release-9");
  });
});
