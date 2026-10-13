import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../../app/providers/I18nProvider";
import type { ListingDraft } from "../listBusiness.data";
import { blankDraft } from "../listingFormDraft";
import { normalizeMobileDetails } from "../listingMobile.data";
import { ListingLivePreviewFacts } from "./ListingLivePreviewFacts";

const PLACEHOLDER = "How people get in and pay will show here.";
const PRACTICES_PLACEHOLDER = "The practices you tick will show here.";

function draftWith(overrides: Partial<ListingDraft>): ListingDraft {
  return { ...blankDraft(), name: "Roaming Hands", ...overrides };
}

function byAppointmentDraft(overrides: Partial<ListingDraft>): ListingDraft {
  return draftWith({
    cats: ["grooming"],
    mobile: true,
    mobileDetails: {
      ...normalizeMobileDetails(undefined),
      byAppointment: true,
    },
    entryMode: "appointmentOnly",
    ...overrides,
  });
}

/** Both blocks highlighted, so the practices placeholder always prints and
 *  waiting for it proves the lazy catalog loaded before an absence check. */
function renderHighlightedGettingIn(draft: ListingDraft) {
  return render(
    <I18nProvider>
      <ListingLivePreviewFacts
        draft={draft}
        highlightedRegions={["gettingIn", "practices"]}
      />
    </I18nProvider>,
  );
}

describe("ListingLivePreviewFacts", () => {
  it("hides Before you go when the hours already say By appointment only", async () => {
    const { container } = renderHighlightedGettingIn(byAppointmentDraft({}));
    expect(await screen.findByText(PRACTICES_PLACEHOLDER)).toBeTruthy();
    expect(
      container.querySelector('[data-preview-region="gettingIn"]'),
    ).toBeNull();
    expect(screen.queryByText(PLACEHOLDER)).toBeNull();
  });

  it("keeps the block for a by-appointment draft with another answer", async () => {
    renderHighlightedGettingIn(byAppointmentDraft({ payments: ["cash"] }));
    expect(await screen.findByText("Cash only")).toBeTruthy();
    expect(screen.queryByText("By appointment only")).toBeNull();
  });

  it("shows the placeholder while nothing at all is answered", async () => {
    renderHighlightedGettingIn(draftWith({ cats: ["grooming"] }));
    expect(await screen.findByText(PLACEHOLDER)).toBeTruthy();
  });
});
