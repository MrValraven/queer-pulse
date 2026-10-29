import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import {
  STUDIO_LANDING_ARTISTS_ID,
  STUDIO_LANDING_LISTEN_ID,
} from "./studioLanding.data";
import { StudioLandingPage } from "./StudioLandingPage";

/**
 * The assembled landing. The site header and footer live in the app chrome
 * above the route, so every query here reads the page's own `<main>`.
 */

afterEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

function renderPage() {
  return render(
    <TestProviders>
      <StudioLandingPage />
    </TestProviders>,
  );
}

/** True when `first` comes before `second` in document order. */
function isBefore(first: Element, second: Element): boolean {
  return Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

async function findSection(sectionId: string): Promise<HTMLElement> {
  return waitFor(() => {
    const section = document.getElementById(sectionId);
    expect(section, sectionId).not.toBeNull();
    return section as HTMLElement;
  });
}

describe("StudioLandingPage", () => {
  it("signed out: one h1 and two invite links tagged studio_landing", async () => {
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
      expect(inviteLink).toHaveAttribute(
        "href",
        "/auth/request-invite?from=studio_landing",
      );
    }
  });

  it("signed out: I make music swaps the CTA and brings For artists up", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    renderPage();
    const main = screen.getByRole("main");

    const audienceSwitch = await within(main).findByRole("group", {
      name: "What brings you to Studio",
    });
    const listenerButton = within(audienceSwitch).getByRole("button", {
      name: "I listen",
    });
    const artistButton = within(audienceSwitch).getByRole("button", {
      name: "I make music",
    });
    expect(listenerButton).toHaveAttribute("aria-pressed", "true");
    expect(artistButton).toHaveAttribute("aria-pressed", "false");

    const listenSection = await findSection(STUDIO_LANDING_LISTEN_ID);
    expect(
      isBefore(listenSection, await findSection(STUDIO_LANDING_ARTISTS_ID)),
    ).toBe(true);

    fireEvent.click(artistButton);

    expect(artistButton).toHaveAttribute("aria-pressed", "true");
    const artistLinks = await within(main).findAllByRole("link", {
      name: "Apply as an artist",
    });
    expect(artistLinks.length).toBeGreaterThan(0);
    for (const artistLink of artistLinks) {
      expect(artistLink).toHaveAttribute(
        "href",
        "/auth/request-invite?from=studio_artist",
      );
    }
    const heroSection = within(main)
      .getByRole("heading", { level: 1 })
      .closest("section");
    expect(heroSection).not.toBeNull();
    expect(
      within(heroSection as HTMLElement).getByRole("link", {
        name: "Apply as an artist",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      const forArtistsSection = document.getElementById(
        STUDIO_LANDING_ARTISTS_ID,
      );
      const movedListenSection = document.getElementById(
        STUDIO_LANDING_LISTEN_ID,
      );
      expect(forArtistsSection && movedListenSection).toBeTruthy();
      expect(
        isBefore(forArtistsSection as Element, movedListenSection as Element),
      ).toBe(true);
    });
    expect(window.location.hash).toBe("#artists");
  });

  it("is indexed and keeps the share image", async () => {
    renderPage();
    await waitFor(() => {
      const shareImage = document.head.querySelector(
        'meta[property="og:image"]',
      );
      expect(shareImage?.getAttribute("content")).toMatch(
        /\/studio-landing\/og-studio\.jpg$/,
      );
    });
    expect(
      document.head.querySelector('meta[name="robots"][content*="noindex"]'),
    ).toBeNull();
  });

  it("member without access: Request Studio access in each CTA and no invite link", async () => {
    renderPage();
    const main = screen.getByRole("main");

    // The hero, the For artists section and the closing each carry the CTA.
    expect(
      await within(main).findAllByRole("button", {
        name: "Request Studio access",
      }),
    ).toHaveLength(3);
    expect(
      within(main).queryAllByRole("link", { name: "Request an invite" }),
    ).toHaveLength(0);
    expect(
      within(main).queryAllByRole("link", { name: "Apply as an artist" }),
    ).toHaveLength(0);
  });
});
