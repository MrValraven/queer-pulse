import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFormatters } from "../../shared/i18n/format";
import { TestProviders } from "../../test/TestProviders";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
} from "./api/studioDemoMe.data";
import { demoStudioSalesTotals } from "./api/studioDemoPurchases";
import {
  demoPurchaseStore,
  resetDemoPurchases,
} from "./api/studioDemoPurchaseStore";
import { StudioPaymentsPage } from "./StudioPaymentsPage";

const mocks: { hasNoPersonas: boolean; shouldDeclineFail: boolean } =
  vi.hoisted(() => ({ hasNoPersonas: false, shouldDeclineFail: false }));

// The real demo writes run; a failing decline answers 404
// studio_purchase_not_found, a refusal other than the 409, and stores nothing.
vi.mock("./api/studioDemoPurchaseWrites", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPurchaseWrites")>();
  const { studioRefusal } = await import("./api/studioDemoMutations");
  return {
    ...original,
    demoDeclineStudioPurchase: (
      ...args: Parameters<typeof original.demoDeclineStudioPurchase>
    ) => {
      if (mocks.shouldDeclineFail)
        throw studioRefusal(404, "studio_purchase_not_found");
      original.demoDeclineStudioPurchase(...args);
    },
  };
});

// The real access hook always runs; a member with no artist page sees the
// same answer with the uploadable personas emptied.
vi.mock("./api/useStudioAccess", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/useStudioAccess")>();
  return {
    ...original,
    useStudioAccess: () => {
      const access = original.useStudioAccess();
      return mocks.hasNoPersonas
        ? { ...access, uploadablePersonas: [] }
        : access;
    },
  };
});

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <StudioPaymentsPage />
    </TestProviders>,
  );
}

const MARIANA_INBOX = "Payments of Mariana Sol to confirm";

/** A euro amount as `StudioEuroAmount` prints it in English. */
function formattedEuros(cents: number) {
  const euros = cents / 100;
  const isWholeEuros = Number.isInteger(euros);
  return createFormatters("en").currency(euros, "EUR", {
    minimumFractionDigits: isWholeEuros ? 0 : 2,
    maximumFractionDigits: isWholeEuros ? 0 : 4,
  });
}

/** The row's reference line, matched on the paragraph's whole text (its
 *  own text node alone is "Reference ", which the matcher trims). */
const referenceLineOf = (row: HTMLElement) =>
  within(row).getByText(
    (_content, element) =>
      element?.tagName === "P" &&
      /^Reference \S/.test(element.textContent ?? ""),
  );

const confirmButtonOf = (name: string) =>
  screen.getByRole("button", {
    name: new RegExp(`^Confirm the payment from ${name} for `),
  });

async function inboxRows() {
  const list = await screen.findByRole("list", { name: MARIANA_INBOX });
  await waitFor(() =>
    expect(within(list).getAllByRole("listitem").length).toBeGreaterThan(0),
  );
  return within(list).getAllByRole("listitem");
}

const demoRowOf = (purchaseId: string) => {
  const row = demoPurchaseStore().rows.find(
    (candidate) => candidate.id === purchaseId,
  );
  if (!row) throw new Error(`No demo purchase ${purchaseId}`);
  return row;
};

beforeEach(() => {
  mocks.hasNoPersonas = false;
  mocks.shouldDeclineFail = false;
  resetDemoPurchases();
});

