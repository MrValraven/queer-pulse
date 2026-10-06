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
import { subprofileToView } from "./subprofiles.adapters";
import { subprofileQueryKey } from "./useSubprofile";
import { linkedPersonaHandleCandidate } from "../personaHandle";
import { currentUserSlug } from "../../members/data/demoCurrentUser";

/** Mirrors the backend's draft-handle rule: a LINKED persona that is not
 *  published and holds no handle gets `<creatorSlug>-<personaSlug>` stored on
 *  its row as soon as it is saved (no registry claim until publish), so its
 *  address is `/p/<handle>` from the start. Every other persona keeps the
 *  handle it has. `creatorSlug` is `undefined` when the demo registry has no
 *  row for this id, which leaves the handle untouched. */
function withDerivedDraftHandle(
  subprofile: SubprofileDTO,
  creatorSlug: string | undefined,
): SubprofileDTO {
  const isHandlelessLinkedDraft =
    subprofile.linkVisibility === "linked" &&
    subprofile.status !== "published" &&
    !subprofile.handle;
  if (!isHandlelessLinkedDraft || !creatorSlug) return subprofile;
  return {
    ...subprofile,
    handle: linkedPersonaHandleCandidate(creatorSlug, subprofile.slug),
  };
}

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
 *  is applied afterwards via the same PATCH the live path uses. A new persona
 *  starts linked, so it carries its derived handle from the first response,
 *  with the demo viewer as its creator. */
function demoCreatedDto(
  dto: CreateSubprofileDTO,
  mockMineSubprofiles: () => SubprofileDTO[],
): SubprofileDTO {
  const displayName = dto.displayName?.trim() || KIND_LABELS[dto.kind];
  const base = slugify(displayName) || defaultSlugForKind(dto.kind);
  const taken = new Set(mockMineSubprofiles().map((sp) => sp.slug));
  const slug = uniqueSlug(base || "persona", taken);
  return {
    id: `sp-demo-${Date.now()}`,
    kind: dto.kind,
    slug,
    handle: linkedPersonaHandleCandidate(currentUserSlug, slug),
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
  const incomingHasFeaturedItem = replacedItems.some((item) => item.isFeatured);
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
function demoResolveCopiedAffiliation(
  item: AffiliationInputDTO,
): AffiliationDTO {
  return {
    targetType: item.targetType,
    targetSlug: item.targetSlug,
    role: item.role,
    name: item.targetSlug,
    imageUrl: null,
  };
}

// ── Demo write paths ───────────────────────────────────────────────────────
// Each owner write's demo branch, kept out of the hook so the hook stays a
// thin demo/live switch. They resolve from the mock registry with no network.
// Every persona-content write (PATCH, section, social links, affiliations)
// answers with a raised `editVersion`, as the server does (ENG-451), so the
// editor's save chain never reads a demo save as a conflict.

/** The demo registry, loaded on first use so it stays out of live bundles. */
const loadDemoStore = () => import("../data/subprofiles.data");

/** The owner view of a demo persona, or a throw when the viewer has none. */
async function demoOwnedSubprofile(id: string): Promise<SubprofileDTO> {
  const { mockSubprofileById } = await loadDemoStore();
  const current = mockSubprofileById(id);
  if (!current) throw new Error("Subprofile not found");
  return current;
}

/** The creator's profile slug off the demo fixture: the owner-full DTO never
 *  carries it (mirrors the MSW publish handler). */
async function demoCreatorSlug(id: string): Promise<string | undefined> {
  const { DEMO_SUBPROFILES } = await loadDemoStore();
  return DEMO_SUBPROFILES.find((subprofile) => subprofile.id === id)?.ownerSlug;
}

async function demoUpdate(
  id: string,
  dto: UpdateSubprofileDTO,
): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  const { mockBumpEditVersion } = await loadDemoStore();
  // The precondition is request-only; it never lands on the persona.
  const changes: UpdateSubprofileDTO = { ...dto };
  delete changes.expectedEditVersion;
  // A save that leaves a linked draft with no handle (a switch to linked, a
  // cleared handle field) gets the derived default, as on the server.
  return withDerivedDraftHandle(
    { ...current, ...changes, editVersion: mockBumpEditVersion(id) },
    await demoCreatorSlug(id),
  );
}

async function demoReplaceSection(
  id: string,
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  const { mockBumpEditVersion, resolveCollaboratorsDemo } =
    await loadDemoStore();
  return {
    ...applySection(current, section, items, resolveCollaboratorsDemo),
    editVersion: mockBumpEditVersion(id),
  };
}

async function demoReplaceSocials(
  id: string,
  items: SocialLinkDTO[],
): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  const { mockBumpEditVersion } = await loadDemoStore();
  return {
    ...current,
    socialLinks: items,
    editVersion: mockBumpEditVersion(id),
  };
}

async function demoReplaceAffiliations(
  id: string,
  items: AffiliationInputDTO[],
): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  const { mockBumpEditVersion } = await loadDemoStore();
  return {
    ...current,
    affiliations: items.map(demoResolveCopiedAffiliation),
    editVersion: mockBumpEditVersion(id),
  };
}

