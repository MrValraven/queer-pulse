import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { blankDraft } from "./listingFormDraft";
import type { ListingDraft } from "./listBusiness.data";
import { emptyMobileDetails } from "./listingMobile.data";
import { ListBusinessFullPreview } from "./ListBusinessFullPreview";
import { ReviewPracticalGroup } from "./ListBusinessReviewPractical";
import { StepReview } from "./ListBusinessReviewStep";
import type { ListingForm } from "./useListingForm";

function renderWithI18n(node: ReactNode) {
  return render(<I18nProvider>{node}</I18nProvider>);
}

function mobileDraft(overrides: Partial<ListingDraft> = {}): ListingDraft {
  return {
    ...blankDraft(),
    name: "Roaming Hands",
    hood: "Alfama",
    address: "Rua Stale 1",
    mobile: true,
    hasMeetingPoint: false,
    mobileDetails: { ...emptyMobileDetails(), allOfCity: true },
    ...overrides,
  };
}

const photoPreviews = { wide: "", d1: "", d2: "", vibe: "" };

describe("ListBusinessFullPreview for an out-and-about draft", () => {
  it("hides a stale hood and address and names the area", async () => {
    renderWithI18n(
      <ListBusinessFullPreview
        draft={mobileDraft()}
        userName="Sam"
        photoPreviews={photoPreviews}
        onClose={() => undefined}
      />,
    );
    expect(await screen.findByText(/Works across Lisbon/)).toBeTruthy();
    expect(screen.queryByText(/Alfama/)).toBeNull();
    expect(screen.queryByText("Rua Stale 1")).toBeNull();
  });

  it("shows By appointment only in place of the hours", async () => {
    renderWithI18n(
      <ListBusinessFullPreview
        draft={mobileDraft({
          mobileDetails: {
            ...emptyMobileDetails(),
            allOfCity: true,
            byAppointment: true,
          },
        })}
        userName="Sam"
        photoPreviews={photoPreviews}
        onClose={() => undefined}
      />,
    );
    expect(await screen.findByText("By appointment only")).toBeTruthy();
  });

  it("shows the address at a meeting point", async () => {
    renderWithI18n(
      <ListBusinessFullPreview
        draft={mobileDraft({ hasMeetingPoint: true })}
        userName="Sam"
        photoPreviews={photoPreviews}
        onClose={() => undefined}
      />,
    );
    expect(await screen.findByText("Rua Stale 1")).toBeTruthy();
  });
});

describe("The review recap for an out-and-about draft", () => {
  it("leaves the Basics neighbourhood row out", async () => {
    const draft = mobileDraft({ isStaffAuthored: true });
    renderWithI18n(
      <StepReview
        form={{ draft } as unknown as ListingForm}
        userName="Sam"
        userInitials="S"
        onEdit={() => undefined}
      />,
    );
    expect(await screen.findByText("Roaming Hands")).toBeTruthy();
    expect(screen.queryByText("Neighbourhood")).toBeNull();
  });

  it("adds the hood to the meeting point row when it is ticked", async () => {
    renderWithI18n(
      <ReviewPracticalGroup
        draft={mobileDraft({ hasMeetingPoint: true })}
        onEdit={() => undefined}
      />,
    );
    expect(await screen.findByText("Rua Stale 1 · Alfama")).toBeTruthy();
  });
});