describe("StudioPaymentsPage to confirm", () => {
  it("opens on Mariana's claims, oldest first, with what the artist needs to match them", async () => {
    renderAt("/studio/payments");
    expect(
      await screen.findByRole("heading", { name: "Payments to confirm" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /To confirm/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const rows = await inboxRows();
    expect(rows.map((row) => referenceLineOf(row).textContent)).toEqual([
      "Reference N6CR2G",
      "Reference W3PQ8D",
      "Reference H4TM7Z",
    ]);
    // Rui said they paid 6 days ago, the oldest claim.
    expect(within(rows[0]!).getByText("Rui Alves")).toBeInTheDocument();
    expect(
      within(rows[0]!).getByText("Name on the payment: R Alves"),
    ).toBeInTheDocument();
    expect(within(rows[1]!).getByText("Joana Matos")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("Inês Duarte")).toBeInTheDocument();
  });

  it("confirms a payment, folds the row away and announces it", async () => {
    renderAt("/studio/payments");
    await inboxRows();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm the payment from Rui Alves for Cidade dos santos",
      }),
    );
    expect(
      await screen.findByText(
        "Payment confirmed. Rui Alves can download Cidade dos santos now",
      ),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: MARIANA_INBOX });
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(2),
    );
    expect(within(list).queryByText("Rui Alves")).toBeNull();
    expect(demoRowOf("demo-claim-rui").status).toBe("confirmed");
  });

  it("declines with a reason and a note", async () => {
    renderAt("/studio/payments");
    await inboxRows();
    fireEvent.click(
      screen.getByRole("button", {
        name: /^Decline the payment from Joana Matos for /,
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Decline this payment?",
    });
    fireEvent.click(
      within(dialog).getByRole("radio", { name: "The amount is different" }),
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", {
        name: "Note for Joana Matos (optional)",
      }),
      { target: { value: "Recebi 1 €" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Decline payment" }),
    );
    expect(
      await screen.findByText("Payment declined. Joana Matos sees your reason"),
    ).toBeInTheDocument();
    const declined = demoRowOf("demo-claim-joana");
    expect(declined.status).toBe("declined");
    expect({
      reason: declined.declineReason,
      note: declined.declineNote,
    }).toEqual({ reason: "amount_different", note: "Recebi 1 €" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("moves focus to the next row's Confirm, then to the panel heading", async () => {
    renderAt("/studio/payments");
    await inboxRows();
    fireEvent.click(confirmButtonOf("Rui Alves"));
    await screen.findByText(/^Payment confirmed\. Rui Alves /);
    await waitFor(() => expect(confirmButtonOf("Joana Matos")).toHaveFocus());
    await waitFor(() =>
      expect(confirmButtonOf("Joana Matos")).not.toHaveAttribute(
        "aria-disabled",
      ),
    );
    fireEvent.click(confirmButtonOf("Joana Matos"));
    await screen.findByText(/^Payment confirmed\. Joana Matos /);
    await waitFor(() => expect(confirmButtonOf("Inês Duarte")).toHaveFocus());
    await waitFor(() =>
      expect(confirmButtonOf("Inês Duarte")).not.toHaveAttribute(
        "aria-disabled",
      ),
    );
    fireEvent.click(confirmButtonOf("Inês Duarte"));
    await screen.findByText(/^Payment confirmed\. Inês Duarte /);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: MARIANA_INBOX }),
      ).toHaveFocus(),
    );
    expect(
      await screen.findByText(
        "No payments waiting. When a member says they paid you, it shows up here",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the dialog, the row and the picks when a decline fails", async () => {
    mocks.shouldDeclineFail = true;
    renderAt("/studio/payments");
    await inboxRows();
    fireEvent.click(
      screen.getByRole("button", {
        name: /^Decline the payment from Joana Matos for /,
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Decline this payment?",
    });
    fireEvent.click(
      within(dialog).getByRole("radio", { name: "The amount is different" }),
    );
    const note = within(dialog).getByRole("textbox", {
      name: "Note for Joana Matos (optional)",
    });
    fireEvent.change(note, { target: { value: "Recebi 1 €" } });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Decline payment" }),
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "We couldn't decline this payment. This purchase is not available to you",
    );
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("radio", { name: "The amount is different" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(note).toHaveValue("Recebi 1 €");
    const list = screen.getByRole("list", { name: MARIANA_INBOX });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getByText("Joana Matos")).toBeInTheDocument();
    expect(demoRowOf("demo-claim-joana").status).toBe("pending");
  });

  it("drops a row someone else already answered and says so", async () => {
    renderAt("/studio/payments");
    await inboxRows();
    // A co-member confirmed Rui's claim after this page loaded: the demo
    // answers the second decider with 409 studio_purchase_not_pending.
    demoRowOf("demo-claim-rui").status = "confirmed";
    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirm the payment from Rui Alves for Cidade dos santos",
      }),
    );
    expect(
      await screen.findByText("This purchase was already answered"),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: MARIANA_INBOX });
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(2),
    );
    expect(
      screen.queryByText(/We couldn't confirm this payment/),
    ).not.toBeInTheDocument();
  });
});

