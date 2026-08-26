import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  archiveAdminTopic,
  createAdminTopic,
  deleteAdminTopic,
  getAdminTopics,
  restoreAdminTopic,
  updateAdminTopic,
  type AdminTopicDTO,
  type CreateTopicBody,
  type UpdateTopicBody,
} from "./topicsAdmin.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const ADMIN_TOPICS_KEY = "admin-topics";

/** Every topic, archived ones included, for the directory console. Demo mode
 *  reads the colocated fixture and never touches the network. */
export function useAdminTopics() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminTopicDTO[]>({
    queryKey: [ADMIN_TOPICS_KEY, demoMode],
    queryFn: async () => {
      if (!demoMode) return getAdminTopics();
      const { DEMO_ADMIN_TOPICS } = await import("../TopicsAdmin.data");
      return DEMO_ADMIN_TOPICS;
    },
  });
}

/**
 * Both the admin list and the member-facing directory, so a topic created,
 * renamed or archived here shows up on `/topics` without a reload. The
 * member-facing keys belong to `features/topics` (`useTopics` keys on
 * `"topics"`, `useTopic` on `"topic-detail"`), and invalidating a key a
 * feature owns is how every other admin screen reconciles the surface it
 * edits.
 */
function useInvalidateTopics() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [ADMIN_TOPICS_KEY] });
    void queryClient.invalidateQueries({ queryKey: ["topics"] });
    void queryClient.invalidateQueries({ queryKey: ["topic-detail"] });
  };
}

export function useCreateTopic() {
  const { demoMode } = useDemoMode();
  const invalidateTopics = useInvalidateTopics();
  return useDemoAwareMutation<
    AdminTopicDTO | undefined,
    Error,
    CreateTopicBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // TopicsAdminForm toasts locally
    demoResult: () => undefined,
    live: (body) => createAdminTopic(body),
    onLiveSuccess: invalidateTopics,
  });
}

export interface UpdateTopicVars {
  id: string;
  body: UpdateTopicBody;
}

export function useUpdateTopic() {
  const { demoMode } = useDemoMode();
  const invalidateTopics = useInvalidateTopics();
  return useDemoAwareMutation<
    AdminTopicDTO | undefined,
    Error,
    UpdateTopicVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // TopicsAdminForm toasts locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateAdminTopic(id, body),
    onLiveSuccess: invalidateTopics,
  });
}

export interface SetTopicArchivedVars {
  id: string;
  isArchived: boolean;
}

/** Archive or restore, one hook: the console offers them as a single toggle
 *  per row and they reconcile the same caches. */
export function useSetTopicArchived() {
  const { demoMode } = useDemoMode();
  const invalidateTopics = useInvalidateTopics();
  return useDemoAwareMutation<
    AdminTopicDTO | undefined,
    Error,
    SetTopicArchivedVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // TopicsAdminPage toasts locally
    demoResult: () => undefined,
    live: ({ id, isArchived }) =>
      isArchived ? archiveAdminTopic(id) : restoreAdminTopic(id),
    onLiveSuccess: invalidateTopics,
  });
}

export function useDeleteTopic() {
  const { demoMode } = useDemoMode();
  const invalidateTopics = useInvalidateTopics();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // TopicsAdminPage toasts locally
    demoResult: () => undefined,
    live: (id) => deleteAdminTopic(id),
    onLiveSuccess: invalidateTopics,
  });
}
