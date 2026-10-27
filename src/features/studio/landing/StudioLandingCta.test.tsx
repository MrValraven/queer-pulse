import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import { StudioLandingCta } from "./StudioLandingCta";

afterEach(() => {
  localStorage.clear();
});

describe("StudioLandingCta", () => {
  it("signed out shows the invite link", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders>
        <StudioLandingCta placement="hero" />
      </TestProviders>,
    );
    const inviteLink = await screen.findByRole("link", {
      name: "Request an invite",
    });
    expect(inviteLink).toHaveAttribute("href", "/auth/request-invite");
  });

  it("a signed-in member sees the note and no invite", async () => {
    render(
      <TestProviders>
        <StudioLandingCta placement="closing" />
      </TestProviders>,
    );
    expect(
      await screen.findByText(/Our team adds members to Studio in waves/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Request an invite" }),
    ).toBeNull();
  });
});
