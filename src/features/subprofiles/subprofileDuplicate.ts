import {
  itemsToInputDto,
  type SubprofileItemView,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import { itemImageUrls } from "./skins/tattoo/tattooItemImages";
import { prepareTattooItemsForSave } from "./skins/tattoo/tattooSaveGraph";
import { isTattooBodyPhotoSection } from "./skins/tattoo/tattooVocab.data";
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
  /** Client photos the copy leaves on the source persona, since their
   *  consent is unconfirmed. Zero for every kind without body-photo sections. */
  leftOutBodyPhotoCount: number;
}

/** A tattoo body-photo item that holds an image without confirmed client
 *  consent. The copy starts with no stored photos, so the backend would
 *  refuse its whole section with CLIENT_CONSENT_REQUIRED: it stays behind. */
function isLeftOutBodyPhoto(
  section: SubprofileSection,
  item: SubprofileItemView,
): boolean {
  return (
    isTattooBodyPhotoSection(section) &&
    itemImageUrls(item).length > 0 &&
    item.structured?.photo?.hasClientConsent !== true
  );
}

/** Build the copy payloads from a source persona for the chosen mode.
 *  Section items reuse the editor's `itemsToInputDto` so featured/tags/
 *  collaborators all travel. Empty strings become nulls for the meta patch.
 *  Client photos without confirmed consent stay on the source persona.
 *  Flash day event links stay behind too: the copy's link status is picked
 *  in the create form, and an unlinked copy would have the whole flash_days
 *  section refused. Each entry keeps its own date and place. */
export function buildDuplicatePlan(
  source: SubprofileView,
  mode: CopyMode,
): DuplicatePlan {
  const sections = source.sections
    .map((section) => ({
      section: section.section,
      items: section.items.filter(
        (item) => !isLeftOutBodyPhoto(section.section, item),
      ),
    }))
    .filter((section) => section.items.length > 0)
    .map((section) => ({
      section: section.section,
      items: prepareTattooItemsForSave(
        section.section,
        itemsToInputDto(section.items),
        { isUnlinked: true },
      ),
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

/** Counts driving the preview summary; affiliations/identity only in full mode.
 *  `itemCount` is what the copy carries, so client photos left behind count
 *  in `leftOutBodyPhotoCount` alone. */
export function duplicatePreview(
  source: SubprofileView,
  mode: CopyMode,
): DuplicatePreview {
  const totalItemCount = source.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  const leftOutBodyPhotoCount = source.sections.reduce(
    (total, section) =>
      total +
      section.items.filter((item) => isLeftOutBodyPhoto(section.section, item))
        .length,
    0,
  );
  return {
    linkCount: source.socialLinks.length,
    itemCount: totalItemCount - leftOutBodyPhotoCount,
    affiliationCount: mode === "full" ? source.affiliations.length : 0,
    includesIdentity: mode === "full",
    leftOutBodyPhotoCount,
  };
}

/** Mutations subset the runner needs (from `useSubprofileMutations()`). */
export interface DuplicateMutations {
  update: {
    mutateAsync: (vars: {
      id: string;
      dto: UpdateSubprofileDTO;
    }) => Promise<{ id: string }>;
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

/** What a copy could not carry over, so the caller can tell the owner, and
 *  the id the copy ended under. */
export interface DuplicateOutcome {
  /** The draft's id once the copy is applied. Copying an unlinked persona
   *  unlinks the draft, which gives it a fresh id (ENG-447). */
  subprofileId: string;
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
 *  save failed, so the caller can tell the owner which one happened, and
 *  with the id the draft ended under, which the caller opens. */
export async function applyDuplicatePlan(
  createdId: string,
  plan: DuplicatePlan,
  mutations: DuplicateMutations,
): Promise<DuplicateOutcome> {
  // The draft every step writes to. Copying an unlinked persona unlinks the
  // draft in the meta step, which gives it a fresh id (ENG-447), so every
  // later step writes to the id that step answers with.
  let subprofileId = createdId;
  if (plan.meta) {
    try {
      const saved = await mutations.update.mutateAsync({
        id: subprofileId,
        dto: plan.meta,
      });
      subprofileId = saved.id;
    } catch {
      /* meta stays default; editable in the editor */
    }
  }
  if (plan.socialLinks.length) {
    try {
      await mutations.replaceSocials.mutateAsync({
        id: subprofileId,
        items: plan.socialLinks,
      });
    } catch {
      /* links stay empty; editable in the editor */
    }
  }
  for (const { section, items } of plan.sections) {
    try {
      await mutations.replaceSection.mutateAsync({
        id: subprofileId,
        section,
        items,
      });
    } catch {
      /* that section stays empty; editable in the editor */
    }
  }
  if (!plan.affiliations || plan.affiliations.length === 0) {
    return {
      subprofileId,
      skippedAffiliationCount: 0,
      hasAffiliationSaveFailed: false,
    };
  }
  const linkable = await linkableAffiliations(
    subprofileId,
    plan.affiliations,
    mutations.listAffiliationOptions,
  );
  const skippedAffiliationCount = plan.affiliations.length - linkable.length;
  if (linkable.length === 0) {
    return {
      subprofileId,
      skippedAffiliationCount,
      hasAffiliationSaveFailed: false,
    };
  }
  try {
    await mutations.replaceAffiliations.mutateAsync({
      id: subprofileId,
      items: linkable,
    });
  } catch {
    /* affiliations stay empty; editable in the editor */
    return {
      subprofileId,
      skippedAffiliationCount,
      hasAffiliationSaveFailed: true,
    };
  }
  return {
    subprofileId,
    skippedAffiliationCount,
    hasAffiliationSaveFailed: false,
  };
}
