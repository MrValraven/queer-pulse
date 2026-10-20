import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SkinData, SubprofileSection } from "../../api/subprofiles.api";
import { resetPhotoReveals } from "../../photoReveal";
import { TattooCoverUps } from "./TattooCoverUps";
import { TattooFlash, TattooWannaDos } from "./TattooFlash";
import { TattooProjects } from "./TattooProjects";
import { TattooScarWork } from "./TattooScarWork";
import { buildTattooView } from "./tattooView";

// Unrun per repo policy: verified statically.

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
  skinData: SkinData | null = null,
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

/** Gives every element the strip's scroll box: jsdom lays nothing out, so
 *  without this every strip reads as fitting. Returns the restore call. */
function mockStripBox(scrollWidth: number, clientWidth: number) {
  const scrollWidthSpy = vi
    .spyOn(Element.prototype, "scrollWidth", "get")
    .mockReturnValue(scrollWidth);
  const clientWidthSpy = vi
    .spyOn(Element.prototype, "clientWidth", "get")
    .mockReturnValue(clientWidth);
  return () => {
    scrollWidthSpy.mockRestore();
    clientWidthSpy.mockRestore();
  };
}

function twoSessionProject() {
  return makeData({
    in_progress: [
      makeItem("Back piece", "in_progress", {
        structured: {
          sessions: [{ imageUrl: "a.jpg" }, { imageUrl: "b.jpg" }],
        },
      }),
    ],
  });
}

function blockProps(
  data: PublicSubprofileView,
  onOpenWorkItem?: (item: SubprofileItemView) => void,
) {
  return {
    data,
    view: buildTattooView(data, "2026-10-19"),
    mode: "public" as const,
    onOpenWorkItem,
  };
}

