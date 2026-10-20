import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { socialHref } from "../../../../shared/social/socialPlatforms";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SkinData, SubprofileSection } from "../../api/subprofiles.api";
import { TattooAftercare } from "./TattooAftercare";
import { TattooBooking } from "./TattooBooking";
import { TattooPrices } from "./TattooPrices";
import { TattooStyles } from "./TattooStyles";
import { buildTattooView } from "./tattooView";

// Unrun per repo policy: verified statically.

const TODAY = "2026-10-19";

function makeItem(
  id: string,
  section: SubprofileSection,
  title: string,
): SubprofileItemView {
  return {
    id,
    section,
    title,
    createdAt: "2026-10-01T00:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: "",
    date: "",
    meta: "",
    tags: [],
    isFeatured: false,
    collaborators: [],
    venue: null,
    doors: null,
    ticketUrl: null,
    gigState: null,
    medium: null,
    dimensions: null,
    edition: null,
    workState: null,
    structured: null,
  };
}

function makeData(
  skinData: SkinData,
  overrides: Partial<PublicSubprofileView> = {},
  aftercareTitles: string[] = [],
): PublicSubprofileView {
  const aftercareItems = aftercareTitles.map((title, index) =>
    makeItem(`care-${index}`, "aftercare", title),
  );
  return {
    id: "persona-1",
    kind: "tattoo_artist",
    slug: "inkwell",
    handle: "inkwell",
    displayName: "Mariana",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "public",
    visibility: "open",
    status: "published",
    sections: [
      {
        section: "aftercare",
        labelKey: "subprofiles:section.aftercare",
        icon: (() => null) as never,
        fields: [],
        items: aftercareItems,
      },
    ],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData,
    ...overrides,
  } as PublicSubprofileView;
}

function renderBlock(
  Block: typeof TattooBooking,
  data: PublicSubprofileView,
  mode: "public" | "preview" = "public",
) {
  const view = buildTattooView(data, TODAY);
  return render(
    <TestProviders>
      <Block data={data} view={view} mode={mode} />
    </TestProviders>,
  );
}

describe("tattoo booking and care blocks", () => {
  it("offers the Instagram route when the persona links Instagram", () => {
    const data = makeData(
      { tattooBooking: { route: "instagram" } },
      {
        socialLinks: [
          { platform: "instagram", urlOrHandle: "@inkwell" },
        ] as never,
      },
    );
    renderBlock(TattooBooking, data);
    const link = screen.getByRole("link", { name: "Message on Instagram" });
    expect(link.getAttribute("href")).toBe(socialHref("instagram", "@inkwell"));
  });

  it("falls back to what to send when the route cannot be used", () => {
    const data = makeData({
      tattooBooking: {
        route: "email",
        email: "",
        whatToSend: ["idea", "placement"],
      },
    });
    renderBlock(TattooBooking, data);
    expect(screen.queryByText("Email to book")).toBeNull();
    expect(screen.getByText("Your idea")).toBeTruthy();
    expect(screen.getByText("Placement")).toBeTruthy();
  });

  it("shows the minimum and the deposit", () => {
    const data = makeData({
      tattooPrices: {
        minimum: "80",
        deposit: { amount: "50", isRefundable: true },
      },
    });
    renderBlock(TattooPrices, data);
    expect(screen.getByText("Minimum €80")).toBeTruthy();
    expect(screen.getByText("Deposit €50")).toBeTruthy();
    expect(screen.getByText("Refundable")).toBeTruthy();
  });

  it("repeats the touch-up policy under aftercare", () => {
    const data = makeData(
      { tattooPrices: { touchUps: { isFree: true, months: "3" } } },
      {},
      ["Keep it wrapped", "Wash gently", "Moisturise"],
    );
    renderBlock(TattooAftercare, data);
    const region = screen.getByRole("region", { name: "Aftercare" });
    const policy = within(region).getByText("Free touch-ups within 3 months");
    const lastStep = within(region).getByText("Moisturise");
    expect(
      lastStep.compareDocumentPosition(policy) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the touch-up policy out of prices while aftercare shows it", () => {
    const data = makeData(
      {
        tattooPrices: {
          minimum: "80",
          touchUps: { isFree: true, months: "3" },
        },
      },
      {},
      ["Keep it wrapped"],
    );
    renderBlock(TattooPrices, data);
    expect(screen.getByText("Minimum €80")).toBeTruthy();
    expect(screen.queryByText("Free touch-ups within 3 months")).toBeNull();
  });

  it("shows the touch-up policy under prices when aftercare has no steps", () => {
    const data = makeData({
      tattooPrices: {
        minimum: "80",
        touchUps: { isFree: true, months: "3" },
      },
    });
    renderBlock(TattooPrices, data);
    expect(screen.getByText("Free touch-ups within 3 months")).toBeTruthy();
  });

  it("labels the colour and the smallest size", () => {
    const data = makeData({
      tattooStyles: { colour: "black_grey", minSize: "5 cm" },
    });
    renderBlock(TattooStyles, data);
    const colourLabel = screen.getByText("Colour");
    expect(colourLabel.tagName).toBe("DT");
    expect(colourLabel.nextElementSibling?.textContent).toBe("Black and grey");
    const sizeLabel = screen.getByText("Smallest size");
    expect(sizeLabel.tagName).toBe("DT");
    expect(sizeLabel.nextElementSibling?.textContent).toBe("5 cm");
  });

  it("numbers aftercare steps in order", () => {
    const titles = ["Keep it wrapped", "Wash gently", "Moisturise"];
    renderBlock(TattooAftercare, makeData({}, {}, titles));
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(titles);
  });

  it("shows the artist's own style words as written", () => {
    const data = makeData({
      tattooStyles: { styles: ["fine_line", "Botanical blackwork"] },
    });
    renderBlock(TattooStyles, data);
    expect(screen.getByText("Fine line")).toBeTruthy();
    expect(screen.getByText("Botanical blackwork")).toBeTruthy();
  });
});
