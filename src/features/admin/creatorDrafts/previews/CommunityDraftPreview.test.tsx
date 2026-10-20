import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import wizardStyles from "../../../communities/startCommunity/StartCommunityPage.module.css";
import type { CommunityDraftPreview as CommunityDraftPreviewData } from "../../api/adminCreatorDrafts.api";
import { CommunityDraftPreview } from "./CommunityDraftPreview";

const bookClubPreview: CommunityDraftPreviewData = {
  name: "Trans Book Club Porto",
  purpose: "A monthly reading circle for trans and nonbinary readers in Porto.",
  accessTier: "request",
  features: ["discussion", "events"],
  tint: "plum",
  tagline: "Tea, books and good company",
  handle: "transbookclubporto",
  avatarImageUrl: null,
  coverImageUrl: null,
};

describe("CommunityDraftPreview", () => {
  it("shows the draft card inside the preview frame", () => {
    render(
      <TestProviders>
        <CommunityDraftPreview preview={bookClubPreview} />
      </TestProviders>,
    );
    const frame = screen.getByRole("region", {
      name: /creatorDrafts\.preview\.label|preview/i,
    });
    expect(
      within(frame).getByText("Trans Book Club Porto"),
    ).toBeInTheDocument();
    expect(within(frame).getByText("@transbookclubporto")).toBeInTheDocument();
  });

  it("renders the card alone at phone width, with no wizard column, label or note", () => {
    // The wizard's `.previewCol` hides itself below 980px, and jsdom applies
    // no CSS, so the guard is that the staff root never carries that class.
    const originalWidth = window.innerWidth;
    window.innerWidth = 390;
    window.dispatchEvent(new Event("resize"));
    const { container } = render(
      <TestProviders>
        <CommunityDraftPreview preview={bookClubPreview} />
      </TestProviders>,
    );
    const frame = screen.getByRole("region", {
      name: /creatorDrafts\.preview\.label|preview/i,
    });
    expect(container.querySelector(`.${wizardStyles.previewCol}`)).toBeNull();
    expect(frame.querySelector(`.${wizardStyles.pvHead}`)).toBeNull();
    expect(frame.querySelector(`.${wizardStyles.pvFoot}`)).toBeNull();
    expect(
      within(frame).queryByText(/start\.preview\.liveLabel|Live preview/i),
    ).toBeNull();
    expect(within(frame).getByText("Trans Book Club Porto")).toBeVisible();
    window.innerWidth = originalWidth;
  });

  it("keeps the empty draft's values for a malformed payload", () => {
    const malformed = {
      name: 42,
      purpose: ["x"],
      accessTier: "everyone",
      features: "events",
      rules: [1, 2],
      tint: "neon",
      tagline: {},
      handle: null,
      tags: "trans",
      coverImageUrl: 5,
      avatarImageUrl: true,
    } as unknown as CommunityDraftPreviewData;
    const { container } = render(
      <TestProviders>
        <CommunityDraftPreview preview={malformed} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("region", {
        name: /creatorDrafts\.preview\.label|preview/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });
});
