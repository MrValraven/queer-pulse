import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { ListingDraft } from "../listBusiness.data";
import { blankDraft } from "../listingFormDraft";
import { normalizeMobileDetails } from "../listingMobile.data";
import { useListingForm } from "../useListingForm";
import { EntryFields } from "./EntryFields";
import { WaysToPayFields } from "./WaysToPayFields";

function Harness({ initial }: { initial: ListingDraft }) {
  const form = useListingForm(initial);
  return (
    <>
      <EntryFields form={form} />
      <output data-testid="by-appointment">
        {String(normalizeMobileDetails(form.draft.mobileDetails).byAppointment)}
      </output>
      <output data-testid="entry-mode">{String(form.draft.entryMode)}</output>
    </>
  );
}

function renderWith(fields: Partial<ListingDraft>) {
  return render(<Harness initial={{ ...blankDraft(), ...fields }} />, {
    wrapper: TestProviders,
  });
}

function PayHarness({ initial }: { initial: ListingDraft }) {
  const form = useListingForm(initial);
  return (
    <>
      <WaysToPayFields form={form} />
      <output data-testid="nif">{String(form.draft.issuesNifInvoices)}</output>
    </>
  );
}

function renderPayWith(fields: Partial<ListingDraft>) {
  return render(<PayHarness initial={{ ...blankDraft(), ...fields }} />, {
    wrapper: TestProviders,
  });
}

describe("EntryFields", () => {
  it("starts on Not saying and takes one way in", () => {
    renderWith({ cats: ["food"] });
    expect(screen.getByRole("radio", { name: "Not saying" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(screen.getByRole("radio", { name: "Members only" }));
    expect(screen.getByRole("radio", { name: "Members only" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Not saying" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("puts the way in inside a fieldset named by its legend", () => {
    renderWith({ cats: ["food"] });
    const fieldset = screen.getByRole("group", {
      name: "How do people get in?",
    });
    expect(fieldset.tagName).toBe("FIELDSET");
    expect(
      within(fieldset).getByRole("radiogroup", {
        name: "How do people get in?",
      }),
    ).toBeInTheDocument();
  });

  it("says Just turn up to an out-and-about listing", () => {
    renderWith({ cats: ["tours"], mobile: true });
    expect(
      screen.getByRole("radio", { name: "Just turn up" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Walk in anytime" })).toBeNull();
  });

  it("asks about entry only for nightlife or culture", () => {
    renderWith({ cats: ["food"] });
    expect(screen.queryByRole("radiogroup", { name: "Entry" })).toBeNull();
  });

  it("asks about entry for a nightlife listing, starting on Not saying", () => {
    renderWith({ cats: ["nightlife"] });
    const entry = screen.getByRole("radiogroup", { name: "Entry" });
    expect(
      within(entry).getByRole("radio", { name: "Not saying" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("asks for the time once Free before is picked", () => {
    renderWith({ cats: ["nightlife"] });
    expect(screen.queryByLabelText(/Free until/)).toBeNull();
    fireEvent.click(
      screen.getByRole("radio", { name: "Free before a set time" }),
    );
    expect(screen.getByLabelText(/Free until/)).toBeInTheDocument();
  });

  it("shows an inline error once the time is left empty", () => {
    renderWith({ cats: ["culture"], coverPolicy: "freeBefore" });
    const time = screen.getByLabelText(/Free until/);
    expect(time).toHaveAttribute("aria-required", "true");
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.blur(time);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Add the time free entry ends.",
    );
    expect(time).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(time, { target: { value: "23:00" } });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(time).toHaveValue("23:00");
  });

  it("turns the out-and-about hours toggle on and off with By appointment only", () => {
    renderWith({ cats: ["grooming"], mobile: true });
    const toggle = screen.getByTestId("by-appointment");
    expect(toggle).toHaveTextContent("false");
    fireEvent.click(screen.getByRole("radio", { name: "By appointment only" }));
    expect(toggle).toHaveTextContent("true");
    fireEvent.click(screen.getByRole("radio", { name: "Just turn up" }));
    expect(toggle).toHaveTextContent("false");
  });

  it("turns the hours toggle off when the answer goes back to Not saying", () => {
    renderWith({ cats: ["grooming"], mobile: true });
    const toggle = screen.getByTestId("by-appointment");
    fireEvent.click(screen.getByRole("radio", { name: "By appointment only" }));
    expect(toggle).toHaveTextContent("true");
    fireEvent.click(screen.getByRole("radio", { name: "Not saying" }));
    expect(toggle).toHaveTextContent("false");
    expect(screen.getByTestId("entry-mode")).toHaveTextContent("null");
  });

  it("says under the choices that an out-and-about way in sets the hours", () => {
    renderWith({ cats: ["tours"], mobile: true });
    expect(
      screen.getByText(
        "This also marks your opening hours as By appointment only.",
      ),
    ).toBeInTheDocument();
  });

  it("shows no linked hours line on a place", () => {
    renderWith({ cats: ["grooming"] });
    expect(
      screen.queryByText(
        "This also marks your opening hours as By appointment only.",
      ),
    ).toBeNull();
  });

  it("leaves the hours toggle alone on a place", () => {
    renderWith({ cats: ["grooming"] });
    fireEvent.click(screen.getByRole("radio", { name: "By appointment only" }));
    expect(screen.getByTestId("entry-mode")).toHaveTextContent(
      "appointmentOnly",
    );
    expect(screen.getByTestId("by-appointment")).toHaveTextContent("false");
  });
});

describe("WaysToPayFields", () => {
  it("ticks each way to pay on its own", () => {
    renderPayWith({ cats: ["food"] });
    // The fieldset and the chip row inside it are both named by the legend.
    const [group, chipRow] = screen.getAllByRole("group", {
      name: "Ways to pay",
    });
    expect(group?.tagName).toBe("FIELDSET");
    expect(chipRow?.tagName).toBe("DIV");
    expect(group).toHaveAccessibleDescription(
      "Tick every way people can pay you.",
    );
    if (!group) throw new Error("The Ways to pay fieldset did not render");
    const card = within(group).getByRole("button", { name: "Card" });
    expect(card).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(within(group).getByRole("button", { name: "Cash" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("asks an online listing about NIF invoices alone", () => {
    renderPayWith({ cats: ["design"], online: true });
    expect(screen.queryByRole("group", { name: "Ways to pay" })).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Invoices with your NIF" }),
    ).toBeInTheDocument();
  });

  it("starts the NIF question on Not saying and stores yes, no and null", () => {
    renderPayWith({ cats: ["food"] });
    const nif = screen.getByTestId("nif");
    expect(screen.getByRole("radio", { name: "Not saying" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(nif).toHaveTextContent("true");
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    expect(nif).toHaveTextContent("false");
    fireEvent.click(screen.getByRole("radio", { name: "Not saying" }));
    expect(nif).toHaveTextContent("null");
  });
});
