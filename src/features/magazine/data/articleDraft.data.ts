/**
 * Article-draft demo data — ported from the DesignSync prototype's
 * `MAG.ARTICLE` (`mag-write.jsx`). This is the block-based draft for the
 * SAME piece as `DEMO_RECORD` (`pieceRecord.data.ts`, id `"p1"`, "What we owe
 * old friends") — the byline/role/section chrome around the piece lives on
 * the piece record; this file only carries what `ArticleDraftDto` models
 * (the prose blocks + their editor metadata). Inline `<em>` in `title` is
 * kept verbatim (the design's "old friends" emphasis), matching how
 * `RichText` will mount it uncontrolled.
 *
 * `DEMO_ARTICLE_VERSIONS`/`DEMO_ARTICLE_VERSION_BLOCKS` (Phase 7 Wave E)
 * mirror the real backend shapes (`ArticleVersionSummaryDto`/
 * `ArticleVersionDetailDto`, `pieces.api.ts`) so `VersionsRail`/`VersionDiff`
 * never have to branch their rendering on demo vs. live — only
 * `useArticleVersions`/`useArticleVersion` branch.
 *
 * `DEMO_ARTICLE_COMMENTS` (Phase 7 Wave D) mirrors the real backend shape
 * (`ArticleCommentDto`, `pieces.api.ts`) so `NotesRail` never has to branch
 * its rendering on demo vs. live — only `useArticleComments` branches.
 */

import type {
  ArticleBlock,
  ArticleCommentDto,
  ArticleDraftDto,
  ArticleVersionDetailDto,
  ArticleVersionSummaryDto,
} from "../api/pieces.api";

const BLOCKS: ArticleBlock[] = [
  {
    id: "b1",
    kind: "paragraph",
    lead: true,
    html: "The form asked for an emergency contact and Teresa wrote a name she had not said aloud in four years. She thought about it for a second, then wrote the phone number too, from memory.",
  },
  {
    id: "b2",
    kind: "paragraph",
    html: "That is the thing about the friends you made when you were twenty-two and frightened: the number stays in your hands long after the friendship has gone quiet. You keep it the way you keep a spare key, not because you expect to use it, but because the alternative is admitting you have nowhere to go.",
  },
  {
    id: "b3",
    kind: "heading",
    html: "The group chat, twenty years on",
  },
  {
    id: "b4",
    kind: "paragraph",
    html: "They met at a Wednesday meeting in Anjos in 2003, six people who had each been told, in different words, to be less. What formed was not a friendship group so much as an infrastructure: someone to sit in the waiting room, someone to lie to the landlord, someone whose sofa was assumed.",
  },
  {
    id: "b5",
    kind: "pullQuote",
    html: "Nobody drafted a contract. But everyone knew who to call at three in the morning.",
  },
  {
    id: "b6",
    kind: "image",
    alt: "Six friends around a kitchen table in Anjos, mid-conversation",
    caption: "The Wednesday table, still set for six.",
    credit: "Pedro Salgado / QueerPulse",
    rights: "commissioned",
    tint: "coral",
    crop: "4:5",
    focal: { x: 0.5, y: 0.5 },
  },
  {
    id: "b7",
    kind: "quote",
    html: "We are each other’s ageing plan. That is not romantic, it is just arithmetic: none of us had children and most of us are not speaking to our brothers.",
    cite: "Teresa, 51",
  },
  {
    id: "b8",
    kind: "paragraph",
    html: "The arithmetic is getting harder. Two of the six now live outside Lisbon. One is in hospital more often than not. And the state, when it asks who is responsible for you, still has only one word for it, and the word is family.",
  },
  {
    id: "b9",
    kind: "stats",
    items: [
      {
        value: "61%",
        label:
          "of LGBTQ+ over-45s in Portugal name a friend, not a relative, as next of kin",
      },
      {
        value: "1 in 4",
        label: "have been refused hospital visiting rights at least once",
      },
    ],
  },
  {
    id: "b10",
    kind: "paragraph",
    html: "What follows is not a policy argument. It is six people at a kitchen table, working out what they owe each other, out loud, for the first time.",
  },
];

