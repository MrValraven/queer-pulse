import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioPressKitOwnerDTO } from "./api/studio.types";
import {
  demoSaveStudioPressKit,
  demoStudioPressKit,
} from "./api/studioDemoPress";
import { studioRefusal } from "./api/studioDemoMutations";
import { STUDIO_NOT_FOUND_STATE } from "./api/studioLoadState";
import { useStudioPressKit } from "./api/useStudioPressKit";
import { StudioPressEditPage } from "./StudioPressEditPage";

// The real hook, wrapped so one test can make it answer a 410.
vi.mock("./api/useStudioPressKit", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./api/useStudioPressKit")>();
  return { ...actual, useStudioPressKit: vi.fn(actual.useStudioPressKit) };
});

// The real demo save, wrapped so one test can make it refuse a pick.
vi.mock("./api/studioDemoPress", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/studioDemoPress")>();
  return {
    ...actual,
    demoSaveStudioPressKit: vi.fn(actual.demoSaveStudioPressKit),
  };
});

const MARIANA_ID = "demo-persona-mariana-sol";
let seedOwner: StudioPressKitOwnerDTO | null = null;

beforeAll(() => {
  seedOwner = demoStudioPressKit(MARIANA_ID).owner;
});

// The demo store lives in the module: put Mariana's seed back after each
// test, so a save in one test never shows in the next.
afterEach(() => {
  if (!seedOwner) return;
  demoSaveStudioPressKit(MARIANA_ID, {
    pitch: seedOwner.pitch,
    pressBio: seedOwner.pressBio,
    featuredTrackIds: seedOwner.featuredTrackIds,
    quotes: seedOwner.quotes,
    contact: seedOwner.contact,
  });
});

/** The live "Remove quote 1": a row folding away is inert while it goes. */
const liveRemoveFirstQuote = () =>
  screen
    .getAllByRole("button", { name: "Remove quote 1" })
    .find((button) => !button.closest("[inert]"));

function renderEditor() {
  render(
    <TestProviders
      initialEntries={[`/studio/press/edit?persona=${MARIANA_ID}`]}
    >
      <StudioPressEditPage />
    </TestProviders>,
  );
}

