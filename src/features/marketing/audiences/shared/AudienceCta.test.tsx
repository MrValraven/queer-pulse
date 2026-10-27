import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import { AudienceCta } from "./AudienceCta";

interface AuthOverrideState {
  isChecking: boolean;
}

const authOverride = vi.hoisted((): AuthOverrideState => ({
  isChecking: false,
}));

vi.mock("../../../../app/providers/authContext", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../app/providers/authContext")
    >();
  return {
    ...actual,
    useAuth: () => {
      const value = actual.useAuth();
      return authOverride.isChecking
        ? { ...value, loggedIn: false, checking: true }
        : value;
    },
  };
});

const MEMBER_ACTIONS = [
  { actionId: "start", label: "Start a community", to: "/communities/start" },
];

function renderCta(placement: "hero" | "closing") {
  return render(
    <TestProviders>
      <AudienceCta
        audience="communities"
        placement={placement}
        memberActions={MEMBER_ACTIONS}
      />
    </TestProviders>,
  );
}

afterEach(() => {
  localStorage.clear();
  authOverride.isChecking = false;
});

describe("AudienceCta", () => {
  it("a guest gets the invite link with the page source", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderCta("hero");
    const inviteLink = await screen.findByRole("link", {
      name: "Request an invite",
    });
    expect(inviteLink).toHaveAttribute(
      "href",
      "/auth/request-invite?from=for_communities",
    );
    expect(
      screen.getByRole("link", { name: "See how it works" }),
    ).toHaveAttribute("href", "#how-it-works");
  });

  it("a member gets the direct action and no invite", async () => {
    renderCta("hero");
    const memberLink = await screen.findByRole("link", {
      name: "Start a community",
    });
    expect(memberLink).toHaveAttribute("href", "/communities/start");
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });

  it("while the session is checking, neither shows", async () => {
    authOverride.isChecking = true;
    renderCta("hero");
    expect(
      await screen.findByRole("link", { name: "See how it works" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Start a community" }),
    ).toBeNull();
  });
});
