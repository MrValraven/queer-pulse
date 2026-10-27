import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import {
  STUDIO_LANDING_GALLERY_HEADING_ID,
  STUDIO_LANDING_GALLERY_ID,
} from "./studioLanding.data";
import { StudioLandingHero } from "./StudioLandingHero";

const GALLERY_STUB_LABEL = "Gallery";
const STATUS_TEXT = "Free for members. Our team opens access in waves.";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

function renderHero({ isSignedIn = false }: { isSignedIn?: boolean } = {}) {
  if (!isSignedIn) localStorage.setItem(AUTH_STORAGE_KEY, "false");
  return render(
    <TestProviders>
      <StudioLandingHero />
      <section id={STUDIO_LANDING_GALLERY_ID}>
        <h2 id={STUDIO_LANDING_GALLERY_HEADING_ID} tabIndex={-1}>
          {GALLERY_STUB_LABEL}
        </h2>
      </section>
    </TestProviders>,
  );
}

describe("StudioLandingHero", () => {
  it("has the page's one h1", async () => {
    renderHero();
    expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("a signed-out visitor sees the access status", async () => {
    renderHero();
    expect(await screen.findByText(STATUS_TEXT)).toBeInTheDocument();
  });

  it("a signed-in member sees the member note and no status pill", async () => {
    renderHero({ isSignedIn: true });
    expect(
      await screen.findByText(/Our team adds members to Studio in waves/),
    ).toBeInTheDocument();
    expect(screen.queryByText(STATUS_TEXT)).toBeNull();
  });

  it("See inside points at the gallery", async () => {
    renderHero();
    const seeInsideLink = await screen.findByRole("link", {
      name: "See inside",
    });
    expect(seeInsideLink).toHaveAttribute("href", "#studio-look-inside");
  });

  it("See inside focuses the gallery heading", async () => {
    // src/test/setup.ts stubs scrollIntoView on Element.prototype; the spy
    // wraps that stub and vi.restoreAllMocks() puts it back after the test.
    const scrollIntoView = vi
      .spyOn(Element.prototype, "scrollIntoView")
      .mockImplementation(() => undefined);
    renderHero();
    fireEvent.click(await screen.findByRole("link", { name: "See inside" }));
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById(STUDIO_LANDING_GALLERY_HEADING_ID)).toBe(
      document.activeElement,
    );
  });
});
