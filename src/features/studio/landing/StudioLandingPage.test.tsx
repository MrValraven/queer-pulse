import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import { StudioLandingPage } from "./StudioLandingPage";

/**
 * The assembled landing. The site header and footer live in the app chrome
 * above the route, so every query here reads the page's own `<main>`.
 */

afterEach(() => {
  localStorage.clear();
});

function renderPage() {
  return render(
    <TestProviders>
      <StudioLandingPage />
    </TestProviders>,
  );
}

describe("StudioLandingPage", () => {
  it("signed out: one h1, two invite links, a six-tab gallery", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderPage();
    const main = screen.getByRole("main");

    expect(
      await within(main).findAllByRole("heading", { level: 1 }),
    ).toHaveLength(1);

    const inviteLinks = await within(main).findAllByRole("link", {
      name: "Request an invite",
    });
    expect(inviteLinks).toHaveLength(2);
    for (const inviteLink of inviteLinks) {
      expect(inviteLink).toHaveAttribute("href", "/auth/request-invite");
    }

    const tablist = await within(main).findByRole("tablist", {
      name: "Studio screens",
    });
    expect(within(tablist).getAllByRole("tab")).toHaveLength(6);
  });

  it("signed-in member without a grant: no invite button, two member notes", async () => {
    renderPage();
    const main = screen.getByRole("main");

    expect(
      await within(main).findAllByText(
        /Our team adds members to Studio in waves/,
      ),
    ).toHaveLength(2);
    expect(
      within(main).queryAllByRole("link", { name: "Request an invite" }),
    ).toHaveLength(0);
  });

  it("sets noindex and the share image", async () => {
    renderPage();
    await waitFor(() => {
      expect(
        document.head.querySelector(
          'meta[name="robots"][content="noindex, nofollow"]',
        ),
      ).not.toBeNull();
    });
    const shareImage = document.head.querySelector('meta[property="og:image"]');
    expect(shareImage?.getAttribute("content")).toMatch(
      /\/studio-landing\/og-studio\.jpg$/,
    );
  });
});