export const DEMO_ARTICLE: ArticleDraftDto = {
  id: "art-p1",
  slug: "what-we-owe-old-friends",
  title: "What we owe <em>old friends</em>",
  standfirst:
    "Twenty years after the group chat began, six people in Lisbon are still working out what it means to be someone’s emergency contact.",
  kicker: "Cover · Issue 14",
  section: "Cover",
  role: "",
  metaDescription: "",
  // Demo pieces carry no lead art: the desk mock exists to exercise the
  // editor, and inventing a photograph here would put art on a demo article
  // that nobody chose.
  heroImageUrl: null,
  socialImage: "",
  canonicalUrl: "",
  tags: ["Chosen family", "Ageing", "Lisbon"],
  contentNotes: [],
  blocks: BLOCKS,
  readMinutes: 2,
  publishedAt: null,
  // ENG-111. Demo has no server to move the row on, so the version never
  // advances and no demo save can ever conflict. It is present because the
  // live DTO carries it, keeping the fixture the same shape as a real read.
  version: 1,
};

export const DEMO_ARTICLE_VERSIONS: ArticleVersionSummaryDto[] = [
  {
    id: "ver-2",
    label: "Sent to sensitivity read",
    author: "Sara",
    createdAt: "2026-08-09T18:40:00.000Z",
  },
  {
    id: "ver-1",
    label: "Author draft",
    author: "Sara Pinheiro",
    createdAt: "2026-08-07T22:03:00.000Z",
  },
];

/** The block snapshot each `DEMO_ARTICLE_VERSIONS` row held at the time —
 *  deliberately different from `BLOCKS`/`DEMO_ARTICLE` above so
 *  `VersionDiff` has real added/removed/changed rows to render, not just
 *  "unchanged" ones. */
const DEMO_VERSION_BLOCKS: Record<string, ArticleBlock[]> = {
  "ver-2": [
    BLOCKS[0]!,
    BLOCKS[1]!,
    BLOCKS[2]!,
    BLOCKS[3]!,
    {
      id: "b5",
      kind: "pullQuote",
      html: "Nobody drafted a contract. But everyone knew who to call at three in the morning. Teresa said so, more than once.",
    },
    BLOCKS[5]!,
    BLOCKS[6]!,
    BLOCKS[7]!,
    {
      id: "b-sens-note",
      kind: "paragraph",
      html: "[Sensitivity read note: confirm Rui is comfortable being named before this runs.]",
    },
  ],
  "ver-1": [
    BLOCKS[0]!,
    {
      id: "b2",
      kind: "paragraph",
      html: "That is the thing about old friends: the number stays in your phone long after the friendship has gone quiet.",
    },
    {
      id: "b3",
      kind: "heading",
      html: "The group chat",
    },
  ],
};

export const DEMO_ARTICLE_VERSION_DETAILS: Record<
  string,
  ArticleVersionDetailDto
> = Object.fromEntries(
  DEMO_ARTICLE_VERSIONS.map((summary) => [
    summary.id,
    { ...summary, blocks: DEMO_VERSION_BLOCKS[summary.id] ?? [] },
  ]),
);

export const DEMO_ARTICLE_COMMENTS: ArticleCommentDto[] = [
  {
    id: "c2",
    blockId: "b9",
    parentId: null,
    author: "Ana (fact-check)",
    body: "Second stat is from the 2024 ILGA survey. Need the sample size in the source line before this ships.",
    resolved: false,
    createdAt: "2026-08-09T09:40:00.000Z",
    replies: [],
  },
  {
    id: "c1",
    blockId: "b5",
    parentId: null,
    author: "Sara",
    body: "Can we attribute this pull quote? It reads like Teresa but it is actually Rui.",
    resolved: true,
    createdAt: "2026-08-08T11:20:00.000Z",
    replies: [
      {
        id: "c1-r1",
        blockId: null,
        parentId: "c1",
        author: "Marta",
        body: "Fixed: swapped the attribution to Rui and double-checked with them directly.",
        resolved: false,
        createdAt: "2026-08-08T11:42:00.000Z",
        replies: [],
      },
    ],
  },
];
