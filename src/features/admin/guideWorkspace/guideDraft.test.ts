import { describe, expect, it } from "vitest";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import {
  draftFromGuide,
  draftToCreateBody,
  draftToWriteBody,
  emptyGuideDraft,
  isDraftDirty,
  newDraftBlock,
  rekeyDraft,
} from "./guideDraft";

function makeGuide(
  overrides: Partial<AdminResourceGuideDTO> = {},
): AdminResourceGuideDTO {
  return {
    id: "guide-1",
    slug: "accessible-lisbon",
    category: "community",
    title: "Accessible Lisbon",
    titlePt: null,
    description: "Step-free routes.",
    descriptionPt: null,
    body: "",
    meta: "Guide · 1 min",
    externalUrl: null,
    routePath: "/resources/accessible-lisbon",
    sections: [
      {
        id: "routes",
        heading: "Routes",
        blocks: [
          { kind: "paragraph", text: "Tom & Jerry\nride line 28" },
          { kind: "subheading", text: "By tram" },
        ],
      },
    ],
    sectionsPt: null,
    lastVerifiedAt: null,
    lastReviewedOn: null,
    reviewedBy: null,
    reviewDueOn: null,
    publishedAt: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-10T14:02:03.456Z",
    ...overrides,
  };
}

describe("draftFromGuide", () => {
  it("turns a plain formatted block into escaped html", () => {
    const draft = draftFromGuide(makeGuide());
    expect(draft.sections[0]?.blocks[0]?.html).toBe(
      "Tom &amp; Jerry<br>ride line 28",
    );
    expect(draft.sections[0]?.blocks[1]?.html).toBe("");
    expect(draft.chipFormat).toBe("guide");
  });

  it("keeps html that is already there", () => {
    const draft = draftFromGuide(
      makeGuide({
        sections: [
          {
            id: "a",
            heading: "A",
            blocks: [
              {
                kind: "note",
                text: "Call 112",
                html: "Call <strong>112</strong>",
              },
            ],
          },
        ],
      }),
    );
    expect(draft.sections[0]?.blocks[0]?.html).toBe(
      "Call <strong>112</strong>",
    );
  });
});

describe("draftToWriteBody", () => {
  it("sends nothing for an untouched guide", () => {
    const guide = makeGuide();
    expect(
      draftToWriteBody(
        draftFromGuide(guide),
        draftFromGuide(guide),
        guide.meta,
      ),
    ).toEqual({});
  });

  it("treats sanitizer serialization differences as unchanged", () => {
    const guide = makeGuide({
      sections: [
        {
          id: "a",
          heading: "A",
          blocks: [
            {
              kind: "paragraph",
              text: "One two SNS",
              html: 'One<br />two <a href="https://sns.gov.pt" rel="noopener noreferrer" target="_blank">SNS</a>',
            },
          ],
        },
      ],
    });
    const clean = draftFromGuide(guide);
    const draft = draftFromGuide(guide);
    const block = draft.sections[0]?.blocks[0];
    if (block) block.html = 'One<br>two <a href="https://sns.gov.pt">SNS</a>';
    expect(isDraftDirty(draft, clean)).toBe(false);
  });

  it("sends only the field that changed", () => {
    const guide = makeGuide();
    const draft = {
      ...draftFromGuide(guide),
      title: "Accessible Lisbon, updated",
    };
    expect(draftToWriteBody(draft, draftFromGuide(guide), guide.meta)).toEqual({
      title: "Accessible Lisbon, updated",
    });
  });

  it("recomputes a stale chip when something else changes", () => {
    const guide = makeGuide({ meta: "Guide · 12 min" });
    const draft = { ...draftFromGuide(guide), title: "New title" };
    expect(draftToWriteBody(draft, draftFromGuide(guide), guide.meta)).toEqual({
      title: "New title",
      meta: "Guide · 1 min",
    });
  });

  it("leaves a chip it cannot parse untouched", () => {
    const guide = makeGuide({ meta: "Handbook" });
    const draft = { ...draftFromGuide(guide), title: "New title" };
    expect(draftToWriteBody(draft, draftFromGuide(guide), guide.meta)).toEqual({
      title: "New title",
    });
  });

  it("drops empty blocks from the sections it sends", () => {
    const guide = makeGuide();
    const draft = draftFromGuide(guide);
    draft.sections[0]?.blocks.push(newDraftBlock("paragraph"));
    draft.sections[0]?.blocks.push(newDraftBlock("note", "Hi", "Hi"));
    const body = draftToWriteBody(draft, draftFromGuide(guide), guide.meta);
    expect(body.sections?.[0]?.blocks).toHaveLength(3);
    expect(body.sections?.[0]?.blocks[2]).toEqual({
      kind: "note",
      text: "Hi",
      html: "Hi",
    });
  });
});

describe("draftToCreateBody", () => {
  it("omits empty optional fields", () => {
    const draft = {
      ...emptyGuideDraft(),
      slug: "new-guide",
      title: "New guide",
      description: "About it.",
      category: "health",
    };
    expect(draftToCreateBody(draft)).toEqual({
      slug: "new-guide",
      title: "New guide",
      description: "About it.",
      category: "health",
      meta: "Guide · 1 min",
      sections: [{ id: "section", heading: "", blocks: [] }],
    });
  });
});

describe("rekeyDraft", () => {
  it("gives every section and block a fresh key", () => {
    const draft = draftFromGuide(makeGuide());
    const rekeyed = rekeyDraft(draft);
    expect(rekeyed.sections[0]?.key).not.toBe(draft.sections[0]?.key);
    expect(rekeyed.sections[0]?.blocks[0]?.key).not.toBe(
      draft.sections[0]?.blocks[0]?.key,
    );
    expect(rekeyed.sections[0]?.blocks[0]?.html).toBe(
      draft.sections[0]?.blocks[0]?.html,
    );
  });
});