describe("StudioPressEditPage (demo)", () => {
  it("opens with Mariana's saved fields", async () => {
    renderEditor();
    expect(await screen.findByLabelText("Pitch")).toHaveValue(
      "Fado letters set to a patient piano, from Beja to Sintra",
    );
    expect(screen.getByLabelText("Contact")).toHaveValue(
      "mailto:press@marianasol.pt",
    );
    expect(
      screen.getByRole("link", { name: "View press kit" }),
    ).toHaveAttribute("href", "/studio/press?id=demo-persona-mariana-sol");
  });

  it("titles the page h1 and the form h2", async () => {
    renderEditor();
    await screen.findByLabelText("Pitch");
    const textsAt = (level: number) =>
      screen
        .getAllByRole("heading", { level })
        .map((heading) => heading.textContent);
    expect(textsAt(1)).toContain("Your press kit");
    expect(textsAt(2)).toContain("Press kit for Mariana Sol");
  });

  it("refuses a contact that is not https or mailto and saves nothing", async () => {
    renderEditor();
    const contact = await screen.findByLabelText("Contact");
    fireEvent.change(contact, { target: { value: "http://marianasol.pt" } });
    fireEvent.click(screen.getByRole("button", { name: "Save press kit" }));
    expect(
      await screen.findByText(
        "Use a link starting with https:// or an address starting with mailto:",
      ),
    ).toBeInTheDocument();
    expect(contact).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Press kit saved")).toBeNull();
  });

  it("moves focus to the refused field on every blocked Save", async () => {
    renderEditor();
    const contact = await screen.findByLabelText("Contact");
    fireEvent.change(contact, { target: { value: "mailto:press" } });
    const saveButton = screen.getByRole("button", { name: "Save press kit" });
    saveButton.focus();
    fireEvent.click(saveButton);
    await waitFor(() => expect(document.activeElement).toBe(contact));
    saveButton.focus();
    expect(document.activeElement).toBe(saveButton);
    fireEvent.click(saveButton);
    await waitFor(() => expect(document.activeElement).toBe(contact));
  });

  it("saves a new pitch", async () => {
    renderEditor();
    fireEvent.change(await screen.findByLabelText("Pitch"), {
      target: { value: "Letters set to piano" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save press kit" }));
    await waitFor(() =>
      expect(screen.getByText("Press kit saved")).toBeInTheDocument(),
    );
  });

  it("caps quotes at three", async () => {
    renderEditor();
    const add = await screen.findByRole("button", { name: "Add quote" });
    fireEvent.click(add);
    expect(add).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByLabelText("Quote")).toHaveLength(3);
  });

  it("moves focus to the next quote after Remove, then to Add quote", async () => {
    renderEditor();
    await screen.findByRole("button", { name: "Add quote" });
    fireEvent.click(liveRemoveFirstQuote() as HTMLElement);
    await waitFor(() =>
      expect(document.activeElement).toHaveValue(
        "A record that trusts silence as much as the voice",
      ),
    );
    fireEvent.click(liveRemoveFirstQuote() as HTMLElement);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Add quote" }),
      ),
    );
  });

  it("moves focus to the next best track after Remove", async () => {
    renderEditor();
    const removeButtons = await screen.findAllByRole("button", {
      name: /from best tracks$/,
    });
    expect(removeButtons).toHaveLength(3);
    fireEvent.click(removeButtons[0] as HTMLElement);
    await waitFor(() => expect(document.activeElement).toBe(removeButtons[1]));
  });

  it("keeps focus on the add control, then moves it to the fifth track's Remove", async () => {
    const user = userEvent.setup();
    renderEditor();
    await screen.findAllByRole("button", { name: /from best tracks$/ });
    const trigger = screen.getByRole("button", { name: "Add a track" });
    await user.click(trigger);
    await user.click(screen.getAllByRole("option")[0] as HTMLElement);
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: /from best tracks$/ }),
      ).toHaveLength(4),
    );
    expect(document.activeElement).toBe(trigger);
    await user.click(trigger);
    await user.click(screen.getAllByRole("option")[0] as HTMLElement);
    await waitFor(() => {
      const removeButtons = screen.getAllByRole("button", {
        name: /from best tracks$/,
      });
      expect(removeButtons).toHaveLength(5);
      expect(document.activeElement).toBe(removeButtons[4]);
    });
    expect(trigger).toBeDisabled();
  });

  it("reads a withdrawn answer as not found", async () => {
    vi.mocked(useStudioPressKit).mockReturnValue({
      pressKit: null,
      loadState: {
        ...STUDIO_NOT_FOUND_STATE,
        isNotFound: false,
        isWithdrawn: true,
      },
    });
    try {
      renderEditor();
      expect(
        await screen.findByRole("heading", {
          name: "We can't find that in Studio",
        }),
      ).toBeInTheDocument();
    } finally {
      vi.mocked(useStudioPressKit).mockRestore();
    }
  });

  it("shows its own line when the server refuses a best track", async () => {
    vi.mocked(demoSaveStudioPressKit).mockImplementationOnce(() => {
      throw studioRefusal(422, "studio_press_track_not_allowed");
    });
    renderEditor();
    await screen.findByLabelText("Pitch");
    fireEvent.click(screen.getByRole("button", { name: "Save press kit" }));
    expect(
      await screen.findByText(
        "One of those tracks isn't on this persona's releases",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Press kit saved")).toBeNull();
  });

  it("names the saved best tracks and shows a quote's missing source", async () => {
    renderEditor();
    expect(
      await screen.findAllByRole("button", { name: /from best tracks$/ }),
    ).toHaveLength(3);
    expect(screen.queryByText(/No longer available/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add quote" }));
    fireEvent.change(screen.getAllByLabelText("Quote")[2] as HTMLElement, {
      target: { value: "Patient and bright" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save press kit" }));
    expect(
      await screen.findByText("Say where the quote is from"),
    ).toBeInTheDocument();
  });
});
