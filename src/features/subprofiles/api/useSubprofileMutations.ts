import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createSubprofile,
  deleteSubprofile,
  publishSubprofile,
  replaceSubprofileSection,
  unpublishSubprofile,
  updateSubprofile,
  type CreateSubprofileDTO,
  type SubprofileDTO,
  type SubprofileItemInputDTO,
  type SubprofileSection,
  type UpdateSubprofileDTO,
} from "./subprofiles.api";
import {
  mockMineSubprofiles,
  mockSubprofileById,
  validatePublishDemo,
} from "../data/subprofiles.data";
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
function demoCreatedDto(dto: CreateSubprofileDTO): SubprofileDTO {
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
    linkVisibility: "linked",
    visibility: "open",
    status: "draft",
    position: 0,
    items: [],
  };
}

/** Map the section-replace input back onto stored items (demo optimistic return). */
function applySection(
  dto: SubprofileDTO,
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
): SubprofileDTO {
  const others = dto.items.filter((i) => i.section !== section);
  const replaced = items.map((i) => ({
    section,
    title: i.title,
    subtitle: i.subtitle ?? null,
    description: i.description ?? null,
    url: i.url ?? null,
    imageUrl: i.imageUrl ?? null,
    date: i.date ?? null,
    meta: i.meta ?? null,
    tags: i.tags ?? [],
  }));
  return { ...dto, items: [...others, ...replaced] };
}

/**
 * All owner mutations for subprofiles. Each branches demo↔live: demo resolves
 * optimistically from the mock registry with no network; live calls the API.
 * Every success invalidates the owner list, single-subprofile, public, and
 * directory query keys so the affected surfaces refetch.
 */
export function useSubprofileMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    queryClient.invalidateQueries({ queryKey: ["subprofile"] });
  };

  const create = useMutation<SubprofileDTO, Error, CreateSubprofileDTO>({
    mutationFn: async (dto) =>
      demoMode ? demoCreatedDto(dto) : createSubprofile(dto),
    onSuccess: invalidateAll,
  });

  const update = useMutation<
    SubprofileDTO,
    Error,
    { id: string; dto: UpdateSubprofileDTO }
  >({
    mutationFn: async ({ id, dto }) => {
      if (!demoMode) return updateSubprofile(id, dto);
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return { ...current, ...dto };
    },
    onSuccess: invalidateAll,
  });

  const replaceSection = useMutation<
    SubprofileDTO,
    Error,
    { id: string; section: SubprofileSection; items: SubprofileItemInputDTO[] }
  >({
    mutationFn: async ({ id, section, items }) => {
      if (!demoMode) return replaceSubprofileSection(id, section, items);
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return applySection(current, section, items);
    },
    onSuccess: invalidateAll,
  });

  const publish = useMutation<SubprofileDTO, Error, string>({
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
    onSuccess: invalidateAll,
  });

  const unpublish = useMutation<SubprofileDTO, Error, string>({
    mutationFn: async (id) => {
      if (!demoMode) return unpublishSubprofile(id);
      const current = mockSubprofileById(id);
      if (!current) throw new Error("Subprofile not found");
      return {
        ...current,
        status: "draft",
        handle: current.linkVisibility === "unlinked" ? null : current.handle,
      };
    },
    onSuccess: invalidateAll,
  });

  const remove = useMutation<{ ok: true }, Error, string>({
    mutationFn: async (id) => (demoMode ? { ok: true } : deleteSubprofile(id)),
    onSuccess: invalidateAll,
  });

  return { create, update, replaceSection, publish, unpublish, remove };
}
