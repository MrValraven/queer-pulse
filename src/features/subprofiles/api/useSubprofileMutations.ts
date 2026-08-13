import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createSubprofile,
  deleteSubprofile,
  publishSubprofile,
  replaceAffiliations as replaceAffiliationsApi,
  replaceSocialLinks,
  replaceSubprofileSection,
  unpublishSubprofile,
  updateSubprofile,
  type AffiliationDTO,
  type AffiliationInputDTO,
  type CollaboratorDTO,
  type CreateSubprofileDTO,
  type SocialLinkDTO,
  type SubprofileDTO,
  type SubprofileItemInputDTO,
  type SubprofileSection,
  type UpdateSubprofileDTO,
} from "./subprofiles.api";
import { KIND_LABELS, defaultSlugForKind, slugify } from "../subprofile-kinds";

/** Thrown by the publish mutation when the completeness check fails. In demo mode
 *  it carries the locally-computed unmet codes; in live mode B3 reads the 422
 *  body. Codes are the exact C5 strings the PublishChecklist maps. */
export class PublishUnmetError extends Error {
  unmet: string[];
  constructor(unmet: string[]) {
    super("Subprofile is not ready to publish");
    this.name = "PublishUnmetError";
    this.unmet = unmet;
  }
}

/** Give a slug a `-2`, `-3`, … suffix until it no longer collides with `taken`. */
function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Build a fabricated draft DTO for a demo create (no network to assign an id).
 *  Mirrors the backend: the slug is derived server-side from the display name
 *  (falling back to the kind), so a persona can be created with nothing but a
 *  profession picked. Slug is de-duped against existing ones; a custom address
 *  is applied afterwards via the same PATCH the live path uses. */
function demoCreatedDto(
  dto: CreateSubprofileDTO,
  mockMineSubprofiles: () => SubprofileDTO[],
): SubprofileDTO {
  const displayName = dto.displayName?.trim() || KIND_LABELS[dto.kind];
  const base = slugify(displayName) || defaultSlugForKind(dto.kind);
  const taken = new Set(mockMineSubprofiles().map((sp) => sp.slug));
  return {
    id: `sp-demo-${Date.now()}`,
    kind: dto.kind,
    slug: uniqueSlug(base || "persona", taken),
    handle: null,
    displayName,
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [],
    linkVisibility: "linked",
    visibility: "open",
    status: "draft",
    position: 0,
    items: [],
    endorsementCount: 0,
    followerCount: 0,
    affiliations: [],
  };
}

/** Map the section-replace input back onto stored items (demo optimistic return).
 *  Persists `isFeatured` from the payload and mirrors the backend's single-
 *  spotlight rule: `links` items can never be featured, and when the incoming
 *  section carries a featured item, every OTHER section's items are cleared
 *  so at most one item across the whole persona stays featured. */
function applySection(
  dto: SubprofileDTO,
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
  resolveCollaboratorsDemo: (handles?: string[]) => CollaboratorDTO[],
): SubprofileDTO {
  const isLinksSection = section === "links";
  // Section replace has no per-item id continuity in this demo system (the
  // input DTO carries no id), so an edited item can't distinguish "unchanged"
  // from "new" here; every replaced item is stamped with "now" as its
  // first-published date, same limitation as the live backend's MSW mock.
  const replaceTimestamp = new Date().toISOString();
  const replacedItems = items.map((item) => ({
    // Same id-continuity limitation as `createdAt` above: a section replace
    // has no incoming id to preserve, so each replaced item gets a fresh
    // client-generated one, mirroring the real backend recreating item rows
    // (and therefore ids) on a full section replace.
    id: crypto.randomUUID(),
    section,
    createdAt: replaceTimestamp,
    title: item.title,
    subtitle: item.subtitle ?? null,
    description: item.description ?? null,
    url: item.url ?? null,
    imageUrl: item.imageUrl ?? null,
    date: item.date ?? null,
    meta: item.meta ?? null,
    tags: item.tags ?? [],
    isFeatured: isLinksSection ? false : (item.isFeatured ?? false),
    collaborators: resolveCollaboratorsDemo(item.collaborators),
  }));
  const incomingHasFeaturedItem = replacedItems.some(
    (item) => item.isFeatured,
  );
  const otherSectionItems = dto.items
    .filter((item) => item.section !== section)
    .map((item) =>
      incomingHasFeaturedItem ? { ...item, isFeatured: false } : item,
    );
  return { ...dto, items: [...otherSectionItems, ...replacedItems] };
}

/** Demo affiliations resolve: a fresh persona has no prior affiliations, so a
 *  copied entry falls back to its slug as the placeholder name (same rule as
 *  useAffiliations' demoResolveAffiliation for genuinely-new entries). */
function demoResolveCopiedAffiliation(item: AffiliationInputDTO): AffiliationDTO {
  return {
    targetType: item.targetType,
    targetSlug: item.targetSlug,
    role: item.role,
    name: item.targetSlug,
    imageUrl: null,
  };
}

/**
 * All owner mutations for subprofiles. Each branches demo↔live: demo resolves
 * optimistically from the mock registry with no network; live calls the API.
 * Every success invalidates the owner list (plural) + this persona's single
 * owner-editor query (id-scoped) + the public reads, so the affected surfaces
 * refetch without touching every unrelated persona query app-wide.
 */
