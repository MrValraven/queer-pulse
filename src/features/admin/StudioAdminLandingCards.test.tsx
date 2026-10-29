import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import type { AdminStudioLandingDTO } from "./api/studioLandingAdmin.api";
import { useAdminStudioLanding } from "./api/useStudioAdminLanding";
import {
  demoAdminStudioLanding,
  demoCreateCard,
  demoPutPhoto,
  demoRemoveCard,
  demoRemovePhoto,
  demoUpdateCard,
  resetDemoAdminStudioLanding,
} from "./StudioAdminLanding.data";
import { StudioAdminLandingCards } from "./StudioAdminLandingCards";
import { StudioAdminLandingPhotos } from "./StudioAdminLandingPhotos";
import { StudioAdminPersonaSearch } from "./StudioAdminPersonaSearch";

const mocks: {
  putError: ApiError | null;
  puts: Record<string, unknown>[];
} = vi.hoisted(() => ({ putError: null, puts: [] }));

vi.mock("./StudioAdminLanding.data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./StudioAdminLanding.data")>();
  return {
    ...original,
    demoCreateCard: vi.fn(original.demoCreateCard),
    demoUpdateCard: vi.fn(original.demoUpdateCard),
    demoPutPhoto: vi.fn(original.demoPutPhoto),
  };
});
vi.mock("./api/useStudioAdminLandingMutations", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("./api/useStudioAdminLandingMutations")
    >();
  return {
    ...original,
    // A refused photo save is replayed from the holder; every other test
    // runs the real demo mutation.
    usePutLandingPhoto: () =>
      mocks.putError
        ? {
            isPending: false,
            mutate: (
              variables: Record<string, unknown>,
              options?: { onError?: (error: Error) => void },
            ) => {
              mocks.puts.push(variables);
              if (mocks.putError) options?.onError?.(mocks.putError);
            },
          }
        : original.usePutLandingPhoto(),
  };
});

function Console() {
  const { data } = useAdminStudioLanding();
  return data ? (
    <>
      <StudioAdminLandingCards landing={data} />
      <StudioAdminLandingPhotos landing={data} />
    </>
  ) : null;
}

function renderConsole() {
  render(
    <TestProviders initialEntries={["/admin/studio"]}>
      <Console />
    </TestProviders>,
  );
}

// The demo page holds all 6 cards; one is taken off so another can be added.
function freeACardSlot() {
  demoRemoveCard("demo-landing-card-demo-persona-rita-ferreira");
}

const consentLine = (dialog: HTMLElement, name: RegExp) =>
  within(dialog).getByRole("button", { name });

const saveCardButton = (dialog: HTMLElement) =>
  within(dialog).getByRole("button", { name: "Save card" });

beforeEach(() => {
  resetDemoAdminStudioLanding();
  mocks.putError = null;
  mocks.puts = [];
  vi.mocked(demoCreateCard).mockClear();
  vi.mocked(demoUpdateCard).mockClear();
  vi.mocked(demoPutPhoto).mockClear();
});

