import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  demoGetStudioPlayback,
  resetDemoPlayback,
} from "./api/studioDemoPlayback";
import { StudioSettingsPage } from "./StudioSettingsPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
const save = vi.hoisted(() => ({ shouldFail: false }));
const showToast = vi.hoisted(() => vi.fn());
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
vi.mock("./api/studioDemoPlayback", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPlayback")>();
  return {
    ...original,
    demoPutStudioPlayback: (
      patch: Parameters<typeof original.demoPutStudioPlayback>[0],
    ) => {
      if (save.shouldFail) throw new Error("refused");
      return original.demoPutStudioPlayback(patch);
    },
  };
});
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderSettings() {
  render(
    <TestProviders initialEntries={["/studio/settings"]}>
      <StudioSettingsPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
  save.shouldFail = false;
  showToast.mockClear();
  resetDemoPlayback();
});

describe("Studio settings (live layout over demo data)", () => {
  it("saves Autoplay next the moment it is switched", async () => {
    renderSettings();
    const autoplay = await screen.findByRole("switch", {
      name: "Autoplay next",
    });
    expect(autoplay).toHaveAttribute("aria-checked", "true");
    fireEvent.click(autoplay);
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Autoplay next" }),
      ).toHaveAttribute("aria-checked", "false"),
    );
    expect(demoGetStudioPlayback().autoplayNext).toBe(false);
  });

  it("rolls a refused save back and shows the error toast once", async () => {
    save.shouldFail = true;
    renderSettings();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Autoplay next" }),
    );
    await waitFor(() => expect(showToast).toHaveBeenCalledTimes(1));
    expect(showToast).toHaveBeenCalledWith(
      "We couldn't save that setting. Try again",
      "error",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Autoplay next" }),
      ).toHaveAttribute("aria-checked", "true"),
    );
    expect(demoGetStudioPlayback().autoplayNext).toBe(true);
  });

  it("hides explicit tracks from the Content section", async () => {
    renderSettings();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Hide explicit tracks" }),
    );
    await waitFor(() =>
      expect(demoGetStudioPlayback().hideExplicit).toBe(true),
    );
  });

  it("reads Off at zero and saves a crossfade length once the slider is let go", async () => {
    renderSettings();
    const slider = await screen.findByRole("slider", {
      name: "Crossfade length",
    });
    expect(slider).toHaveAttribute("aria-valuetext", "Off");
    fireEvent.change(slider, { target: { value: "6" } });
    expect(slider).toHaveAttribute("aria-valuetext", "6 seconds");
    expect(demoGetStudioPlayback().crossfadeSeconds).toBe(0);
    fireEvent.pointerUp(slider);
    await waitFor(() =>
      expect(demoGetStudioPlayback().crossfadeSeconds).toBe(6),
    );
  });

  it("switches the app theme from Dark mode", async () => {
    renderSettings();
    const darkMode = await screen.findByRole("switch", { name: "Dark mode" });
    const before = darkMode.getAttribute("aria-checked");
    fireEvent.click(darkMode);
    expect(
      screen
        .getByRole("switch", { name: "Dark mode" })
        .getAttribute("aria-checked"),
    ).not.toBe(before);
  });

  it("keeps the showcase sections to the demo", async () => {
    renderSettings();
    await screen.findByRole("switch", { name: "Autoplay next" });
    expect(
      screen.queryByText("Default streaming quality"),
    ).not.toBeInTheDocument();
  });
});

describe("Studio settings (demo)", () => {
  it("adds the showcase sections after the real ones", async () => {
    showcase.isOn = true;
    renderSettings();
    expect(
      await screen.findByText("Default streaming quality"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Autoplay next" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("slider", { name: "Crossfade length" }),
    ).toHaveLength(1);
  });
});

describe("Studio settings switches", () => {
  it("renders each switch as a real button", async () => {
    renderSettings();
    const autoplay = await screen.findByRole("switch", {
      name: "Autoplay next",
    });
    expect(autoplay.tagName).toBe("BUTTON");
    expect(autoplay).toHaveAttribute("type", "button");
    expect(autoplay).toHaveAttribute("aria-checked", "true");
  });
});

describe("Studio settings device switches", () => {
  it("offers the two device-only switches, each described", async () => {
    renderSettings();
    for (const name of ["Single-key shortcuts", "Resume where you left off"]) {
      const toggle = await screen.findByRole("switch", { name });
      expect(toggle).toHaveAttribute("aria-describedby");
    }
  });

  it("turns Single-key shortcuts off and on", async () => {
    renderSettings();
    const toggle = await screen.findByRole("switch", {
      name: "Single-key shortcuts",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    fireEvent.click(toggle);
    expect(
      screen.getByRole("switch", { name: "Single-key shortcuts" }),
    ).toHaveAttribute("aria-checked", "false");
  });
});

describe("Studio settings listening history (demo)", () => {
  it("offers the Listening history switch with Clear and a link to Your listening", async () => {
    renderSettings();
    const toggle = await screen.findByRole("switch", {
      name: "Listening history",
    });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getAllByRole("switch", { name: "Listening history" }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("switch", { name: "Recently played" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "See your listening" }),
    ).toHaveAttribute("href", "/studio/listening");
    fireEvent.click(
      screen.getByRole("button", { name: "Clear listening history" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Clear listening history" }),
    ).toBeInTheDocument();
  });

  it("pauses listening history from Settings", async () => {
    renderSettings();
    fireEvent.click(
      await screen.findByRole("switch", { name: "Listening history" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: "Listening history" }),
      ).toHaveAttribute("aria-checked", "false"),
    );
    await waitFor(() =>
      expect(demoGetStudioPlayback().isListeningHistoryOn).toBe(false),
    );
  });
});
