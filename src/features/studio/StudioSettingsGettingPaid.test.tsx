import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
} from "./api/studioDemoMe.data";
import { StudioSettingsPage } from "./StudioSettingsPage";

const refusal: { error: ApiError | null } = vi.hoisted(() => ({ error: null }));
vi.mock("./api/studioDemoPurchaseWrites", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPurchaseWrites")>();
  return {
    ...original,
    demoPutStudioPaymentMethods: (
      ...args: Parameters<typeof original.demoPutStudioPaymentMethods>
    ) => {
      if (refusal.error) throw refusal.error;
      return original.demoPutStudioPaymentMethods(...args);
    },
  };
});

function renderAt(address: string) {
  render(
    <TestProviders initialEntries={[address]}>
      <StudioSettingsPage />
    </TestProviders>,
  );
}

const MARIANA_ADDRESS = `/studio/settings?persona=${DEMO_ARTIST_MARIANA.id}`;
const SAVE_NAME = "Save ways to get paid";

function waysList(name: string) {
  return screen.getByRole("list", { name: `Ways to get paid for ${name}` });
}

beforeEach(() => {
  refusal.error = null;
  resetDemoPurchases();
});

describe("Studio settings, Getting paid", () => {
  it("shows Mariana's three ways to get paid with a persona select", async () => {
    renderAt(MARIANA_ADDRESS);
    expect(
      await screen.findByRole("heading", { name: "How buyers pay you" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Artist page" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(waysList("Mariana Sol")).getAllByRole("listitem"),
      ).toHaveLength(3),
    );
  });

  it("warns before the last way goes while music is for sale, and names the server's refusal", async () => {
    renderAt(MARIANA_ADDRESS);
    await screen.findByRole("list", {
      name: "Ways to get paid for Mariana Sol",
    });
    for (const remaining of [2, 1, 0]) {
      fireEvent.click(screen.getAllByRole("button", { name: /^Remove / })[0]!);
      await waitFor(() =>
        expect(
          within(waysList("Mariana Sol")).queryAllByRole("listitem"),
        ).toHaveLength(remaining),
      );
    }
    expect(
      await screen.findByText(
        "Music of Mariana Sol is for sale, so keep at least one way to get paid",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "No ways to get paid yet. Add one before you put music up for sale",
      ),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: SAVE_NAME }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't save your ways to get paid. Add a way to get paid before putting music up for sale, and keep one while anything is for sale",
    );
  });

  it("names the refused row with its number", async () => {
    refusal.error = new ApiError(400, "studio_payment_iban_invalid", {
      code: "studio_payment_iban_invalid",
      index: 1,
    });
    renderAt(MARIANA_ADDRESS);
    const mbwayInput = await screen.findByRole("textbox", {
      name: "MB WAY phone number",
    });
    fireEvent.change(mbwayInput, { target: { value: "913 456 789" } });
    fireEvent.click(screen.getByRole("button", { name: SAVE_NAME }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't save your ways to get paid. Way 2: Check the IBAN: the country code, length or check digits do not match",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "MB WAY phone number" }),
      ).toHaveFocus(),
    );
  });

  it("saves and announces it", async () => {
    renderAt(`/studio/settings?persona=${DEMO_ARTIST_LATE_BLOOMERS.id}`);
    fireEvent.click(await screen.findByRole("button", { name: "MB WAY" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "MB WAY phone number" }),
      { target: { value: "913 000 000" } },
    );
    fireEvent.click(screen.getByRole("button", { name: SAVE_NAME }));
    const savedLine = await screen.findByText(
      "Saved. Buyers see these ways to pay Late Bloomers",
    );
    expect(savedLine.closest('[role="status"]')).not.toBeNull();
  });

  it("stops adding at eight ways", async () => {
    renderAt(MARIANA_ADDRESS);
    const addButton = await screen.findByRole("button", {
      name: "Add a way to get paid",
    });
    expect(addButton).not.toHaveAttribute("aria-disabled");
    for (let added = 0; added < 5; added += 1) fireEvent.click(addButton);
    await waitFor(() =>
      expect(
        within(waysList("Mariana Sol")).getAllByRole("listitem"),
      ).toHaveLength(8),
    );
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(
      await screen.findByText("An artist can list up to 8 ways to get paid"),
    ).toBeInTheDocument();
  });

  it("focuses the section heading when the address carries #getting-paid", async () => {
    renderAt(`${MARIANA_ADDRESS}#getting-paid`);
    const heading = await screen.findByRole("heading", {
      name: "How buyers pay you",
    });
    await waitFor(() => expect(document.activeElement).toBe(heading));
  });

  it("scrolls to the section heading once the ways to get paid have loaded", async () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");
    try {
      renderAt(`${MARIANA_ADDRESS}#getting-paid`);
      await screen.findByRole("list", {
        name: "Ways to get paid for Mariana Sol",
      });
      const heading = screen.getByRole("heading", {
        name: "How buyers pay you",
      });
      await waitFor(() => expect(scrollSpy.mock.contexts).toContain(heading));
      const headingCallIndex = scrollSpy.mock.contexts.indexOf(heading);
      expect(scrollSpy.mock.calls[headingCallIndex]?.[0]).toEqual({
        block: "start",
        behavior: "instant",
      });
    } finally {
      scrollSpy.mockRestore();
    }
  });
});
