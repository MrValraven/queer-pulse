import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  MAILBOXES_QUERY_KEY_PREFIX,
  type MailboxSummary,
} from "../../../shared/api/mailboxViewer";
import {
  getMailboxAttribution,
  setMailboxStaffNames,
  setMyStaffNaming,
  type MailboxAttribution,
} from "./mailboxes.api";

export function mailboxAttributionQueryKey(
  identityId: string,
  demoMode: boolean,
) {
  return ["mailbox-attribution", identityId, demoMode] as const;
}

/** The switches as the mailbox list already carries them, so the settings
 *  render at once. Both read true until someone changes them. */
function attributionFromSummary(mailbox: MailboxSummary): MailboxAttribution {
  return {
    shouldShowStaffNames: mailbox.shouldShowStaffNames ?? true,
    shouldAllowMyName: mailbox.shouldAllowMyName ?? true,
    isOwner: mailbox.isOwner,
  };
}

function errorCodeOf(error: unknown): string | null {
  const data = (error as { data?: unknown } | null)?.data;
  if (data && typeof data === "object" && "code" in data) {
    const code = (data as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

type AttributionChange =
  | { field: "shouldShowStaffNames"; value: boolean }
  | { field: "shouldAllowMyName"; value: boolean };

function requestFor(identityId: string, change: AttributionChange) {
  return change.field === "shouldShowStaffNames"
    ? setMailboxStaffNames(identityId, change.value)
    : setMyStaffNaming(identityId, change.value);
}

function refreshMailboxes(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: MAILBOXES_QUERY_KEY_PREFIX });
}

/**
 * A business, persona or company mailbox's two attribution switches: the
 * owner's "show staff names" and the member's own opt-out. Each change is
 * optimistic. Live mode then writes it (the owner switch through the PATCH,
 * the member's own through the PUT), keeps the server's answer and refreshes
 * the mailbox list, whose copy of both switches the next open seeds from. A
 * refusal rolls back. Demo mode keeps every change in the cache and never
 * touches the network.
 *
 * Staff always see who replied inside their own mailbox, so a change here
 * needs no refetch of any thread: it changes what customers see.
 */
export function useMailboxAttribution(mailbox: MailboxSummary) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { identityId } = mailbox;
  const queryKey = mailboxAttributionQueryKey(identityId, demoMode);
  const seed = attributionFromSummary(mailbox);

  const query = useQuery<MailboxAttribution>({
    queryKey,
    queryFn: () =>
      demoMode ? Promise.resolve(seed) : getMailboxAttribution(identityId),
    placeholderData: demoMode ? undefined : seed,
    // Demo changes live in this cache alone, so it never goes stale or away.
    staleTime: demoMode ? Infinity : undefined,
    gcTime: demoMode ? Infinity : undefined,
    enabled: mailbox.kind !== "profile",
    retry: false,
  });

  const mutation = useMutation<
    MailboxAttribution | null,
    unknown,
    { change: AttributionChange; previous: MailboxAttribution }
  >({
    mutationFn: ({ change }) =>
      demoMode ? Promise.resolve(null) : requestFor(identityId, change),
    onSuccess: (response) => {
      if (response) {
        queryClient.setQueryData<MailboxAttribution>(queryKey, response);
        refreshMailboxes(queryClient);
      }
      showToast(t("messages:mailbox.settings.saved"), "success");
    },
    onError: (error, { previous }) => {
      queryClient.setQueryData<MailboxAttribution>(queryKey, previous);
      // A refusal means the member's standing changed (they lost the owner
      // seat or the mailbox itself): read both afresh.
      void queryClient.invalidateQueries({ queryKey });
      if (errorCodeOf(error) === "IDENTITY_NOT_STAFF") {
        refreshMailboxes(queryClient);
      }
      showToast(t("messages:mailbox.settings.error"), "error");
    },
  });

  // The switch moves the moment it is pressed; a read still in flight is
  // dropped so it cannot put the old value back.
  const change = (next: AttributionChange) => {
    void queryClient.cancelQueries({ queryKey });
    const previous =
      queryClient.getQueryData<MailboxAttribution>(queryKey) ?? seed;
    queryClient.setQueryData<MailboxAttribution>(queryKey, {
      ...previous,
      [next.field]: next.value,
    });
    mutation.mutate({ change: next, previous });
  };

  return {
    attribution: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    setShowStaffNames: (value: boolean) =>
      change({ field: "shouldShowStaffNames", value }),
    setAllowMyName: (value: boolean) =>
      change({ field: "shouldAllowMyName", value }),
    isSaving: mutation.isPending,
  };
}
