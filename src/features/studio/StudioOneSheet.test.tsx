import { render, screen, waitFor } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { STUDIO_NOT_FOUND_STATE } from "./api/studioLoadState";
import { useStudioPressKit } from "./api/useStudioPressKit";
import { StudioOneSheetPage } from "./StudioOneSheetPage";

// The real hook, wrapped so one test can make it answer a 410.
vi.mock("./api/useStudioPressKit", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useStudioPressKit")>();
  return { ...actual, useStudioPressKit: vi.fn(actual.useStudioPressKit) };
});

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location-search">{location.search}</span>;
}

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioOneSheetPage />
    </TestProviders>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StudioOneSheetPage (demo)", () => {
  it("lays out NIGHTFORM's sheet in light colours with a QR to the persona page", async () => {
    renderAt("/studio/press/print?id=sp-diogo-nightform");
    const sheet = await screen.findByRole("article", {
      name: "NIGHTFORM one-sheet",
    });
    expect(sheet).toHaveAttribute("data-theme", "light");
    expect(sheet.closest("[data-print-root]")).not.toBeNull();
    expect(sheet.closest("[data-studio-one-sheet]")).not.toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: "NIGHTFORM" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /QR code for the NIGHTFORM persona page/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/\/p\/nightform$/)).toBeInTheDocument();
  });

  it("leaves the QR out for a persona with no handle", async () => {
    renderAt("/studio/press/print?id=demo-persona-mariana-sol");
    await screen.findByRole("article", { name: "Mariana Sol one-sheet" });
    expect(screen.queryByRole("img", { name: /QR code/i })).toBeNull();
  });

  it("carries no footer tagline on the sheet", async () => {
    renderAt("/studio/press/print?id=sp-diogo-nightform");
    const sheet = await screen.findByRole("article", {
      name: "NIGHTFORM one-sheet",
    });
    expect(sheet.querySelector("footer")).toBeNull();
    expect(screen.queryByText(/Made with QueerPulse/i)).toBeNull();
  });

  it("prints once ready when asked, titled for the saved file", async () => {
    let titleAtPrint = "";
    const print = vi.spyOn(window, "print").mockImplementation(() => {
      titleAtPrint = document.title;
    });
    renderAt("/studio/press/print?id=sp-diogo-nightform&print=1");
    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    expect(titleAtPrint).toBe("NIGHTFORM one-sheet");
  });

  it("drops the print param once the dialog has opened", async () => {
    vi.spyOn(window, "print").mockImplementation(() => {});
    render(
      <TestProviders
        initialEntries={["/studio/press/print?id=sp-diogo-nightform&print=1"]}
      >
        <StudioOneSheetPage />
        <LocationProbe />
      </TestProviders>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("location-search").textContent).toBe(
        "?id=sp-diogo-nightform",
      ),
    );
  });

  it("reads a withdrawn answer as not found", () => {
    vi.mocked(useStudioPressKit).mockReturnValue({
      pressKit: null,
      loadState: {
        ...STUDIO_NOT_FOUND_STATE,
        isNotFound: false,
        isWithdrawn: true,
      },
    });
    try {
      renderAt("/studio/press/print?id=sp-diogo-nightform");
      expect(
        screen.getByRole("heading", { name: "We can't find that in Studio" }),
      ).toBeInTheDocument();
    } finally {
      vi.mocked(useStudioPressKit).mockRestore();
    }
  });

  it("leaves the print dialog closed without ?print=1", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    renderAt("/studio/press/print?id=sp-diogo-nightform");
    await screen.findByRole("article", { name: "NIGHTFORM one-sheet" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(print).not.toHaveBeenCalled();
  });
});
