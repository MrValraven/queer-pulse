import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { STUDIO_LANDING_HERO_SHOTS } from "./studioLanding.data";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";

function shotImages(container: HTMLElement): HTMLImageElement[] {
  return [...container.querySelectorAll("img")];
}

describe("StudioLandingScreenshot", () => {
  it("renders the dark capture alone, eager with isPriority", async () => {
    const { container } = render(
      <TestProviders>
        <StudioLandingScreenshot
          shot={STUDIO_LANDING_HERO_SHOTS.laptop}
          isPriority
        />
      </TestProviders>,
    );
    await waitFor(() => expect(shotImages(container)).toHaveLength(1));
    const [image] = shotImages(container);

    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(image).toHaveAttribute("width", "1600");
    expect(image).toHaveAttribute("height", "1000");
    expect(image).toHaveAttribute("decoding", "async");
    expect(image?.getAttribute("src")).toMatch(/home-desktop-dark\.webp$/);
  });

  it("loads lazily without isPriority", async () => {
    const { container } = render(
      <TestProviders>
        <StudioLandingScreenshot shot={STUDIO_LANDING_HERO_SHOTS.phone} />
      </TestProviders>,
    );
    await waitFor(() => expect(shotImages(container)).toHaveLength(1));
    const [image] = shotImages(container);

    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).not.toHaveAttribute("fetchpriority");
    expect(image?.getAttribute("src")).toMatch(/player-phone-dark\.webp$/);
  });
});
