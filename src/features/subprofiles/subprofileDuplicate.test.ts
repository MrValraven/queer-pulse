import { describe, expect, it, vi } from "vitest";
import {
  applyDuplicatePlan,
  buildDuplicatePlan,
  duplicatePreview,
  type DuplicateMutations,
} from "./subprofileDuplicate";
import { subprofileToView } from "./api/subprofiles.adapters";
import type {
  SubprofileDTO,
  SubprofileItemDTO,
} from "./api/subprofiles.api";

/**
 * The persona-duplication planner is pure business logic — no providers. It
 * decides what a "full" vs "content-only" copy carries (identity + affiliations
 * only in full), reuses the editor's `itemsToInputDto` so featured/tags travel,
 * and drives a best-effort runner where any single mutation failure must never
 * strand the freshly-created draft. `applyDuplicatePlan` is verified with spy
 * mutations rather than a live backend.
 */

function makeItem(
  overrides: Partial<SubprofileItemDTO> & Pick<SubprofileItemDTO, "section" | "title">,
): SubprofileItemDTO {
  return {
    id: "item-test",
    createdAt: "2025-02-18T16:20:00.000Z",
    subtitle: null,
    description: null,
    url: null,
    imageUrl: null,
    date: null,
    meta: null,
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...overrides,
  };
}

/** A source view with two discography rows, an empty gigs section, one stray
 *  `links` item (no longer a produced section, so it is dropped), two social
 *  links and one affiliation — enough to exercise every branch. */
function makeSourceView() {
  const dto: SubprofileDTO = {
    id: "sp-source",
    kind: "musician",
    slug: "nightform",
    handle: "nightform",
    displayName: "NIGHTFORM",
    avatarUrl: "https://img.test/a.jpg",
    tagline: "After-hours electronics",
    bio: "Producer, DJ",
    coverUrl: null,
    accent: "violet",
    availability: "booking",
    ctaLabel: "Book a set",
    ctaUrl: "https://x.test/book",
    socialLinks: [
      { platform: "instagram", urlOrHandle: "@nightform" },
      { platform: "bandcamp", urlOrHandle: "nightform" },
    ],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    position: 0,
    items: [
      makeItem({ section: "discography", title: "Threshold EP", isFeatured: true }),
      makeItem({ section: "discography", title: "Static Bloom" }),
      makeItem({ section: "links", title: "Bandcamp", url: "https://x.test" }),
    ],
    affiliations: [
      {
        targetType: "event",
        targetSlug: "queer-karaoke-night",
        role: "performing",
        name: "Queer Karaoke Night",
        imageUrl: null,
      },
    ],
    endorsementCount: 3,
    followerCount: 41,
  };
  return subprofileToView(dto);
}

describe("buildDuplicatePlan", () => {
  it("copies identity + affiliations in full mode and drops empty sections", () => {
    const plan = buildDuplicatePlan(makeSourceView(), "full");
    expect(plan.kind).toBe("musician");
    expect(plan.meta).not.toBeNull();
    expect(plan.meta?.tagline).toBe("After-hours electronics");
    expect(plan.affiliations).toHaveLength(1);
    // The empty `gigs` section is filtered out; only discography remains
    // (`links` is no longer a produced section).
    expect(plan.sections.map((section) => section.section)).toEqual([
      "discography",
    ]);
    // Featured/tags travel via itemsToInputDto (2 discography rows preserved).
    const discography = plan.sections.find((s) => s.section === "discography");
    expect(discography?.items).toHaveLength(2);
    expect(discography?.items[0]?.isFeatured).toBe(true);
  });

  it("omits identity + affiliations in content mode, keeping items", () => {
    const plan = buildDuplicatePlan(makeSourceView(), "content");
    expect(plan.meta).toBeNull();
    expect(plan.affiliations).toBeNull();
    expect(plan.socialLinks).toHaveLength(2);
    expect(plan.sections.map((section) => section.section)).toEqual([
      "discography",
    ]);
  });

  it("copies the social-links array rather than aliasing the source's", () => {
    const source = makeSourceView();
    const plan = buildDuplicatePlan(source, "content");
    plan.socialLinks.push({ platform: "spotify", urlOrHandle: "x" });
    // Mutating the plan must not reach back into the source view model.
    expect(source.socialLinks).toHaveLength(2);
  });
});

describe("duplicatePreview", () => {
  it("counts affiliations + identity only in full mode", () => {
    const source = makeSourceView();
    expect(duplicatePreview(source, "full")).toEqual({
      linkCount: 2,
      itemCount: 2,
      affiliationCount: 1,
      includesIdentity: true,
    });
    expect(duplicatePreview(source, "content")).toEqual({
      linkCount: 2,
      itemCount: 2,
      affiliationCount: 0,
      includesIdentity: false,
    });
  });
});

describe("applyDuplicatePlan", () => {
  function makeMutations(): DuplicateMutations & {
    update: { mutateAsync: ReturnType<typeof vi.fn> };
    replaceSocials: { mutateAsync: ReturnType<typeof vi.fn> };
    replaceSection: { mutateAsync: ReturnType<typeof vi.fn> };
    replaceAffiliations: { mutateAsync: ReturnType<typeof vi.fn> };
  } {
    return {
      update: { mutateAsync: vi.fn().mockResolvedValue({}) },
      replaceSocials: { mutateAsync: vi.fn().mockResolvedValue({}) },
      replaceSection: { mutateAsync: vi.fn().mockResolvedValue({}) },
      replaceAffiliations: { mutateAsync: vi.fn().mockResolvedValue({}) },
    };
  }

  it("applies meta, socials, every section, and affiliations to the new draft", async () => {
    const plan = buildDuplicatePlan(makeSourceView(), "full");
    const mutations = makeMutations();

    await applyDuplicatePlan("new-id", plan, mutations);

    expect(mutations.update.mutateAsync).toHaveBeenCalledWith({
      id: "new-id",
      dto: plan.meta,
    });
    expect(mutations.replaceSocials.mutateAsync).toHaveBeenCalledWith({
      id: "new-id",
      items: plan.socialLinks,
    });
    // One call per non-empty section (discography only; `links` is no longer a
    // produced section).
    expect(mutations.replaceSection.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.replaceAffiliations.mutateAsync).toHaveBeenCalledWith({
      id: "new-id",
      items: plan.affiliations,
    });
  });

  it("is best-effort: a failed step never strands the rest of the copy", async () => {
    const plan = buildDuplicatePlan(makeSourceView(), "full");
    const mutations = makeMutations();
    mutations.update.mutateAsync.mockRejectedValueOnce(new Error("slug taken"));

    // Must resolve (not reject) despite the meta step throwing…
    await expect(
      applyDuplicatePlan("new-id", plan, mutations),
    ).resolves.toBeUndefined();
    // …and the later steps still run. One `replaceSection` call, matching the
    // plan's single non-empty section above.
    expect(mutations.replaceSocials.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.replaceSection.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.replaceAffiliations.mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("skips the meta + affiliations steps entirely for a content-only plan", async () => {
    const plan = buildDuplicatePlan(makeSourceView(), "content");
    const mutations = makeMutations();

    await applyDuplicatePlan("new-id", plan, mutations);

    expect(mutations.update.mutateAsync).not.toHaveBeenCalled();
    expect(mutations.replaceAffiliations.mutateAsync).not.toHaveBeenCalled();
    expect(mutations.replaceSocials.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.replaceSection.mutateAsync).toHaveBeenCalledTimes(1);
  });
});
