import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { PersonaColophon, PersonaRightsFooter } from "./PersonaRightsFooter";
import {
  firstPublishedISO,
  latestPublishedISO,
  publishedYearRange,
} from "./firstPublished";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../api/subprofiles.adapters";

/**
 * The persona page's single copyright + provenance notice. It replaced the
 * per-item `WorkRightsFooter` that used to repeat under every row, spotlight
 * and menu card, so the important properties are: exactly ONE notice, and a
 * date taken from the persona's earliest dated item.
 */
function makeItem(overrides: Partial<SubprofileItemView>): SubprofileItemView {
  return {
    id: "item-1",
    section: "projects",
    title: "Neon Skyline",
    createdAt: "2025-03-02T12:00:00.000Z",
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

function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-rights",
    kind: "musician",
    slug: "nightform",
    handle: "nightform",
    displayName: "Sofia Neves",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...overrides,
  };
}

const SECTIONS = [
  {
    section: "projects",
    labelKey: "subprofiles:section.projects",
    icon: (() => null) as never,
    fields: [],
    items: [
      makeItem({ id: "a", createdAt: "2026-01-20T09:00:00.000Z" }),
      makeItem({ id: "b", createdAt: "2024-06-11T09:00:00.000Z" }),
      makeItem({ id: "c", createdAt: "not-a-date" }),
    ],
  },
] as unknown as PublicSubprofileView["sections"];

describe("firstPublishedISO", () => {
  it("picks the earliest valid createdAt across featured and section items", () => {
    const view = makeView({
      sections: SECTIONS,
      featured: makeItem({ id: "f", createdAt: "2025-02-02T09:00:00.000Z" }),
    });
    expect(firstPublishedISO(view)).toBe("2024-06-11T09:00:00.000Z");
  });

  it("returns null for a persona with no dated work", () => {
    expect(firstPublishedISO(makeView())).toBeNull();
  });
});

describe("latestPublishedISO and publishedYearRange", () => {
  it("picks the latest valid createdAt and prints the years as a range", () => {
    const view = makeView({ sections: SECTIONS });
    const latestISO = latestPublishedISO(view);
    expect(latestISO).toBe("2026-01-20T09:00:00.000Z");
    expect(
      publishedYearRange(firstPublishedISO(view) ?? "", latestISO ?? ""),
    ).toBe("2024–2026");
  });

  it("prints a single year when the work spans one year", () => {
    expect(
      publishedYearRange(
        "2025-03-02T12:00:00.000Z",
        "2025-11-02T12:00:00.000Z",
      ),
    ).toBe("2025");
  });
});

describe("PersonaColophon", () => {
  it("prints the page skin's copyright as a year range with no shield", async () => {
    const { container } = render(
      <TestProviders>
        <PersonaColophon
          persona={makeView({ kind: "poet", sections: SECTIONS })}
          isRightsShown
        />
      </TestProviders>,
    );

    expect(
      await screen.findByText("© 2024–2026. All rights reserved."),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("footer")).toHaveLength(1);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders nothing with neither a note nor dated work", () => {
    const { container } = render(
      <TestProviders>
        <PersonaColophon persona={makeView({ kind: "poet" })} isRightsShown />
      </TestProviders>,
    );

    expect(container.querySelector("footer")).toBeNull();
  });
});

describe("PersonaRightsFooter", () => {
  it("renders exactly one copyright notice for the whole persona", async () => {
    render(
      <TestProviders>
        <PersonaRightsFooter persona={makeView({ sections: SECTIONS })} />
      </TestProviders>,
    );

    expect(
      await screen.findByText("© 2024. All rights reserved."),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/All rights reserved/i)).toHaveLength(1);
  });

  it("renders nothing when the persona has no dated work", () => {
    const { container } = render(
      <TestProviders>
        <PersonaRightsFooter persona={makeView()} />
      </TestProviders>,
    );

    expect(container.querySelector("footer")).toBeNull();
  });
});