describe("Studio page console: artist cards", () => {
  it("keeps Save card disabled until an artist is picked and consent is ticked", async () => {
    freeACardSlot();
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Add an artist card" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add an artist card",
    });
    expect(saveCardButton(dialog)).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(consentLine(dialog, /agreed to appear/));
    expect(saveCardButton(dialog)).toHaveAttribute("aria-disabled", "true");
    fireEvent.change(within(dialog).getByRole("searchbox"), {
      target: { value: "Mariana" },
    });
    fireEvent.click(
      await within(dialog).findByRole("button", { name: "Pick Mariana Sol" }),
    );
    expect(saveCardButton(dialog)).not.toHaveAttribute("aria-disabled");
  });

  it("counts the characters left in the quote and blocks past 240", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Edit the card of Vanda Diesel",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit the card of Vanda Diesel",
    });
    fireEvent.click(consentLine(dialog, /agreed to appear/));
    const quote = within(dialog).getByRole("textbox", { name: /Quote/ });
    fireEvent.change(quote, { target: { value: "a".repeat(240) } });
    expect(within(dialog).getByText("Characters left: 0")).toBeInTheDocument();
    expect(saveCardButton(dialog)).not.toHaveAttribute("aria-disabled");
    fireEvent.change(quote, { target: { value: "a".repeat(241) } });
    expect(within(dialog).getByText("Characters left: -1")).toBeInTheDocument();
    expect(saveCardButton(dialog)).toHaveAttribute("aria-disabled", "true");
  });

  it("creates a card with a blank quote as null and consent true", async () => {
    freeACardSlot();
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Add an artist card" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Add an artist card",
    });
    fireEvent.change(within(dialog).getByRole("searchbox"), {
      target: { value: "Mariana" },
    });
    fireEvent.click(
      await within(dialog).findByRole("button", { name: "Pick Mariana Sol" }),
    );
    fireEvent.click(consentLine(dialog, /agreed to appear/));
    fireEvent.click(saveCardButton(dialog));
    expect(
      await screen.findByRole("button", {
        name: "Edit the card of Mariana Sol",
      }),
    ).toBeInTheDocument();
    expect(demoCreateCard).toHaveBeenCalledWith({
      subprofileId: "demo-persona-mariana-sol",
      quote: null,
      hasConsent: true,
    });
  });

  it("asks for consent again when editing and sends the quote with it", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Edit the card of Vanda Diesel",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit the card of Vanda Diesel",
    });
    const consent = consentLine(dialog, /agreed to appear/);
    expect(consent).toHaveAttribute("aria-pressed", "false");
    expect(saveCardButton(dialog)).toHaveAttribute("aria-disabled", "true");
    fireEvent.change(within(dialog).getByRole("textbox", { name: /Quote/ }), {
      target: { value: "  new words  " },
    });
    fireEvent.click(consent);
    fireEvent.click(saveCardButton(dialog));
    expect(await screen.findByText("new words")).toBeInTheDocument();
    expect(demoUpdateCard).toHaveBeenCalledWith(
      "demo-landing-card-sp-ines-fonseca-vanda-diesel",
      { quote: "new words", hasConsent: true },
    );
  });

  it("shows Not shown on a card whose persona fails eligibility", () => {
    const landing: AdminStudioLandingDTO = demoAdminStudioLanding();
    const hidden: AdminStudioLandingDTO = {
      ...landing,
      artistCards: landing.artistCards.map((card, index) => ({
        ...card,
        isShown: index !== 0,
      })),
    };
    render(
      <TestProviders initialEntries={["/admin/studio"]}>
        <StudioAdminLandingCards landing={hidden} />
      </TestProviders>,
    );
    expect(screen.getAllByText(/^Not shown/)).toHaveLength(1);
  });

  it("moves a card up and confirms before removing one", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Move up: Vanda Diesel" }),
    );
    expect(
      await screen.findByText("Vanda Diesel is now number 1"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Remove the card of Vanda Diesel" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Remove the card of Vanda Diesel?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Remove card" }),
    );
    expect(
      await screen.findByText("The card of Vanda Diesel is removed"),
    ).toBeInTheDocument();
  });
});

describe("Studio page console: persona search", () => {
  it("marks Has a card and Can't appear options unpickable", async () => {
    const onPick = vi.fn();
    render(
      <TestProviders initialEntries={["/admin/studio"]}>
        <StudioAdminPersonaSearch
          onPick={onPick}
          isPickable={(option) => option.isEligible && !option.hasCard}
        />
      </TestProviders>,
    );
    const search = screen.getByRole("searchbox", { name: "Find an artist" });
    fireEvent.change(search, { target: { value: "Vanda" } });
    const hasCard = await screen.findByRole("button", {
      name: "Pick Vanda Diesel",
    });
    expect(hasCard).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Has a card")).toBeInTheDocument();
    fireEvent.click(hasCard);
    fireEvent.change(search, { target: { value: "Rita" } });
    const blocked = await screen.findByRole("button", {
      name: "Pick Rita Ferreira",
    });
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Can't appear")).toBeInTheDocument();
    fireEvent.click(blocked);
    expect(onPick).not.toHaveBeenCalled();
    fireEvent.change(search, { target: { value: "Mariana" } });
    fireEvent.click(
      await screen.findByRole("button", { name: "Pick Mariana Sol" }),
    );
    expect(onPick).toHaveBeenCalledTimes(1);
  });
});

