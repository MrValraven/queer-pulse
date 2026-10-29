import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AccountPane } from "./SettingsPanes";
import { GOOGLE_TWO_STEP_VERIFICATION_URL } from "./settings.data";

const mocks: {
  hasPurchases: boolean;
  requested: { status: string; silentError: boolean | undefined }[];
} = vi.hoisted(() => ({ hasPurchases: true, requested: [] }));

// The real list of every status (demo purchases), or an empty one for a
// holder; each read records the status and silentError it asked for.
vi.mock("../studio/api/useStudioPurchaseLists", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../studio/api/useStudioPurchaseLists")
    >();
  return {
    ...original,
    useStudioMyPurchases: (
      status: "all" | "confirmed",
      options?: { silentError?: boolean },
    ) => {
      mocks.requested.push({ status, silentError: options?.silentError });
      const result = original.useStudioMyPurchases(status, options);
      return mocks.hasPurchases ? result : { ...result, items: [] };
    },
  };
});

beforeEach(() => {
  mocks.hasPurchases = true;
  mocks.requested = [];
});

describe("AccountPane", () => {
  it("shows the logged-in email, not the old hardcoded mock", () => {
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    expect(screen.getByText("you@queerpulse.test")).toBeInTheDocument();
    expect(
      screen.queryByText("sofia.andrade@email.com"),
    ).not.toBeInTheDocument();
  });

  // PRD-12: the pane used to offer a "two-factor authentication, coming soon"
  // toggle on a platform that is Google OAuth only and has no second factor of
  // its own to build. It points at the real one instead.
  it("sends the member to their Google account for a second factor", async () => {
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    const link = await screen.findByRole("link", {
      name: "Set it up at Google",
    });
    expect(link).toHaveAttribute("href", GOOGLE_TWO_STEP_VERIFICATION_URL);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("links to the music purchases once the member has a purchase of any status", async () => {
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    expect(await screen.findByText("Your music purchases")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open your music purchases" }),
    ).toHaveAttribute("href", "/account/music-purchases");
    // Every status, so a member with only a declined or expired purchase
    // reaches its reason; the card read stays silent on failure.
    expect(mocks.requested.length).toBeGreaterThan(0);
    expect(
      mocks.requested.every(
        (read) => read.status === "all" && read.silentError === true,
      ),
    ).toBe(true);
  });

  it("leaves the music purchases card out for a member with none", async () => {
    mocks.hasPurchases = false;
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    await screen.findByRole("link", { name: "Set it up at Google" });
    expect(screen.queryByText("Your music purchases")).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Open your music purchases" }),
    ).toBeNull();
  });
});
