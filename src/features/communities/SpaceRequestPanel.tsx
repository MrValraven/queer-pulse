import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiAlertTriangle, FiLayers } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  spaceRequestPrefix,
  useCreateSpaceRequest,
  useLatestSpaceRequest,
  useWithdrawSpaceRequest,
} from "./api/useSpaceRequest";
import { isCoOwnerRole, isOwnerRole } from "./communityStaffRole";
import { errorCodeOf } from "./spaceRequestError";
import { SpaceRequestNoteForm } from "./SpaceRequestNoteForm";
import { SpaceRequestStatus } from "./SpaceRequestStatus";
import type { CommunityRole } from "./membership.types";
import styles from "./SpaceRequestPanel.module.css";

/** Spaces pane before platform staff switch spaces on: explains what spaces
 *  are and lets the owner or a co-owner ask for them; mods see the status
 *  only. */
export function SpaceRequestPanel({
  slug,
  viewerRole,
}: {
  slug: string;
  viewerRole: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const canAsk = isOwnerRole(viewerRole) || isCoOwnerRole(viewerRole);
  const {
    data: request,
    isLoading,
    isError,
    refetch,
  } = useLatestSpaceRequest(slug, true);
  const create = useCreateSpaceRequest(slug);
  const withdraw = useWithdrawSpaceRequest(slug);
  const [note, setNote] = useState("");
  const isOpen = request?.status === "open";

  // `approved` is only trusted until the one-shot community refetch below
  // settles: `updateSettings` lets platform staff switch spaces back off
  // again, which leaves the last request `approved` with nothing to refresh
  // it. Without this, the pane would read "Spaces are on. Refreshing..."
  // forever with no form, even once spaces are really off again. Once the
  // refresh for THIS request settles, `hasSettledApprovalRefresh` flips true
  // and `isApproved` follows: if spaces are really on, `ModToolsSpaces`
  // unmounts this pane before that happens; if they are off, the pane falls
  // through to the no-open-request state below and offers the form again.
  const [settledApprovalRequestId, setSettledApprovalRequestId] = useState<
    string | null
  >(null);
  const hasSettledApprovalRefresh = request?.id === settledApprovalRequestId;
  const isApproved =
    request?.status === "approved" && !hasSettledApprovalRefresh;

  useEffect(() => {
    if (request?.status !== "approved" || hasSettledApprovalRefresh) return;
    const requestId = request.id;
    void queryClient
      .invalidateQueries({ queryKey: ["community", slug] })
      .then(() => setSettledApprovalRequestId(requestId));
  }, [
    request?.status,
    request?.id,
    hasSettledApprovalRefresh,
    queryClient,
    slug,
  ]);

  // Submitting unmounts the "Request spaces" button, which held focus, and
  // withdrawing unmounts the Withdraw button; both would otherwise drop
  // keyboard/screen-reader focus to `<body>`. Mirrors the restoration
  // `ModToolsSpaces` already does for the same reason.
  const statusTextRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (isOpen) statusTextRef.current?.focus();
  }, [isOpen]);

  const noteFieldRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusNoteAfterWithdrawRef = useRef(false);
  const isFormShown = !isOpen && !isApproved && canAsk;
  useEffect(() => {
    if (!isFormShown || !shouldFocusNoteAfterWithdrawRef.current) return;
    shouldFocusNoteAfterWithdrawRef.current = false;
    noteFieldRef.current?.focus();
  }, [isFormShown]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedNote = note.trim();
    create.mutate(trimmedNote ? { note: trimmedNote } : {}, {
      onSuccess: () => {
        setNote("");
        showToast(t("communities:spaces.request.sent"), "success");
      },
      onError: (error) => {
        const code = errorCodeOf(error);
        if (code === "SPACE_REQUEST_ALREADY_OPEN") {
          showToast(t("communities:spaces.request.alreadyOpen"), "success");
          void refetch();
          return;
        }
        if (code === "SPACES_ALREADY_ALLOWED") {
          showToast(t("communities:spaces.request.alreadyAllowed"), "success");
          void queryClient.invalidateQueries({ queryKey: ["community", slug] });
          void queryClient.invalidateQueries({
            queryKey: spaceRequestPrefix(slug),
          });
          return;
        }
        showToast(t("communities:spaces.request.error"), "error");
      },
    });
  };
  const onWithdraw = () => {
    withdraw.mutate(undefined, {
      onSuccess: () => {
        shouldFocusNoteAfterWithdrawRef.current = true;
        showToast(t("communities:spaces.request.withdrawn"), "success");
      },
      onError: () =>
        showToast(t("communities:spaces.request.withdrawError"), "error"),
    });
  };

  if (isLoading) {
    return (
      <div aria-busy="true">
        <SkeletonLine height={14} style={{ marginBottom: 10 }} />
        <SkeletonLine height={14} width="70%" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        compact
        icon={<FiAlertTriangle />}
        title={t("communities:spaces.request.loadError")}
        action={{
          label: t("communities:spaces.request.retry"),
          onClick: () => void refetch(),
        }}
      />
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <FiLayers aria-hidden="true" className={styles.icon} />
        <h3 className={styles.title}>
          {t("communities:spaces.request.offTitle")}
        </h3>
      </div>
      <p className={styles.intro}>{t("communities:spaces.request.intro")}</p>

      <SpaceRequestStatus
        ref={statusTextRef}
        request={request ?? null}
        isApproved={isApproved}
        canAsk={canAsk}
        onWithdraw={onWithdraw}
        isWithdrawPending={withdraw.isPending}
        fmt={fmt}
      />

      {isFormShown && (
        <SpaceRequestNoteForm
          ref={noteFieldRef}
          note={note}
          onNoteChange={setNote}
          onSubmit={onSubmit}
          isPending={create.isPending}
        />
      )}

      {!canAsk && !isApproved && (
        <p className={styles.hint}>
          {t("communities:spaces.request.staffOnly")}
        </p>
      )}
    </section>
  );
}
