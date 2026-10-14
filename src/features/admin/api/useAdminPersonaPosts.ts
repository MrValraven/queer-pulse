import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  getStaffPersonaPost,
  removeReportedPersonaPost,
  type AdminPersonaPostDTO,
} from "./adminPersonaPosts.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** The staff read's cache entry: the post, or null once it is gone (a 404
 *  on the read, or a removal from the drawer). */
export type StaffPersonaPostRead = AdminPersonaPostDTO | null;

const staffPostKey = (demoMode: boolean, postId: string) =>
  ["admin-persona-posts", "post", demoMode, postId] as const;

const isNotFound = (error: unknown) =>
  error instanceof ApiError && error.status === 404;

/** The demo personas' names and handles, written out so the admin chunk
 *  does not import the persona registry. */
const DEMO_PERSONAS: Record<string, { name: string; handle: string | null }> = {
  "demo-persona-mariana-sol": { name: "Mariana Sol", handle: null },
  "sp-diogo-nightform": { name: "NIGHTFORM", handle: "nightform" },
};

/** Demo reads the persona post fixture (dynamic import, so the admin chunk
 *  does not carry it); a report whose post is not in the fixture reads as
 *  gone. */
async function demoStaffPost(postId: string): Promise<StaffPersonaPostRead> {
  const { DEMO_PERSONA_POSTS } =
    await import("../../subprofiles/data/personaPosts.data");
  for (const [personaId, posts] of Object.entries(DEMO_PERSONA_POSTS)) {
    const post = posts.find((candidate) => candidate.id === postId);
    if (!post) continue;
    const persona = DEMO_PERSONAS[personaId] ?? { name: "", handle: null };
    return {
      id: post.id,
      body: post.body,
      linkUrl: post.linkUrl,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      editedAt: post.editedAt,
      persona: { id: personaId, ...persona },
    };
  }
  return null;
}

/** GET /admin/persona-posts/:id. A 404 resolves to null (the post is gone),
 *  so it reads as a state and never as a failure. `isSilent` keeps any other
 *  failure out of the global toast for a reader with its own fallback (the
 *  queue thumbnail). */
export function useStaffPersonaPost(
  postId: string,
  options: { isSilent?: boolean } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery({
    queryKey: staffPostKey(demoMode, postId),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    meta: options.isSilent ? { silentError: true } : undefined,
    queryFn: async (): Promise<StaffPersonaPostRead> => {
      if (demoMode) return demoStaffPost(postId);
      try {
        return await getStaffPersonaPost(postId);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
  });
}

/** "Remove update" on a `persona_post` report. Demo answers at once and takes
 *  the post out of the demo persona post store. The
 *  post's entry is set to null in place (both on success and on a 404 from
 *  a post already gone): the drawer and the queue thumbnail still observe
 *  it, and removing it would read the post again and answer a 404. The
 *  `reportId` ties the audit entry to the open report (the moderator still
 *  closes the report in the decision grid). Live, the queue and the report
 *  read again, so the row's thumbnail and the report's audit trail follow. */
export function useRemoveReportedPersonaPost() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // The persona's own Updates (the persona page and Studio) read again, so
  // the removed post leaves them too. The prefix is `personaPostKeys.posts`.
  const markGone = (postId: string) => {
    queryClient.setQueryData<StaffPersonaPostRead>(
      staffPostKey(demoMode, postId),
      null,
    );
    void queryClient.invalidateQueries({ queryKey: ["subprofile", "posts"] });
  };
  return useDemoAwareMutation<
    void,
    unknown,
    { postId: string; reason: string; reportId?: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-persona-posts", "remove"],
    demoResult: async ({ postId }) => {
      (
        await import("../../subprofiles/data/personaPostsDemo")
      ).demoRemovePersonaPostByStaff(postId);
    },
    live: ({ postId, reason, reportId }) =>
      removeReportedPersonaPost(postId, reason, reportId),
    onSuccess: (_result, { postId }) => markGone(postId),
    onError: (error, { postId }) => {
      if (isNotFound(error)) markGone(postId);
    },
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
      void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
    },
  });
}
