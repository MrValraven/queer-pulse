import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ItemStateChip } from "./ItemStateChip";
import { SubprofileSections } from "./SubprofileSections";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "./api/subprofiles.adapters";
import { chapterPreviewAnchors } from "./usePreviewChapterFocus";
import { deriveSkinChapters } from "./derivedSkinChapters";

/**
 * A game master's campaigns and sessions on the page: a second starred item
 * stays in its own list (only the Spotlight's item leaves it), a full session
 * reads as a full table, and each Page blocks chapter names the page blocks
 * the docked preview scrolls to. Only `TestProviders` for the lazy
 * `subprofiles` catalog, so translated text comes via `findBy*`.
 */
const BASE_ITEM = {
  id: "",
  section: "campaigns",
  title: "",
  createdAt: "2025-12-01T18:30:00.000Z",
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
} satisfies SubprofileItemView;

const CAMPAIGN: SubprofileItemView = {
  ...BASE_ITEM,
  id: "campaign",
  title: "The Thornwood Debt",
  isFeatured: true,
};
const SESSION: SubprofileItemView = {
  ...BASE_ITEM,
  id: "session",
  section: "sessions",
  title: "One-shot night",
  date: "2099-10-17",
  isFeatured: true,
  gigState: "sold_out",
};

const PERSONA = {
  displayName: "Mesa do Dragão",
  kind: "game_master",
  accent: null,
  sections: [
    {
      section: "campaigns",
      labelKey: "subprofiles:section.campaigns",
      items: [CAMPAIGN],
    },
    {
      section: "sessions",
      labelKey: "subprofiles:section.sessions",
      items: [SESSION],
    },
  ],
} as unknown as PublicSubprofileView;

describe("SubprofileSections with a featured item", () => {
  it("drops only the Spotlight's item, keeping a second starred one", async () => {
    render(
      <TestProviders>
        <SubprofileSections
          persona={PERSONA}
          skin="quest"
          mode="preview"
          featuredId="campaign"
        />
      </TestProviders>,
    );

    expect(await screen.findByText("One-shot night")).toBeInTheDocument();
    expect(screen.queryByText("The Thornwood Debt")).toBeNull();
  });
});

describe("ItemStateChip on a session", () => {
  it("reads a sold-out session as a full table", async () => {
    render(
      <TestProviders>
        <ItemStateChip item={SESSION} />
      </TestProviders>,
    );

    expect(await screen.findByText("Table full")).toBeInTheDocument();
  });
});

describe("chapterPreviewAnchors", () => {
  it("points each game master chapter at its block on the page", () => {
    const anchors = deriveSkinChapters("game_master").map((chapter) => [
      chapter.key,
      chapterPreviewAnchors(chapter),
    ]);
    expect(anchors).toEqual([
      ["top", ["block:atTheTable"]],
      ["campaigns", ["section:campaigns"]],
      ["sessions", ["section:sessions"]],
      ["gallery", ["section:gallery"]],
    ]);
  });
});
