import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "../studioErrors.data";
import type { StudioWelcomeUpdateDTO } from "./studio.types";
import {
  applyStudioWelcomeUpdate,
  DEFAULT_STUDIO_WELCOME_VIEW,
  toStudioWelcomeView,
  type StudioWelcomeView,
} from "./studioWelcome.adapters";
import { getStudioWelcome, putStudioWelcome } from "./studioWelcome.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** A failed read resolves the first-visit decision to "skip" and a failed
 *  write toasts through the save hook alone. */
const SILENT = { silentError: true } as const;
const LIVE_STALE_MS = 5 * 60_000;

export type StudioWelcomeReadState = "pending" | "ready" | "failed";

export interface StudioWelcomeAccount {
  /** The account's welcome, undefined until the first read lands. */
  view: StudioWelcomeView | undefined;
  /** "ready" also covers a read that has nothing to wait for (the demo, or a
   *  member without Studio access). "failed" means the first read failed. */
  readState: StudioWelcomeReadState;
  /** True when this member's welcome lives on the server (live mode with
   *  Studio access). The demo keeps it in device storage. */
  isAccountBacked: boolean;
}

/**
 * The account's Studio welcome (GET /me/studio-welcome). Runs only for a live
 * member with Studio access. Every reader shares the one cache entry, which
 * carries the member id.
 */
export function useStudioWelcomeAccount(): StudioWelcomeAccount {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { user } = useAuth();
  const memberId = user?.id ?? null;
  const isAccountBacked = !demoMode && hasAccess && memberId !== null;
  const query = useQuery({
    queryKey: studioKeys.welcome(memberId),
    enabled: isAccountBacked,
    staleTime: LIVE_STALE_MS,
    retry: false,
    meta: SILENT,
    queryFn: ({ client }) =>
      readStudio(client, async () =>
        toStudioWelcomeView(await getStudioWelcome()),
      ),
  });
  if (!isAccountBacked)
    return { view: undefined, readState: "ready", isAccountBacked };
  if (query.data !== undefined)
    return { view: query.data, readState: "ready", isAccountBacked };
  return {
    view: undefined,
    readState: query.isError ? "failed" : "pending",
    isAccountBacked,
  };
}

export interface SaveStudioWelcomeOptions {
  /** The one-time upload of an older device copy runs without a toast. */
  isSilent?: boolean;
}

/**
 * Saves the welcome to the account. Optimistic: the cache takes the update at
 * once, so the ordering and the first-visit decision see it, and a refusal
 * puts the previous view back, re-reads the stored one and (unless silent)
 * toasts the reason.
 */
export function useSaveStudioWelcome({
  isSilent = false,
}: SaveStudioWelcomeOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryKey = studioKeys.welcome(user?.id ?? null);
  return useMutation<
    StudioWelcomeView,
    Error,
    StudioWelcomeUpdateDTO,
    { previous: StudioWelcomeView | undefined }
  >({
    meta: SILENT,
    mutationFn: async (update) =>
      toStudioWelcomeView(await putStudioWelcome(update)),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<StudioWelcomeView>(queryKey);
      queryClient.setQueryData<StudioWelcomeView>(
        queryKey,
        applyStudioWelcomeUpdate(
          previous ?? DEFAULT_STUDIO_WELCOME_VIEW,
          update,
        ),
      );
      return { previous };
    },
    onError: (error, _update, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(queryKey, context.previous);
      void queryClient.invalidateQueries({ queryKey });
      if (isSilent) return;
      // Name the reason (offline, restricted, rate limit, server). Only a
      // failure with no nameable reason keeps the welcome-specific line.
      const messageKey = studioErrorMessageKeyOf(error, "save");
      showToast(
        t(
          messageKey === studioErrorMessageKey(null)
            ? "studio:firstRun.saveError"
            : messageKey,
        ),
        "error",
      );
    },
    onSuccess: (stored) => {
      queryClient.setQueryData(queryKey, stored);
    },
  });
}
