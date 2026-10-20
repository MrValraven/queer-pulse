import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SubprofileSection } from "../../api/subprofiles.api";
import { TestProviders } from "../../../../test/TestProviders";
import { TattooFaq } from "./TattooFaq";
import { TattooFlashDays } from "./TattooFlashDays";
import { TattooGuestSpots } from "./TattooGuestSpots";
import { TattooShop } from "./TattooShop";
import { buildTattooView } from "./tattooView";

// Unrun per repo policy: verified statically.

const TODAY = "2026-10-19";

function makeItem(
  id: string,
  section: SubprofileSection,
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView {
  return {
    id,
    section,
    title: id,
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
    ...overrides,
  };
}

function makeData(
  sectionItems: Partial<Record<SubprofileSection, SubprofileItemView[]>>,
  skinData: PublicSubprofileView["skinData"] = null,
): PublicSubprofileView {
  const sections = Object.entries(sectionItems).map(([section, items]) => ({
    section: section as SubprofileSection,
    labelKey: `subprofiles:section.${section}`,
    icon: (() => null) as never,
    fields: [],
    items: items ?? [],
  }));
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
    sections,
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData,
  } as unknown as PublicSubprofileView;
}

function renderBlock(
  Block: typeof TattooGuestSpots,
  data: PublicSubprofileView,
) {
  const view = buildTattooView(data, TODAY);
  return render(
    <TestProviders>
      <Block data={data} view={view} mode="public" />
    </TestProviders>,
  );
}

describe("Out and about blocks", () => {
  it("lists upcoming guest spots and folds past ones under Past", () => {
    renderBlock(
      TattooGuestSpots,
      makeData({
        guest_spots: [
          makeItem("Berlin guest spot", "guest_spots", {
            date: "2026-11-02",
            subtitle: "Berlin",
            structured: { spot: { type: "guest_spot", endDate: "2026-11-09" } },
          }),
          makeItem("Lisbon convention", "guest_spots", {
            date: "2026-03-02",
            subtitle: "Lisbon",
            structured: { spot: { type: "convention" } },
          }),
        ],
      }),
    );
    expect(screen.getByText("Berlin guest spot")).toBeTruthy();
    expect(screen.getByText("Berlin · 2 Nov 2026 to 9 Nov 2026")).toBeTruthy();
    expect(screen.queryByText("Lisbon convention")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Show past" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(screen.getByText("Lisbon convention")).toBeTruthy();
    const openToggle = screen.getByRole("button", { name: "Hide past" });
    expect(openToggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("links a flash day to its event page while the event resolves", () => {
    renderBlock(
      TattooFlashDays,
      makeData({
        flash_days: [
          makeItem("Trans joy flash", "flash_days", {
            date: "2026-11-14",
            subtitle: "Studio 4",
            structured: { flashDay: { eventSlug: "trans-joy-picnic" } },
            linkedEvent: {
              slug: "trans-joy-picnic",
              title: "Trans joy picnic",
              startsAt: "2026-11-14T12:00:00.000Z",
              endsAt: null,
              venue: null,
              neighbourhood: null,
              isOnline: false,
              imageUrl: null,
            },
          }),
        ],
      }),
    );
    const link = screen.getByRole("link", { name: "See the event" });
    expect(link.getAttribute("href")).toBe("/gatherings/trans-joy-picnic");
  });

  it("shows a flash day whose event stopped resolving as a plain dated card", () => {
    const { container } = renderBlock(
      TattooFlashDays,
      makeData({
        flash_days: [
          makeItem("Pride flash", "flash_days", {
            date: "2026-11-14",
            subtitle: "Studio 4",
            structured: { flashDay: {} },
            linkedEvent: null,
          }),
        ],
      }),
    );
    expect(container.querySelector('a[href*="/gatherings/"]')).toBeNull();
    expect(screen.getByText("Studio 4")).toBeTruthy();
    expect(screen.getByText("14 Nov 2026")).toBeTruthy();
  });

  it("names the shop's domain on its buy button", () => {
    renderBlock(
      TattooShop,
      makeData({
        shop: [
          makeItem("Flash sheet vol. 1", "shop", {
            url: "https://www.inkwell.shop/sheet-1",
            structured: { shop: { type: "flash_sheet", price: "12" } },
          }),
        ],
      }),
    );
    const link = screen.getByRole("link", { name: "Buy on inkwell.shop" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("shows a shop price as a currency amount", () => {
    renderBlock(
      TattooShop,
      makeData({
        shop: [
          makeItem("Moth print", "shop", {
            url: "https://inkwell.shop/moth",
            structured: { shop: { type: "print", price: "25" } },
          }),
          makeItem("Fern print", "shop", {
            url: "https://inkwell.shop/fern",
            structured: { shop: { type: "print", price: "18,5" } },
          }),
        ],
      }),
    );
    expect(screen.getByText("€25")).toBeTruthy();
    expect(screen.getByText("€18.5")).toBeTruthy();
    expect(screen.queryByText("25")).toBeNull();
  });

  it("opens and closes an FAQ answer", () => {
    const { container } = renderBlock(
      TattooFaq,
      makeData(
        {},
        {
          faq: [
            { question: "Do you tattoo minors?", answer: "Never under 18." },
            { question: "Can I bring a friend?", answer: "One friend, yes." },
          ],
        },
      ),
    );
    const first = screen.getByRole("button", { name: "Do you tattoo minors?" });
    expect(first.getAttribute("aria-expanded")).toBe("true");
    const second = screen.getByRole("button", {
      name: "Can I bring a friend?",
    });
    expect(second.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(second);
    expect(second.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("One friend, yes.")).toBeTruthy();
    expect(container.querySelector("details")).toBeNull();
  });
});
