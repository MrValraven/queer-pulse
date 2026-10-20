import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppRoutes } from "../../../../app/routes";
import { TestProviders } from "../../../../test/TestProviders";
import { resetPhotoReveals } from "../../photoReveal";
import {
  publicSubprofileToView,
  type PublicSubprofileView,
  type SubprofileItemView,
} from "../../api/subprofiles.adapters";
import { toPublicDto, type DemoSubprofile } from "../../data/subprofiles.data";
import { TATTOO_ARTIST_DEMO_SUBPROFILE } from "../../data/tattooArtistDemoSubprofile.data";
import { TATTOO_DEMO_SUBPROFILES } from "../../data/tattooDemoSubprofiles.data";
import type { PersonaViewMode } from "../../personaSkinRender";
import { tattooBlockAnchorId } from "./TattooBlock";
import { TattooBody } from "./TattooBody";
import {
  TATTOO_MAIN_BLOCKS,
  buildTattooView,
  type TattooBlockKey,
} from "./tattooView";

// Unrun per repo policy: verified statically.

const TODAY = "2026-10-19";

/** The EN block headings (Task 24's catalog copy). */
const EN_BLOCK_HEADINGS: Record<TattooBlockKey, string> = {
  flash: "Flash",
  healed: "Healed work",
  scarWork: "Gender-affirming & scar work",
  coverUps: "Cover-ups & reworks",
  projects: "Projects in progress",
  wannaDos: "Wanna-dos",
  styles: "Styles & specialisms",
  booking: "How to book",
  prices: "Pricing & policies",
  comfort: "Comfort & accessibility",
  hygiene: "Hygiene & credentials",
  aftercare: "Aftercare",
  guestSpots: "Guest spots & conventions",
  flashDays: "Flash days & fundraisers",
  shop: "Shop",
  gallery: "Photo gallery",
  lineage: "Apprenticeship & teaching",
  faq: "FAQ",
};

const BLOCK_ANCHOR_IDS = TATTOO_MAIN_BLOCKS.map(tattooBlockAnchorId);

function demoView(persona: DemoSubprofile): PublicSubprofileView {
  return publicSubprofileToView(toPublicDto(persona));
}

function agulhaLenta(): DemoSubprofile {
  const persona = TATTOO_DEMO_SUBPROFILES.find(
    (entry) => entry.handle === "agulha-lenta",
  );
  if (!persona) throw new Error("agulha-lenta is missing from the demo");
  return persona;
}

function makeItem(
  id: string,
  section: SubprofileItemView["section"],
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

function renderBody(data: PublicSubprofileView, mode: PersonaViewMode) {
  return render(
    <TestProviders>
      <TattooBody data={data} mode={mode} onAction={() => {}} />
    </TestProviders>,
  );
}

function renderRoute(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <AppRoutes />
    </TestProviders>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  resetPhotoReveals();
});