describe("StudioPaymentsPage sales and empty states", () => {
  it("shows the sales tab with totals equal to the rows", async () => {
    renderAt("/studio/payments?tab=sales");
    expect(await screen.findByRole("tab", { name: "Sales" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const totals = demoStudioSalesTotals(DEMO_ARTIST_MARIANA.id);
    const confirmedRows = demoPurchaseStore().rows.filter(
      (row) =>
        row.artistId === DEMO_ARTIST_MARIANA.id && row.status === "confirmed",
    );
    expect(totals.allTime.count).toBe(confirmedRows.length);
    expect(totals.allTime.amountCents).toBe(
      confirmedRows.reduce((sum, row) => sum + row.amountCents, 0),
    );
    const totalsGroup = await screen.findByRole("group", {
      name: "Your sales totals",
    });
    expect(within(totalsGroup).getByText("Last 28 days")).toBeInTheDocument();
    expect(within(totalsGroup).getByText("All time")).toBeInTheDocument();
    expect(
      within(totalsGroup).getByText(`${totals.last28Days.count} sales`),
    ).toBeInTheDocument();
    expect(
      within(totalsGroup).getByText(`${totals.allTime.count} sales`),
    ).toBeInTheDocument();
    expect(
      within(totalsGroup).getByText(
        (_content, element) =>
          element?.tagName === "DD" &&
          element.textContent === formattedEuros(totals.allTime.amountCents),
      ),
    ).toBeInTheDocument();
    expect(
      within(totalsGroup).getByText(
        (_content, element) =>
          element?.tagName === "DD" &&
          element.textContent === formattedEuros(totals.last28Days.amountCents),
      ),
    ).toBeInTheDocument();

    const list = screen.getByRole("list", { name: "Sales of Mariana Sol" });
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(8),
    );
    expect(within(list).getByText("Deleted account")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show more sales" }));
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(16),
    );
  });

  it("asks for an artist page when the member has none", async () => {
    mocks.hasNoPersonas = true;
    renderAt("/studio/payments");
    expect(
      await screen.findByRole("heading", {
        name: "Create a persona that works with Studio",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("names the artist page it shows when ?persona= is none of the member's", async () => {
    renderAt("/studio/payments?persona=someone-elses-artist-page");
    expect(
      await screen.findByText(
        "That artist page is not one of yours, so this shows Mariana Sol",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("list", { name: MARIANA_INBOX }),
    ).toBeInTheDocument();
  });

  it("leaves the unknown artist page line out for one of the member's own", async () => {
    renderAt(`/studio/payments?persona=${DEMO_ARTIST_MARIANA.id}`);
    await screen.findByRole("list", { name: MARIANA_INBOX });
    expect(
      screen.queryByText(/^That artist page is not one of yours/),
    ).not.toBeInTheDocument();
  });

  it("shows the empty line for Late Bloomers", async () => {
    renderAt(`/studio/payments?persona=${DEMO_ARTIST_LATE_BLOOMERS.id}`);
    expect(
      await screen.findByText(
        "No payments waiting. When a member says they paid you, it shows up here",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", {
        name: "Payments of Late Bloomers to confirm",
      }),
    ).toBeInTheDocument();
  });
});

describe("StudioPaymentsPage decline focus", () => {
  it("moves focus to the next row's Confirm once the decline dialog has left", async () => {
    const focusLog: {
      element: EventTarget | null;
      isDialogMounted: boolean;
    }[] = [];
    const recordFocus = (event: FocusEvent) => {
      focusLog.push({
        element: event.target,
        isDialogMounted: document.querySelector('[role="dialog"]') !== null,
      });
    };
    document.addEventListener("focusin", recordFocus);
    try {
      renderAt("/studio/payments");
      await inboxRows();
      fireEvent.click(
        screen.getByRole("button", {
          name: /^Decline the payment from Joana Matos for /,
        }),
      );
      const dialog = await screen.findByRole("dialog", {
        name: "Decline this payment?",
      });
      fireEvent.click(
        within(dialog).getByRole("button", { name: "Decline payment" }),
      );
      await screen.findByText("Payment declined. Joana Matos sees your reason");
      const nextConfirm = confirmButtonOf("Inês Duarte");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(nextConfirm).toHaveFocus());
      const nextConfirmFocusEntries = focusLog.filter(
        (entry) => entry.element === nextConfirm,
      );
      expect(nextConfirmFocusEntries.length).toBeGreaterThan(0);
      expect(
        nextConfirmFocusEntries.every((entry) => !entry.isDialogMounted),
      ).toBe(true);
    } finally {
      document.removeEventListener("focusin", recordFocus);
    }
  });
});
