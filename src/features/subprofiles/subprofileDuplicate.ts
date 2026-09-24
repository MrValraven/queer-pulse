import {
  itemsToInputDto,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import type {
  AffiliationInputDTO,
  AffiliationOptionDTO,
  SocialLinkDTO,
  SubprofileItemInputDTO,
  SubprofileKind,
  SubprofileSection,
  UpdateSubprofileDTO,
} from "./api/subprofiles.api";

/** Full = identity + links + items + affiliations; content = links + items only. */
export type CopyMode = "full" | "content";

export interface DuplicatePlan {
  kind: SubprofileKind;
  /** Meta patch applied after create (full mode only); null skips the step. */
  meta: UpdateSubprofileDTO | null;
  socialLinks: SocialLinkDTO[];
  /** Only non-empty sections; each maps to one replaceSection call. */
  sections: Array<{
    section: SubprofileSection;
    items: SubprofileItemInputDTO[];
  }>;
  /** Affiliations to copy (full mode only); null skips the step. */
  affiliations: AffiliationInputDTO[] | null;
}

export interface DuplicatePreview {
  linkCount: number;
  itemCount: number;
  affiliationCount: number;
  includesIdentity: boolean;
}

/** Build the copy payloads from a source persona for the chosen mode.
 *  Section items reuse the editor's `itemsToInputDto` so featured/tags/
 *  collaborators all travel. Empty strings become nulls for the meta patch. */
export function buildDuplicatePlan(
  source: SubprofileView,
  mode: CopyMode,
): DuplicatePlan {
  const sections = source.sections
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      section: section.section,
      items: itemsToInputDto(section.items),
    }));
  // Copy the array (don't alias source.socialLinks) so a caller mutating
  // plan.socialLinks can never reach back into the source view model.
  const socialLinks = [...source.socialLinks];

  if (mode === "content") {
    return {
      kind: source.kind,
      meta: null,
      socialLinks,
      sections,
      affiliations: null,
    };
  }

  const meta: UpdateSubprofileDTO = {
    tagline: source.tagline || null,
    bio: source.bio || null,
    coverUrl: source.coverUrl,
    accent: source.accent,
    availability: source.availability,
    ctaLabel: source.ctaLabel || null,
    ctaUrl: source.ctaUrl || null,
    linkVisibility: source.linkVisibility,
    visibility: source.visibility,
  };
  const affiliations: AffiliationInputDTO[] = source.affiliations.map(
    (affiliation) => ({
      targetType: affiliation.targetType,
      targetSlug: affiliation.targetSlug,
      role: affiliation.role,
    }),
  );
  return { kind: source.kind, meta, socialLinks, sections, affiliations };
}

/** Counts driving the preview summary; affiliations/identity only in full mode. */
export function duplicatePreview(
  source: SubprofileView,
  mode: CopyMode,
): DuplicatePreview {
  const itemCount = source.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  return {
    linkCount: source.socialLinks.length,
    itemCount,
    affiliationCount: mode === "full" ? source.affiliations.length : 0,
    includesIdentity: mode === "full",
  };
}

/** Mutations subset the runner needs (from `useSubprofileMutations()`). */
export interface DuplicateMutations {
  update: {
    mutateAsync: (vars: {
      id: string;
      dto: UpdateSubprofileDTO;
    }) => Promise<unknown>;
  };
  replaceSocials: {
    mutateAsync: (vars: {
      id: string;
      items: SocialLinkDTO[];
    }) => Promise<unknown>;
  };
  replaceSection: {
    mutateAsync: (vars: {
      id: string;
      section: SubprofileSection;
      items: SubprofileItemInputDTO[];
    }) => Promise<unknown>;
  };
  replaceAffiliations: {
    mutateAsync: (vars: {
      id: string;
      items: AffiliationInputDTO[];
    }) => Promise<unknown>;
  };
  /** Live only: the targets the NEW draft may link
   *  (`GET /subprofiles/:id/affiliation-options`). Omitted in demo, where the
   *  replace accepts any target. */
  listAffiliationOptions?: (id: string) => Promise<AffiliationOptionDTO[]>;
}

/** What a copy could not carry over, so the caller can tell the owner. */
export interface DuplicateOutcome {
  /** Source links the copier can't make (a co-owner's community or event),
   *  left off before the save. Zero when the options couldn't load, since
   *  then every link is sent and the replace decides. */
  skippedAffiliationCount: number;
  /** True when the replace itself was rejected, so none of the links that
   *  were sent made it onto the copy. */
  hasAffiliationSaveFailed: boolean;
}

/** The source links the new draft may carry. The backend rejects the whole
 *  replace-all when the copier doesn't qualify for any one link (a co-owner's
 *  membership), so keep only targets in the draft's options. If the options
 *  can't load, try them all and let the replace decide. */
async function linkableAffiliations(
  createdId: string,
  affiliations: AffiliationInputDTO[],
  listAffiliationOptions: DuplicateMutations["listAffiliationOptions"],
): Promise<AffiliationInputDTO[]> {
  if (!listAffiliationOptions) return affiliations;
  let options: AffiliationOptionDTO[];
  try {
    options = await listAffiliationOptions(createdId);
  } catch {
    return affiliations;
  }
  return affiliations.filter((affiliation) =>
    options.some(
      (option) =>
        option.targetType === affiliation.targetType &&
        option.targetSlug === affiliation.targetSlug,
    ),
  );
}

/** Apply a plan to a freshly-created draft. Each step is best-effort: one
 *  failure (taken slug already handled by caller, a bad section, affiliations)
 *  never strands the draft; the owner lands in the editor and finishes there.
 *  Resolves with how many source links were skipped and whether the link
 *  save failed, so the caller can tell the owner which one happened. */
export async function applyDuplicatePlan(
  createdId: string,
  plan: DuplicatePlan,
  mutations: DuplicateMutations,
): Promise<DuplicateOutcome> {
  if (plan.meta) {
    try {
      await mutations.update.mutateAsync({ id: createdId, dto: plan.meta });
    } catch {
      /* meta stays default; editable in the editor */
    }
  }
  if (plan.socialLinks.length) {
    try {
      await mutations.replaceSocials.mutateAsync({
        id: createdId,
        items: plan.socialLinks,
      });
    } catch {
      /* links stay empty; editable in the editor */
    }
  }
  for (const { section, items } of plan.sections) {
    try {
      await mutations.replaceSection.mutateAsync({
        id: createdId,
        section,
        items,
      });
    } catch {
      /* that section stays empty; editable in the editor */
    }
  }
  if (!plan.affiliations || plan.affiliations.length === 0) {
    return { skippedAffiliationCount: 0, hasAffiliationSaveFailed: false };
  }
  const linkable = await linkableAffiliations(
    createdId,
    plan.affiliations,
    mutations.listAffiliationOptions,
  );
  const skippedAffiliationCount = plan.affiliations.length - linkable.length;
  if (linkable.length === 0) {
    return { skippedAffiliationCount, hasAffiliationSaveFailed: false };
  }
  try {
    await mutations.replaceAffiliations.mutateAsync({
      id: createdId,
      items: linkable,
    });
  } catch {
    /* affiliations stay empty; editable in the editor */
    return { skippedAffiliationCount, hasAffiliationSaveFailed: true };
  }
  return { skippedAffiliationCount, hasAffiliationSaveFailed: false };
}
