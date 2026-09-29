import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { CommunityRulesState } from "./api/useCommunityJoin";
import { JoinModal } from "./JoinModal";

/**
 * The wizard's answer handling, driven through the real steps on a community
 * with no house rules, so the wizard is intro then about. Most cases use an
 * open (`public`) community; the request-tier case uses `invite`.
 * `useCommunityRules` is mocked to that no-rules state; `onJoined` and
 * `onRequested` are the joins a card mount hands in, resolved or rejected per
 * case. The communities catalog loads lazily, so each step is found with a
 * `findBy` query.
 */
const NO_RULES_STATE: CommunityRulesState = {
  rules: [],
  hasRules: false,
  rulesVersion: 1,
  acceptedVersion: null,
  isLoading: false,
  refetch: () => {},
};

vi.mock("./api/useCommunityJoin", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useCommunityRules: () => NO_RULES_STATE,
}));

const COMMUNITY = {
  name: "Queer Youth",
  typeLabel: "Social",
  count: "12 members",
  description: "A place to meet.",
  slug: "queer-youth",
};

async function joinThroughWizard(onJoined: () => Promise<unknown>) {
  render(
    <TestProviders>
      <JoinModal
        community={COMMUNITY}
        tier="public"
        onClose={() => {}}
        onJoined={onJoined}
      />
    </TestProviders>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Join the community" }),
  );
}

describe("JoinModal", () => {
  it("a public join answered with requested shows the held-for-review step", async () => {
    await joinThroughWizard(() =>
      Promise.resolve({ outcome: "requested", role: null, request: null }),
    );

    expect(
      await screen.findByText("A moderator will look first"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Your request is with the mods"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/welcome to queer youth/i),
    ).not.toBeInTheDocument();
  });

  it("a request wizard answered with joined shows the welcome step", async () => {
    const onRequested = vi.fn(() =>
      Promise.resolve({ outcome: "joined", role: "member", request: null }),
    );
    render(
      <TestProviders>
        <JoinModal
          community={COMMUNITY}
          tier="invite"
          onClose={() => {}}
          onRequested={onRequested}
        />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Send request" }),
    );

    expect(
      await screen.findByText("Welcome to Queer Youth"),
    ).toBeInTheDocument();
    expect(onRequested).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Your request is with the mods"),
    ).not.toBeInTheDocument();
  });

  it("moving to the next step focuses that step's heading", async () => {
    render(
      <TestProviders>
        <JoinModal community={COMMUNITY} tier="public" onClose={() => {}} />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Continue" }));

    expect(
      await screen.findByRole("heading", {
        name: "How should the community know you?",
      }),
    ).toHaveFocus();
  });

  it("a refusal focuses the refusal panel's heading", async () => {
    await joinThroughWizard(() =>
      Promise.reject(
        new ApiError(409, "Request already pending", {
          code: "COMMUNITY_JOIN_REQUEST_PENDING",
        }),
      ),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Your request is already in",
      }),
    ).toHaveFocus();
  });

  it("an uncoded failure shows the translated fallback and hides the server message", async () => {
    await joinThroughWizard(() =>
      Promise.reject(new ApiError(400, "note must be shorter", {})),
    );

    expect(
      await screen.findByText("That didn't go through. Try again in a moment."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/note must be shorter/i)).not.toBeInTheDocument();
  });

  it("a frozen refusal renders the pause panel", async () => {
    await joinThroughWizard(() =>
      Promise.reject(
        new ApiError(403, "This community is frozen", {
          code: "COMMUNITY_FROZEN",
          frozenReason: "manual",
        }),
      ),
    );

    expect(
      await screen.findByText("This community is paused"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a moderator paused this community/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Join the community" }),
    ).not.toBeInTheDocument();
  });
});
