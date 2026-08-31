import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useHasStaffRole } from "../../auth/api/useMyStaffRoles";
import {
  getAuthorForMember,
  getMyAuthor,
  updateAdminAuthor,
  updateMyAuthor,
  type AuthorDTO,
  type UpdateAuthorDto,
} from "./magazine.api";

/**
 * CON-11 — the byline as an editable thing.
 *
 * Before this, a byline row was auto-created on publish by slugifying the
 * free-text byline (`bio: null`, `avatarUrl: null`) and there was no endpoint
 * anywhere to edit it, so every live author page showed a bare name and
 * nobody could fix it without a database console.
 *
 * Demo mode never calls any of this: the curated `AUTHORS` registry is the
 * demo's author content and has no backend to persist to.
 */

/** GET /magazine/authors/me — the caller's own byline, or `null`. Nullable,
 *  so it goes through `apiGetNullable` (see `magazine.api.ts`). */
export function useMyAuthor() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<AuthorDTO | null>({
    queryKey: ["magazine-my-author", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: async () => (demoMode ? null : await getMyAuthor()),
  });
  return query.data ?? null;
}

/** GET /magazine/authors/by-member/:slug — the byline behind a member, for
 *  the "Writing" surface on their profile. `null` for the many members who
 *  have never written. */
export function useMemberAuthor(memberSlug: string | undefined) {
  const { demoMode } = useDemoMode();
  const query = useQuery<AuthorDTO | null>({
    queryKey: ["magazine-member-author", demoMode, memberSlug],
    enabled: !demoMode && Boolean(memberSlug),
    queryFn: async () =>
      demoMode || !memberSlug ? null : await getAuthorForMember(memberSlug),
  });
  return {
    author: query.data ?? null,
    isLoading: query.isLoading && !demoMode && Boolean(memberSlug),
    // `null` is the ordinary answer here (most members have no byline), so a
    // caller needs this flag to tell that apart from a failed lookup.
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Whether the viewer may edit this byline, and which endpoint that goes
 * through. A `magazine_editor` edits any byline (name, bio, portrait) via the
 * admin route; the linked member edits their OWN bio and portrait via
 * `/authors/me`. The byline NAME stays staff-only, because it is what is
 * printed on already published pieces.
 */
export function useAuthorEditPermission(author: {
  slug: string;
  memberSlug?: string | null;
}) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const isStaffEditor = useHasStaffRole("magazine_editor");
  const isOwnByline =
    Boolean(author.memberSlug) && author.memberSlug === user?.profile.slug;
  return {
    // Demo has no backend to save to, so no editor is offered there.
    canEdit: !demoMode && (isStaffEditor || isOwnByline),
    canEditName: !demoMode && isStaffEditor,
    isStaffEditor: !demoMode && isStaffEditor,
    isOwnByline,
  };
}

/**
 * PATCH the byline. Staff go through `/magazine/admin/authors/:slug`; a
 * linked member editing their own goes through `/magazine/authors/me`.
 *
 * Send ONLY what changed: re-sending an unchanged portrait that somebody else
 * uploaded would trip the backend's foreign-upload check.
 */
export function useUpdateAuthor() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    AuthorDTO,
    Error,
    { slug: string; dto: UpdateAuthorDto; asStaff: boolean }
  >({
    // The editor toasts its own result on the mutateAsync call; silence the
    // global MutationCache handler's duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, dto, asStaff }) => {
      if (demoMode) throw new Error("Not available in demo mode");
      return asStaff
        ? await updateAdminAuthor(slug, dto)
        : await updateMyAuthor(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["magazine-author"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-authors-directory"],
      });
      void queryClient.invalidateQueries({ queryKey: ["magazine-my-author"] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-member-author"],
      });
    },
  });
}