export function useSubprofileMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // Narrow, id-scoped invalidation — NOT the bare `["subprofile"]` prefix,
  // which matches EVERY persona query app-wide (each list page's endorser
  // cluster, every open public page, etc.). We refresh: the owner
  // dashboard/list (`["subprofiles"]` plural — its own namespace), this
  // persona's single owner-editor query (`["subprofile", demoMode, id]`, the
  // key `useSubprofile` uses), and the public reads (`["subprofile","public"]`,
  // keyed by handle/slug + viewer so it can't be id-scoped, but still far
  // narrower than the whole singular prefix). Mirrors `useEndorsement`'s
  // precedent.
  const invalidateOwned = (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    if (id) {
      void queryClient.invalidateQueries({
        queryKey: ["subprofile", demoMode, id],
      });
    }
    void queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] });
  };

  const create = useMutation<SubprofileDTO, Error, CreateSubprofileDTO>({
    // NewSideModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (!demoMode) return createSubprofile(dto);
      const { mockMineSubprofiles } = await import("../data/subprofiles.data");
      return demoCreatedDto(dto, mockMineSubprofiles);
    },
    onSuccess: (data) => invalidateOwned(data.id),
  });

  const update = useMutation<
    SubprofileDTO,
    Error,
    { id: string; dto: UpdateSubprofileDTO }
  >({
    // useSubprofileMetaEditor / NewSideModal toast their own error, so
    // silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, dto }) => {
      if (!demoMode) return updateSubprofile(id, dto);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return { ...current, ...dto };
    },
    onSuccess: (_data, { id }) => invalidateOwned(id),
  });

  const replaceSection = useMutation<
    SubprofileDTO,
    Error,
    { id: string; section: SubprofileSection; items: SubprofileItemInputDTO[] }
  >({
    // SubprofileSectionEditor / NewSideModal toast their own error, so
    // silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, section, items }) => {
      if (!demoMode) return replaceSubprofileSection(id, section, items);
      const { mockSubprofileById, resolveCollaboratorsDemo } = await import(
        "../data/subprofiles.data"
      );
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return applySection(current, section, items, resolveCollaboratorsDemo);
    },
    onSuccess: (_data, { id }) => invalidateOwned(id),
  });

  const replaceSocials = useMutation<
    SubprofileDTO,
    Error,
    { id: string; items: SocialLinkDTO[] }
  >({
    // SubprofileSocialLinksEditor toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, items }) => {
      if (!demoMode) return replaceSocialLinks(id, items);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return { ...current, socialLinks: items };
    },
    onSuccess: (_data, { id }) => invalidateOwned(id),
  });

  const replaceAffiliations = useMutation<
    SubprofileDTO,
    Error,
    { id: string; items: AffiliationInputDTO[] }
  >({
    // SubprofileAffiliationsEditor / DuplicateMutations toast their own error,
    // so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, items }) => {
      if (!demoMode) return replaceAffiliationsApi(id, items);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return { ...current, affiliations: items.map(demoResolveCopiedAffiliation) };
    },
    onSuccess: (_data, { id }) => invalidateOwned(id),
  });

  const publish = useMutation<SubprofileDTO, Error, string>({
    // SubprofilePublishPanel toasts its own error (and handles PublishUnmetError
    // as a checklist), so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (!demoMode) {
        try {
          return await publishSubprofile(id);
        } catch (err) {
          // Live 422 carries `{ unmet: string[] }` in the ApiError body; re-throw
          // it as the same PublishUnmetError the demo path throws so B3's
          // PublishChecklist handles both modes identically.
          if (err instanceof ApiError && err.status === 422) {
            const unmet = (err.data as { unmet?: unknown } | undefined)?.unmet;
            if (Array.isArray(unmet)) {
              throw new PublishUnmetError(
                unmet.filter((u): u is string => typeof u === "string"),
              );
            }
          }
          throw err;
        }
      }
      const { mockSubprofileById, validatePublishDemo } = await import(
        "../data/subprofiles.data"
      );
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      const unmet = validatePublishDemo(current);
      if (unmet.length) throw new PublishUnmetError(unmet);
      return {
        ...current,
        status: "published",
        handle:
          current.linkVisibility === "unlinked"
            ? (current.handle ?? current.slug)
            : null,
      };
    },
    onSuccess: (_data, id) => invalidateOwned(id),
  });

  const unpublish = useMutation<SubprofileDTO, Error, string>({
    // SubprofilePublishPanel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (!demoMode) return unpublishSubprofile(id);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return {
        ...current,
        status: "draft",
        handle: current.linkVisibility === "unlinked" ? null : current.handle,
      };
    },
    onSuccess: (_data, id) => invalidateOwned(id),
  });

  const remove = useMutation<{ ok: true }, Error, string>({
    // MySubprofilesPage toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (id) => (demoMode ? { ok: true } : deleteSubprofile(id)),
    onSuccess: (_data, id) => invalidateOwned(id),
  });

  return {
    create,
    update,
    replaceSection,
    replaceSocials,
    replaceAffiliations,
    publish,
    unpublish,
    remove,
  };
}