describe("Studio page console: photos", () => {
  it("shows both held photos with Replace photo and Remove photo", async () => {
    renderConsole();
    for (const altText of [
      "A performer sings into a microphone under warm stage lights while the audience sings along",
      "A choir rehearses together, singers standing close and reading from the same pages",
    ]) {
      const tile = (await screen.findByAltText(altText)).closest("li");
      if (!tile) throw new Error("no photo tile");
      expect(
        within(tile).getByRole("button", { name: /Replace photo/ }),
      ).toBeInTheDocument();
      expect(
        within(tile).getByRole("button", { name: /Remove photo/ }),
      ).toBeInTheDocument();
    }
  });

  it("shows an empty slot with No photo and Add photo", async () => {
    demoRemovePhoto("manifesto");
    renderConsole();
    const manifestoTile = (
      await screen.findByRole("button", { name: /Add photo/ })
    ).closest("li");
    if (!manifestoTile) throw new Error("no manifesto tile");
    expect(within(manifestoTile).getByText("No photo")).toBeInTheDocument();
  });

  it("needs an image, both descriptions and the consent tick", async () => {
    demoRemovePhoto("manifesto");
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Add photo Manifesto photo",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Manifesto photo",
    });
    const save = within(dialog).getByRole("button", { name: "Save photo" });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "Description in English" }),
      { target: { value: "Dancers at an event" } },
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", {
        name: "Description in Portuguese",
      }),
      { target: { value: "Pessoas a dançar num evento" } },
    );
    fireEvent.click(within(dialog).getByRole("button", { name: /Everyone/ }));
    // Descriptions and consent are in, the image is not.
    expect(save).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(save);
    expect(demoPutPhoto).not.toHaveBeenCalled();
  });

  it("needs the consent tick even with an image and both descriptions", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Replace photo Hero photo" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Hero photo" });
    const save = within(dialog).getByRole("button", { name: "Save photo" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(save);
    expect(demoPutPhoto).not.toHaveBeenCalled();
  });

  it("counts the characters left in the descriptions and the credit", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Replace photo Hero photo" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Hero photo" });
    const english = within(dialog).getByRole("textbox", {
      name: "Description in English",
    });
    const credit = within(dialog).getByRole("textbox", {
      name: "Credit (optional)",
    });
    expect(english).toHaveAttribute("maxlength", "200");
    expect(credit).toHaveAttribute("maxlength", "120");
    fireEvent.change(english, { target: { value: "a".repeat(200) } });
    fireEvent.change(credit, { target: { value: "b".repeat(120) } });
    expect(english).toHaveAccessibleDescription(/Characters left: 0/);
    expect(credit).toHaveAccessibleDescription(/Characters left: 0/);
    fireEvent.change(credit, { target: { value: "b".repeat(100) } });
    expect(credit).toHaveAccessibleDescription(/Characters left: 20/);
  });

  it("lets the demo store take the key a demo upload yields", () => {
    const photo = demoPutPhoto("manifesto", {
      imageKey: "blob:http://localhost/3f2a",
      altTextEn: "Dancers",
      altTextPt: "Pessoas a dançar",
      credit: null,
      hasConsent: true,
    });
    expect(photo.slot).toBe("manifesto");
  });

  it.each([
    [
      "a coded photo_not_yours refusal",
      new ApiError(403, "Forbidden", {
        code: "studio_landing_photo_not_yours",
      }),
    ],
    [
      "a codeless 403 from the storage ownership check",
      new ApiError(403, "Referenced upload does not belong to you", {
        message: "Referenced upload does not belong to you",
      }),
    ],
  ])("names the real reason for %s", async (_label, refusal) => {
    mocks.putError = refusal;
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Replace photo Hero photo" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Hero photo" });
    fireEvent.click(within(dialog).getByRole("button", { name: /Everyone/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Save photo" }));
    expect(
      await within(dialog).findByText(
        "Use a photo you uploaded, or keep the one this slot holds",
      ),
    ).toBeInTheDocument();
    expect(mocks.puts[0]).toMatchObject({
      slot: "hero",
      imageKey: "studio-landing/hero/demo-sample.jpg",
      hasConsent: true,
    });
  });

  it("confirms before removing a photo", async () => {
    renderConsole();
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove photo Hero photo" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Remove this photo?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Remove photo" }),
    );
    expect(await screen.findByText("Photo removed")).toBeInTheDocument();
  });
});
