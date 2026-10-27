import { readFileSync } from "node:fs";
import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  useTheme,
  type ThemeContextValue,
} from "../../../app/providers/themeContext";
import { TestProviders } from "../../../test/TestProviders";
import { STUDIO_LANDING_HERO_SHOTS } from "./studioLanding.data";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";

function themeImages(container: HTMLElement) {
  const darkImage = container.querySelector('img[data-shot-theme="dark"]');
  const lightImage = container.querySelector('img[data-shot-theme="light"]');
  if (!darkImage || !lightImage) throw new Error("both variants must render");
  return { darkImage, lightImage };
}

const screenshotCss = readFileSync(
  "src/features/studio/landing/StudioLandingScreenshot.module.css",
  "utf8",
);

/** Hands the test the theme controls from inside the providers. */
function ThemeHandle({
  onTheme,
}: {
  onTheme: (themeValue: ThemeContextValue) => void;
}) {
  onTheme(useTheme());
  return null;
}

describe("StudioLandingScreenshot", () => {
  afterEach(() => {
    window.localStorage.removeItem("qp-theme");
  });

  it("loads only the active theme eagerly", async () => {
    window.localStorage.setItem("qp-theme", "dark");
    const { container } = render(
      <TestProviders>
        <StudioLandingScreenshot
          shot={STUDIO_LANDING_HERO_SHOTS.laptop}
          isPriority
        />
      </TestProviders>,
    );
    await waitFor(() => themeImages(container));
    const { darkImage, lightImage } = themeImages(container);

    expect(darkImage).toHaveAttribute("loading", "eager");
    expect(darkImage).toHaveAttribute("fetchpriority", "high");
    expect(lightImage).toHaveAttribute("loading", "lazy");
    for (const image of [darkImage, lightImage]) {
      expect(image).toHaveAttribute("width", "1600");
      expect(image).toHaveAttribute("height", "1000");
      expect(image).toHaveAttribute("decoding", "async");
    }
    expect(darkImage.getAttribute("src")).toMatch(/home-desktop-dark\.webp$/);
    expect(lightImage.getAttribute("src")).toMatch(/home-desktop-light\.webp$/);
  });

  it("loads both variants lazily without isPriority", async () => {
    const { container } = render(
      <TestProviders>
        <StudioLandingScreenshot shot={STUDIO_LANDING_HERO_SHOTS.laptop} />
      </TestProviders>,
    );
    await waitFor(() => themeImages(container));
    const { darkImage, lightImage } = themeImages(container);

    expect(darkImage).toHaveAttribute("loading", "lazy");
    expect(lightImage).toHaveAttribute("loading", "lazy");
    expect(darkImage).not.toHaveAttribute("fetchpriority");
    expect(lightImage).not.toHaveAttribute("fetchpriority");
  });

  it("fades the incoming variant only after a theme flip", async () => {
    let themeControls: ThemeContextValue | undefined;
    const { container } = render(
      <TestProviders>
        <ThemeHandle
          onTheme={(themeValue) => {
            themeControls = themeValue;
          }}
        />
        <StudioLandingScreenshot shot={STUDIO_LANDING_HERO_SHOTS.phone} />
      </TestProviders>,
    );
    await waitFor(() => themeImages(container));
    const shotRoot = themeImages(container).darkImage.parentElement;
    expect(shotRoot).not.toHaveAttribute("data-theme-fade");

    act(() => themeControls?.toggleTheme());
    expect(shotRoot).toHaveAttribute("data-theme-fade", "true");
  });

  it("scopes the starting style to theme flips", () => {
    const startingStyle =
      /@starting-style\s*\{([\s\S]*?)\n\}/.exec(screenshotCss)?.[1] ?? "";
    expect(startingStyle).toMatch(/\.themeFade \.image\s*\{\s*opacity:\s*0/);
    expect(startingStyle).not.toMatch(/^\s*\.image\s*\{/m);
  });
});
