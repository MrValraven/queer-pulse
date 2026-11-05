import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import {
  useForcedTheme,
  useReleaseStudioBootTheme,
  useTheme,
  type ThemeContextValue,
} from "./themeContext";

const STORAGE_KEY = "qp-theme";

function reset() {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.replaceState({}, "", "/");
}

beforeEach(reset);
afterEach(reset);

/** Shows the reported theme and hands the test the theme controls. */
function ThemeProbe({
  onTheme,
}: {
  onTheme?: (themeValue: ThemeContextValue) => void;
}) {
  const themeValue = useTheme();
  onTheme?.(themeValue);
  return <span data-testid="theme">{themeValue.theme}</span>;
}

function DarkSurface() {
  useForcedTheme("dark");
  return null;
}

function BootRelease({ pathname }: { pathname: string }) {
  useReleaseStudioBootTheme(pathname);
  return null;
}

function reportedTheme(): string | null {
  return screen.getByTestId("theme").textContent;
}

describe("ThemeProvider forced theme", () => {
  it("shows dark while a surface holds it and keeps the stored choice", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    const { rerender } = render(
      <ThemeProvider>
        <ThemeProbe />
        <DarkSurface />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");

    rerender(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("counts holds, so one surface leaving keeps the other's dark", () => {
    const { rerender } = render(
      <ThemeProvider>
        <ThemeProbe />
        <DarkSurface key="listener" />
        <DarkSurface key="creator" />
      </ThemeProvider>,
    );
    rerender(
      <ThemeProvider>
        <ThemeProbe />
        <DarkSurface key="creator" />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("stores a choice made while forced and shows it after the hold ends", () => {
    let themeControls: ThemeContextValue | undefined;
    const { rerender } = render(
      <ThemeProvider>
        <ThemeProbe
          onTheme={(themeValue) => {
            themeControls = themeValue;
          }}
        />
        <DarkSurface />
      </ThemeProvider>,
    );
    act(() => themeControls?.setTheme("dark"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");

    rerender(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("dark");
  });

  it("starts dark on a first load onto a Studio URL", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    window.history.replaceState({}, "", "/studio/about");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
  });

  it("gives the choice back when the route leaves Studio before a hold", () => {
    localStorage.setItem(STORAGE_KEY, "light");
    window.history.replaceState({}, "", "/studio/library");
    const { rerender } = render(
      <ThemeProvider>
        <ThemeProbe />
        <BootRelease pathname="/studio/library" />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("dark");

    rerender(
      <ThemeProvider>
        <ThemeProbe />
        <BootRelease pathname="/sign-in" />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("light");
  });

  it("starts with the stored choice outside Studio", () => {
    window.history.replaceState({}, "", "/studios-and-spaces");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(reportedTheme()).toBe("light");
  });
});
