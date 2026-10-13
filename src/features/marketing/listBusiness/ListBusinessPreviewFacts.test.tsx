import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type { ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { normalizeMobileDetails } from "./listingMobile.data";
import { ListBusinessPreviewFacts } from "./ListBusinessPreviewFacts";

vi.mock("./api/useListingAttributeVocabulary", async () => {
  const { LOCAL_ATTRIBUTE_VOCABULARY } =
    await import("./listingAttributes.data");
  return { useListingAttributeVocabulary: () => LOCAL_ATTRIBUTE_VOCABULARY };
});

function draftWith(overrides: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), name: "Pulse Bar", ...overrides };
}

function renderFacts(draft: ListingDraft) {
  return render(
    <I18nProvider>
      <ListBusinessPreviewFacts draft={draft} />
    </I18nProvider>,
  );
}

/** The text of the group block a heading opens, once the lazy marketing
 *  catalog has loaded. */
async function groupTextUnder(heading: string): Promise<string> {
  const headingElement = await screen.findByText(heading);
  return headingElement.parentElement?.textContent ?? "";
}

describe("ListBusinessPreviewFacts", () => {
  it("files a shared slug under the nightlife draft's own heading", async () => {
    renderFacts(
      draftWith({
        cats: ["nightlife"],
        attributes: ["alcohol-free-drinks", "dj-nights"],
      }),
    );
    const nightsOut = await groupTextUnder("Nights out");
    expect(nightsOut).toContain("Good alcohol-free drinks");
    expect(nightsOut).toContain("DJ nights");
    expect(screen.getByText("What's here")).toBeTruthy();
    expect(screen.queryByText("Food and drink")).toBeNull();
  });

  it("files the same slug under Food and drink for a food draft", async () => {
    renderFacts(
      draftWith({ cats: ["food"], attributes: ["alcohol-free-drinks"] }),
    );
    expect(await groupTextUnder("Food and drink")).toContain(
      "Good alcohol-free drinks",
    );
    expect(screen.queryByText("Nights out")).toBeNull();
  });

  it("lists the practices with the policy line when a link is given", async () => {
    renderFacts(
      draftWith({
        cats: ["nightlife"],
        inclusionPractices: ["chosen-name", "safer-space-policy"],
        saferSpacePolicyUrl: "pulsebar.pt/policy",
      }),
    );
    expect(await screen.findByText("Inclusion practices")).toBeTruthy();
    expect(screen.getByText(/Uses your chosen name/)).toBeTruthy();
    expect(screen.getByText(/Published safer-space policy/)).toBeTruthy();
    expect(screen.getByText(/Read the safer-space policy/)).toBeTruthy();
  });

  it("prints Getting in as a save sends it", async () => {
    renderFacts(
      draftWith({
        cats: ["nightlife"],
        entryMode: "walkIn",
        payments: ["card", "cash"],
        issuesNifInvoices: true,
      }),
    );
    expect(await screen.findByText("Before you go")).toBeTruthy();
    expect(screen.getByText("Walk in anytime")).toBeTruthy();
    expect(screen.getByText("Card · Cash")).toBeTruthy();
    expect(screen.getByText("Invoices with your NIF · Yes")).toBeTruthy();
  });

  it("keeps only the NIF answer and languages for an online draft", async () => {
    renderFacts(
      draftWith({
        cats: ["services"],
        online: true,
        entryMode: "walkIn",
        payments: ["card"],
        issuesNifInvoices: false,
        langs: ["pt"],
      }),
    );
    expect(await screen.findByText("Before you go")).toBeTruthy();
    expect(screen.getByText("Invoices with your NIF · No")).toBeTruthy();
    expect(screen.getByText("Português")).toBeTruthy();
    expect(screen.queryByText("Walk in anytime")).toBeNull();
    expect(screen.queryByText("Card")).toBeNull();
  });

  it("leaves the way in out of Getting in for a by-appointment listing", async () => {
    renderFacts(
      draftWith({
        cats: ["grooming"],
        mobile: true,
        mobileDetails: {
          ...normalizeMobileDetails(undefined),
          byAppointment: true,
        },
        entryMode: "appointmentOnly",
        payments: ["cash"],
      }),
    );
    expect(await screen.findByText("Before you go")).toBeTruthy();
    expect(screen.getByText("Cash only")).toBeTruthy();
    expect(screen.queryByText("By appointment only")).toBeNull();
  });

  it("keeps By appointment only in Getting in for a place", async () => {
    renderFacts(
      draftWith({ cats: ["grooming"], entryMode: "appointmentOnly" }),
    );
    expect(await screen.findByText("Before you go")).toBeTruthy();
    expect(screen.getByText("By appointment only")).toBeTruthy();
  });

  it("renders nothing for a draft with no facts", () => {
    const { container } = renderFacts(draftWith({ cats: ["nightlife"] }));
    expect(container.textContent).toBe("");
  });
});