describe("TattooBody", () => {
  it("shows Works at for a tattoo artist on a studio team", () => {
    const data = demoView(agulhaLenta());
    expect(data.worksAt?.map((listing) => listing.name)).toContain(
      "Tinta Viva",
    );
    renderBody(data, "public");
    expect(screen.getByText("Works at")).toBeInTheDocument();
    expect(screen.getByText("Tinta Viva", { exact: false })).toBeVisible();
  });

  it("renders the tattoo layout for a tattoo persona", async () => {
    renderRoute("/p/inkwell-mariana");
    expect(
      await screen.findByRole("heading", { level: 1, name: /Inkwell/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Flash" })).toBeInTheDocument();
    const scarWork = screen.getByRole("region", {
      name: "Gender-affirming & scar work",
    });
    const coverUps = screen.getByRole("region", {
      name: "Cover-ups & reworks",
    });
    expect(
      scarWork.compareDocumentPosition(coverUps) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the main column in the spec's order", () => {
    const data = demoView(TATTOO_ARTIST_DEMO_SUBPROFILE);
    const view = buildTattooView(data, TODAY);
    renderBody(data, "public");
    const regionNames = screen
      .getAllByRole("region")
      .filter((region) => BLOCK_ANCHOR_IDS.includes(region.id))
      .map((region) => {
        const headingId = region.getAttribute("aria-labelledby") ?? "";
        return document.getElementById(headingId)?.textContent ?? "";
      });
    const expectedNames = TATTOO_MAIN_BLOCKS.filter(
      (blockKey) => view.hasContent[blockKey],
    ).map((blockKey) => EN_BLOCK_HEADINGS[blockKey]);
    expect(expectedNames.length).toBeGreaterThan(10);
    expect(regionNames).toEqual(expectedNames);
  });

  it("renders the starred scar work photo blurred above the main column", () => {
    const starredScarWork = makeItem("scar-starred", "scar_work", {
      title: "Vines over a surgery scar",
      imageUrl: "https://example.com/vines.jpg",
      isFeatured: true,
      structured: {
        scarWork: { type: "top_surgery" },
        photo: { hasClientConsent: true, isBlurred: true },
      },
    });
    const data: PublicSubprofileView = {
      ...demoView(agulhaLenta()),
      featured: starredScarWork,
    };
    renderBody(data, "public");
    const spotlight = screen.getByRole("region", { name: "Starred piece" });
    expect(
      within(spotlight).getByRole("button", { name: "Show photo" }),
    ).toBeInTheDocument();
    expect(
      within(spotlight).getByText("Vines over a surgery scar"),
    ).toBeTruthy();
  });

  describe("with scrollIntoView stubbed", () => {
    // jsdom may leave scrollIntoView out, so the descriptor (or its absence)
    // is what gets restored.
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "scrollIntoView",
    );
    const scrolledElements: Element[] = [];

    beforeEach(() => {
      scrolledElements.length = 0;
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        writable: true,
        value: function scrollIntoViewStub(this: Element) {
          scrolledElements.push(this);
        },
      });
    });

    afterEach(() => {
      if (originalDescriptor) {
        Object.defineProperty(
          Element.prototype,
          "scrollIntoView",
          originalDescriptor,
        );
      } else {
        Reflect.deleteProperty(Element.prototype, "scrollIntoView");
      }
    });

    it("scrolls to How to book from the hero", () => {
      renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
      const hero = screen
        .getByRole("heading", { level: 1 })
        .closest("header") as HTMLElement;
      within(hero).getByRole("button", { name: "How to book" }).click();
      expect(scrolledElements).toHaveLength(1);
      expect(scrolledElements[0]).toBe(
        document.getElementById("tattoo-booking"),
      );
    });
  });

  it("pins the phone booking bar to body", () => {
    renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
    const bar = screen.getByRole("complementary", { name: "Book Inkwell" });
    expect(bar.parentElement).toBe(document.body);
  });

  it("shows the owner the status switch and every empty block as a chapter to fill", async () => {
    renderRoute("/p/agulha-lenta");
    const openButton = await screen.findByRole("button", {
      name: "Books open",
    });
    expect(openButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Waitlist" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "Books closed" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("link", { name: "Add flash" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Add guest spot" }),
    ).toBeInTheDocument();
  });

  it("gives the owner one View as visitor, in the owner bar", async () => {
    renderRoute("/p/agulha-lenta");
    expect(
      await screen.findByRole("button", { name: "Books open" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "View as visitor" }),
    ).toHaveLength(1);
  });

  it("shows a visitor nothing of an empty persona's blocks", () => {
    renderBody(demoView(agulhaLenta()), "public");
    expect(screen.queryByRole("region", { name: "Flash" })).toBeNull();
    expect(screen.queryByRole("button", { name: "How to book" })).toBeNull();
  });

  it("keeps the therapist and every other kind on their own layouts", async () => {
    const { container } = renderRoute("/p/nightform");
    expect(
      await screen.findByRole("heading", { name: "Updates" }),
    ).toBeInTheDocument();
    expect(container.querySelector("#tattoo-booking")).toBeNull();
    expect(document.getElementById("tattoo-booking")).toBeNull();
  });
});

describe("TattooBody booking asides", () => {
  it("keeps the phone bar to the pill and How to book, with no name or wait note", () => {
    renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
    const bar = screen.getByRole("complementary", { name: "Book Inkwell" });
    expect(within(bar).getByText("Waitlist")).toBeInTheDocument();
    expect(
      within(bar).getByRole("button", { name: "How to book" }),
    ).toBeInTheDocument();
    expect(within(bar).queryByText("Inkwell")).toBeNull();
    expect(within(bar).queryByText(/books reopen early november/)).toBeNull();
  });

  it("puts the wait note on its own line under the hero and sidebar pills", () => {
    renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
    const hero = screen
      .getByRole("heading", { level: 1 })
      .closest("header") as HTMLElement;
    const heroNote = within(hero).getByText(/books reopen early november/);
    expect(heroNote.tagName).toBe("P");
    expect(heroNote.closest("[data-tone]")).toBeNull();
    const sidebar = screen.getByRole("complementary", {
      name: "Booking with Inkwell",
    });
    expect(
      within(sidebar).getByText(/books reopen early november/),
    ).toBeInTheDocument();
  });

  it("labels a guest spot that runs today Guest spot now", () => {
    renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
    const sidebar = screen.getByRole("complementary", {
      name: "Booking with Inkwell",
    });
    const spotCard = within(sidebar).getByRole("region", {
      name: "Guest spot now",
    });
    expect(within(spotCard).getByText("Tinta Viva")).toBeInTheDocument();
    expect(
      within(sidebar).queryByRole("region", { name: "Next guest spot" }),
    ).toBeNull();
  });

  it("keeps Next guest spot for a spot that has not started", () => {
    const base = demoView(TATTOO_ARTIST_DEMO_SUBPROFILE);
    const data: PublicSubprofileView = {
      ...base,
      sections: base.sections.map((section) =>
        section.section === "guest_spots"
          ? {
              ...section,
              items: section.items.filter(
                (item) => item.id !== "guest-spot-lisbon",
              ),
            }
          : section,
      ),
    };
    renderBody(data, "public");
    const sidebar = screen.getByRole("complementary", {
      name: "Booking with Inkwell",
    });
    const spotCard = within(sidebar).getByRole("region", {
      name: "Next guest spot",
    });
    expect(
      within(spotCard).getByText("Ink and Iris convention"),
    ).toBeInTheDocument();
  });

  it("prints the studio city once when an address line already names it", () => {
    renderBody(demoView(TATTOO_ARTIST_DEMO_SUBPROFILE), "public");
    const studioCard = screen.getByRole("region", { name: "Studio" });
    expect(within(studioCard).getByText("1100-319 Lisbon")).toBeInTheDocument();
    expect(within(studioCard).queryByText("Lisbon")).toBeNull();
  });
});
