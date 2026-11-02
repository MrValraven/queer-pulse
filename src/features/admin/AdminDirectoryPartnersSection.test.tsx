import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  demoAddDirectoryPartner,
  resetDemoDirectoryPartners,
} from "../marketing/directoryPartnersDemoStore";
import type { DemoDirectoryPartnerSeed } from "../marketing/directoryPartnersDemoSeed.data";
import { AdminDirectoryPartnersSection } from "./AdminDirectoryPartnersSection";

/** Twelve live places, the same set the demo store tests fill the row with. */
const TWELVE_PICK_SLUGS = [
  "atelier-pulso",
  "queer-supper-club",
  "estudio-beatriz-pinto",
  "mare-lilas",
  "livraria-bertha",
  "cafe-mouraria-velha",
  "bairro-alto-studio",
  "espaco-intendente",
  "a-farinha",
  "studio-andre-quintela",
  "clinica-da-estrela",
  "galeria-lume",
];

const TWELVE_PICK_SEED: DemoDirectoryPartnerSeed[] = TWELVE_PICK_SLUGS.map(
  (slug) => ({ slug, note: null, publicState: "showing" }),
);

/** One code point, two UTF-16 units. Built from its number because the
 *  repo's emoji lint reads the escaped literal as a glyph. */
const RAINBOW = String.fromCodePoint(0x1f308);

function renderSection() {
  render(
    <TestProviders>
      <AdminDirectoryPartnersSection />
    </TestProviders>,
  );
}

function partnerList() {
  return screen.getByRole("list", { name: "Businesses we partner with" });
}

function rowNames() {
  return within(partnerList())
    .getAllByRole("listitem")
    .map((row) => row.querySelector("[data-partner-name]")?.textContent);
}

async function openAddDialog() {
  fireEvent.click(await screen.findByRole("button", { name: "Add partner" }));
  return screen.findByRole("dialog", { name: "Add partner" });
}

async function chooseNavalha(dialog: HTMLElement) {
  fireEvent.change(within(dialog).getByLabelText("Search live listings"), {
    target: { value: "Navalha" },
  });
  const results = await within(dialog).findByRole("list", {
    name: "Matching listings",
  });
  fireEvent.click(within(results).getByRole("button", { name: /Navalha/ }));
}

describe("AdminDirectoryPartnersSection (demo)", () => {
  beforeEach(() => resetDemoDirectoryPartners());

  it("lists every partner in order with its not-showing reason", async () => {
    renderSection();
    await waitFor(() =>
      expect(rowNames()).toEqual([
        "Livraria Bertha",
        "Queer Supper Club",
        "Fio Solto",
        "Noite Aberta",
      ]),
    );
    expect(
      screen.getByText("Not showing: the business has closed for good"),
    ).toBeInTheDocument();
    expect(screen.getByText("Members get 10% off")).toBeInTheDocument();
  });

  it("moves a partner down with Move down", async () => {
    renderSection();
    fireEvent.click(
      await screen.findByRole("button", { name: "Move Livraria Bertha down" }),
    );
    await waitFor(() =>
      expect(rowNames()).toEqual([
        "Queer Supper Club",
        "Livraria Bertha",
        "Fio Solto",
        "Noite Aberta",
      ]),
    );
    expect(
      await screen.findByText("Livraria Bertha is now number 2"),
    ).toBeInTheDocument();
  });

  it("removes a partner with Remove from partners", async () => {
    renderSection();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Fio Solto from partners",
      }),
    );
    await waitFor(() => expect(rowNames()).not.toContain("Fio Solto"));
    expect(
      await screen.findByText("Fio Solto is no longer a partner"),
    ).toBeInTheDocument();
  });

  it("adds a partner through the search dialog", async () => {
    renderSection();
    const dialog = await openAddDialog();
    await chooseNavalha(dialog);
    fireEvent.change(within(dialog).getByLabelText("Note (optional)"), {
      target: { value: "Hosts our quiz" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Add partner" }),
    );
    await waitFor(() => expect(rowNames().at(-1)).toBe("Navalha"));
    const rows = within(partnerList()).getAllByRole("listitem");
    expect(rows.at(-1)).toHaveTextContent("Hosts our quiz");
  });

  it("edits a note", async () => {
    renderSection();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Edit note for Livraria Bertha",
      }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Edit note" });
    const noteField = within(dialog).getByLabelText("Note (optional)");
    expect(noteField).toHaveValue("Members get 10% off");
    fireEvent.change(noteField, { target: { value: "" } });
    fireEvent.change(noteField, { target: { value: "Members get 15% off" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save note" }));
    expect(await screen.findByText("Members get 15% off")).toBeInTheDocument();
  });

  it("counts a note in characters a person sees", async () => {
    renderSection();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit note for Fio Solto" }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Edit note" });
    fireEvent.change(within(dialog).getByLabelText("Note (optional)"), {
      target: { value: RAINBOW.repeat(3) },
    });
    expect(within(dialog).getByText("3 of 140")).toBeInTheDocument();
  });

  it("disables Add partner at 12 with the reason shown", async () => {
    resetDemoDirectoryPartners(TWELVE_PICK_SEED);
    renderSection();
    const addButton = await screen.findByRole("button", {
      name: "Add partner",
    });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText("The row holds 12 partners. Remove one to add another"),
    ).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("names the cause when the add is refused", async () => {
    resetDemoDirectoryPartners(TWELVE_PICK_SEED.slice(0, 11));
    renderSection();
    const dialog = await openAddDialog();
    await chooseNavalha(dialog);
    // Another tab fills the last slot before this one submits.
    demoAddDirectoryPartner({ listingId: "salao-mouraria" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Add partner" }),
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "The row already has 12 partners. Remove one to add another",
    );
  });

  it("treats a blank search as idle", async () => {
    renderSection();
    const dialog = await openAddDialog();
    fireEvent.change(within(dialog).getByLabelText("Search live listings"), {
      target: { value: "   " },
    });
    expect(
      await within(dialog).findByText("Type a business name to find it"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("list", { name: "Matching listings" }),
    ).not.toBeInTheDocument();
  });
});