describe("tattoo portfolio blocks", () => {
  beforeEach(() => {
    resetPhotoReveals();
  });

  it("keeps claimed flash on the page with its label", () => {
    const data = makeData({
      flash: [
        makeItem("Moth sheet", "flash", {
          imageUrl: "moth.jpg",
          structured: { flash: { availability: "claimed" } },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooFlash {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByText("Claimed")).toBeTruthy();
    expect(screen.getByText("Moth sheet")).toBeTruthy();
  });

  it("shows a cover-up as a before and after pair", () => {
    const data = makeData({
      cover_ups: [
        makeItem("Rose rework", "cover_ups", {
          imageUrl: "after.jpg",
          structured: {
            photo: { isBlurred: false },
            coverUp: { type: "cover_up", beforeImageUrl: "before.jpg" },
          },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooCoverUps {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByText("Before")).toBeTruthy();
    expect(screen.getByText("After")).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("shows a cover-up with an empty before photo as the after photo alone", () => {
    const data = makeData({
      cover_ups: [
        makeItem("Rose rework", "cover_ups", {
          imageUrl: "after.jpg",
          structured: {
            photo: { isBlurred: false },
            coverUp: { type: "rework", beforeImageUrl: "" },
          },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooCoverUps {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.queryByText("Before")).toBeNull();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("steps through a project session by session and skips an empty session photo", () => {
    const data = makeData({
      in_progress: [
        makeItem("Back piece", "in_progress", {
          structured: {
            sessions: [
              { imageUrl: "a.jpg" },
              { imageUrl: "" },
              { imageUrl: "b.jpg" },
            ],
          },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooProjects {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByText("Session 1")).toBeTruthy();
    expect(screen.getByText("Session 2")).toBeTruthy();
    expect(screen.queryByText("Session 3")).toBeNull();
  });

  it("blurs a scar work photo until Show photo and opens it in the lightbox after", () => {
    const item = makeItem("Top surgery", "scar_work", {
      imageUrl: "scar.jpg",
      structured: { scarWork: { type: "top_surgery" } },
    });
    const onOpenWorkItem = vi.fn();
    render(
      <TestProviders>
        <TattooScarWork
          {...blockProps(makeData({ scar_work: [item] }), onOpenWorkItem)}
        />
      </TestProviders>,
    );
    expect(
      screen.queryByRole("button", { name: "Open Top surgery" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show photo/ }));
    fireEvent.click(screen.getByRole("button", { name: "Open Top surgery" }));
    expect(onOpenWorkItem).toHaveBeenCalledWith(item);
  });

  it("shows the scar work intro with no photos", () => {
    const data = makeData(
      {},
      {
        tattooScarWork: {
          intro: "Scars are welcome here.",
          hasFreeConsult: true,
        },
      },
    );
    render(
      <TestProviders>
        <TattooScarWork {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByText("Scars are welcome here.")).toBeTruthy();
    expect(screen.getByText("Free consultation")).toBeTruthy();
  });

  it("renders an unblurred tile without a BlurredPhoto wrapper", () => {
    const data = makeData({
      flash: [makeItem("Moth sheet", "flash", { imageUrl: "moth.jpg" })],
    });
    const { container } = render(
      <TestProviders>
        <TattooFlash {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByRole("img")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Show photo/ })).toBeNull();
    expect(container.querySelector("[data-concealed]")).toBeNull();
  });

  it("gives the before tile and session tiles no open button", () => {
    const onOpenWorkItem = vi.fn();
    const data = makeData({
      cover_ups: [
        makeItem("Rose rework", "cover_ups", {
          imageUrl: "after.jpg",
          structured: {
            photo: { isBlurred: false },
            coverUp: { type: "cover_up", beforeImageUrl: "before.jpg" },
          },
        }),
      ],
      in_progress: [
        makeItem("Back piece", "in_progress", {
          structured: { sessions: [{ imageUrl: "a.jpg" }] },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooCoverUps {...blockProps(data, onOpenWorkItem)} />
        <TattooProjects {...blockProps(data, onOpenWorkItem)} />
      </TestProviders>,
    );
    expect(
      screen.getAllByRole("button", { name: "Open Rose rework" }),
    ).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: "Open Back piece" }),
    ).toBeNull();
  });
});

describe("tattoo grid cards", () => {
  it("shows a wanna-do with no photo as a text card with no open button", () => {
    const onOpenWorkItem = vi.fn();
    const data = makeData({
      wanna_dos: [
        makeItem("Snake and dagger", "wanna_dos", {
          structured: {
            flash: { size: "10 cm", placements: ["forearm", "calf"] },
          },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooWannaDos {...blockProps(data, onOpenWorkItem)} />
      </TestProviders>,
    );
    expect(screen.getByText("Snake and dagger")).toBeTruthy();
    expect(screen.getByText("10 cm")).toBeTruthy();
    expect(screen.getByText("forearm, calf")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Open Snake and dagger" }),
    ).toBeNull();
  });

  it("formats a flash price as a localized amount", () => {
    const data = makeData({
      flash: [
        makeItem("Moth sheet", "flash", {
          imageUrl: "moth.jpg",
          structured: { flash: { price: "120,5" } },
        }),
      ],
    });
    render(
      <TestProviders>
        <TattooFlash {...blockProps(data)} />
      </TestProviders>,
    );
    expect(screen.getByText("€120.5")).toBeTruthy();
  });
});

describe("tattoo project session strip", () => {
  let restoreStripBox: () => void = () => {};

  beforeEach(() => {
    resetPhotoReveals();
  });

  afterEach(() => {
    restoreStripBox();
    restoreStripBox = () => {};
  });

  it("names the session strip and gives keyboard users scroll buttons", async () => {
    restoreStripBox = mockStripBox(600, 300);
    render(
      <TestProviders>
        <TattooProjects {...blockProps(twoSessionProject())} />
      </TestProviders>,
    );
    expect(
      screen.getByRole("region", { name: "Back piece sessions" }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: "Previous sessions" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next sessions" })).toBeTruthy();
  });

  it("hides both scroll buttons while the strip fits", () => {
    restoreStripBox = mockStripBox(300, 300);
    render(
      <TestProviders>
        <TattooProjects {...blockProps(twoSessionProject())} />
      </TestProviders>,
    );
    fireEvent.scroll(
      screen.getByRole("region", { name: "Back piece sessions" }),
    );
    expect(
      screen.queryByRole("button", { name: "Previous sessions" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Next sessions" })).toBeNull();
  });

  it("disables Previous at the start and Next at the end of the strip", async () => {
    restoreStripBox = mockStripBox(600, 300);
    render(
      <TestProviders>
        <TattooProjects {...blockProps(twoSessionProject())} />
      </TestProviders>,
    );
    const previous = await screen.findByRole("button", {
      name: "Previous sessions",
    });
    const next = screen.getByRole("button", { name: "Next sessions" });
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect(next.getAttribute("aria-disabled")).toBe("false");
    expect((next as HTMLButtonElement).disabled).toBe(false);

    const strip = screen.getByRole("region", { name: "Back piece sessions" });
    Object.defineProperty(strip, "scrollLeft", {
      configurable: true,
      value: 300,
    });
    fireEvent.scroll(strip);
    expect(previous.getAttribute("aria-disabled")).toBe("false");
    expect((previous as HTMLButtonElement).disabled).toBe(false);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect((next as HTMLButtonElement).disabled).toBe(true);
  });

  it("scrolls the session strip without smooth motion when reduced motion is on", async () => {
    restoreStripBox = mockStripBox(600, 300);
    document.documentElement.dataset.reduceMotion = "true";
    const scrollBy = vi.fn();
    Element.prototype.scrollBy = scrollBy;
    render(
      <TestProviders>
        <TattooProjects {...blockProps(twoSessionProject())} />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Next sessions" }),
    );
    delete document.documentElement.dataset.reduceMotion;
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto" }),
    );
  });
});