/** Live publish. The 422 carries `{ unmet: string[] }` in the ApiError body;
 *  re-throw it as the same PublishUnmetError the demo path throws so B3's
 *  PublishChecklist handles both modes identically. */
async function livePublish(id: string): Promise<SubprofileDTO> {
  try {
    return await publishSubprofile(id);
  } catch (err) {
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

async function demoPublish(id: string): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  const { validatePublishDemo } = await loadDemoStore();
  const unmet = validatePublishDemo(current);
  if (unmet.length) throw new PublishUnmetError(unmet);
  // A linked persona's default handle needs its CREATOR's profile slug.
  const ownerSlug = await demoCreatorSlug(id);
  return {
    ...current,
    status: "published",
    handle:
      current.handle ??
      (current.linkVisibility === "linked" && ownerSlug
        ? linkedPersonaHandleCandidate(ownerSlug, current.slug)
        : current.slug),
  };
}

async function demoUnpublish(id: string): Promise<SubprofileDTO> {
  const current = await demoOwnedSubprofile(id);
  // A linked persona keeps its handle as a draft, so its address stays
  // `/p/<handle>`; an unlinked one gives its handle back (mirrors the
  // backend).
  return {
    ...current,
    status: "draft",
    handle: current.linkVisibility === "linked" ? current.handle : null,
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
        queryKey: subprofileQueryKey(demoMode, id),
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
    mutationFn: ({ id, dto }) =>
      demoMode ? demoUpdate(id, dto) : updateSubprofile(id, dto),
    onSuccess: (data, { id }) => {
      // The PATCH answers with the whole owner view (the same shape GET
      // returns), so write it straight into this persona's owner-editor
      // query. An editor mounted later (the owner moving from the page's
      // capacity switch to the editor, say) then seeds from the saved
      // `skinData` instead of a stale cached copy, and its next save
      // cannot write the old values back. The editor seeds its drafts once
      // on mount, so an open editor only sees a fresher `subprofile` here,
      // as it already does after the refetch below.
      const savedView = subprofileToView(data);
      queryClient.setQueryData(
        subprofileQueryKey(demoMode, data.id),
        savedView,
      );
      // ENG-447: an unlink answers under a fresh id, and the old one now
      // answers 404. The open editor reads its persona under the id in its
      // route until it moves to the new address
      // (`usePersonaRekeyRedirect`), so that entry carries the saved persona
      // too and is never refetched.
      if (data.id !== id) {
        queryClient.setQueryData(subprofileQueryKey(demoMode, id), savedView);
      }
      invalidateOwned(data.id);
    },
  });

  const replaceSection = useMutation<
    SubprofileDTO,
    Error,
    {
      id: string;
      section: SubprofileSection;
      items: SubprofileItemInputDTO[];
      expectedEditVersion?: number;
    }
  >({
    // SubprofileSectionEditor / NewSideModal toast their own error, so
    // silence the global duplicate.
    meta: { silentError: true },
    mutationFn: ({ id, section, items, expectedEditVersion }) =>
      demoMode
        ? demoReplaceSection(id, section, items)
        : replaceSubprofileSection(id, section, items, expectedEditVersion),
    // The response is the whole owner view (same shape as `update`'s), so
    // seed the owner-editor query with it before invalidating. A copy flow's
    // editor can mount from this cache before the refetch below lands; without
    // this write it would seed its `editVersion` from a stale pre-write read
    // and conflict on its own first save (I2).
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(
        subprofileQueryKey(demoMode, id),
        subprofileToView(data),
      );
      invalidateOwned(id);
    },
  });

  const replaceSocials = useMutation<
    SubprofileDTO,
    Error,
    { id: string; items: SocialLinkDTO[]; expectedEditVersion?: number }
  >({
    // SubprofileSocialLinksEditor toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: ({ id, items, expectedEditVersion }) =>
      demoMode
        ? demoReplaceSocials(id, items)
        : replaceSocialLinks(id, items, expectedEditVersion),
    // Same owner-view seed as replaceSection's onSuccess above (I2).
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(
        subprofileQueryKey(demoMode, id),
        subprofileToView(data),
      );
      invalidateOwned(id);
    },
  });

  const replaceAffiliations = useMutation<
    SubprofileDTO,
    Error,
    { id: string; items: AffiliationInputDTO[] }
  >({
    // SubprofileAffiliationsEditor / DuplicateMutations toast their own error,
    // so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: ({ id, items }) =>
      demoMode
        ? demoReplaceAffiliations(id, items)
        : replaceAffiliationsApi(id, items),
    // Same owner-view seed as replaceSection's onSuccess above (I2).
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(
        subprofileQueryKey(demoMode, id),
        subprofileToView(data),
      );
      invalidateOwned(id);
    },
  });

  const publish = useMutation<SubprofileDTO, Error, string>({
    // SubprofilePublishPanel toasts its own error (and handles PublishUnmetError
    // as a checklist), so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: (id) => (demoMode ? demoPublish(id) : livePublish(id)),
    onSuccess: (_data, id) => invalidateOwned(id),
  });

  const unpublish = useMutation<SubprofileDTO, Error, string>({
    // SubprofilePublishPanel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: (id) =>
      demoMode ? demoUnpublish(id) : unpublishSubprofile(id),
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
