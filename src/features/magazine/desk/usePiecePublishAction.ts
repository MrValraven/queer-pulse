/**
 * The piece record's real publish/unpublish action (PRD-119 / PRD-120),
 * replacing the toast stub `PieceRecordPage` used to call.
 *
 * Everything about the action lives here so the page stays a layout: the
 * confirm-dialog state, the local care gate, the server's own refusal, the
 * toasts, and the formatted "live since"/"scheduled for" instant. The page and
 * the rail's `PublishGateCard` both render off the one returned object, which
 * is what keeps the header button and the gate card from ever disagreeing.
 */

import { useMemo, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { intlLocale } from "../../../shared/i18n/locale";
import { formatDate } from "../../../shared/lib/date";
import {
  CARE_GATE_OPEN_CODE,
  readPublishRefusal,
  type PublishPieceDto,
  type PublishRefusalDto,
} from "../api/piecePublish.api";
import type { PieceRecordWithPublish } from "../api/usePieceRecord";
import { hasPublishDate, isPieceScheduled } from "./pieceSchedule";
import type { PiecePublishIntent } from "./deskModals.data";

/** A published instant is rendered to the minute: "scheduled for 9 September
 *  2026, 09:00" has to be unambiguous, and a bare date would hide the 09:00
 *  an issue ship schedules pieces at. */
const PUBLISHED_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

type PublishMutation = UseMutationResult<unknown, Error, PublishPieceDto>;
type UnpublishMutation = UseMutationResult<unknown, Error, void>;

export interface UsePiecePublishActionParams {
  /** `undefined` while the record is still loading or missing. The hook has to
   *  tolerate that: `PieceRecordPage` calls it above its own early returns,
   *  because hooks cannot run conditionally. */
  record: PieceRecordWithPublish | undefined;
  publish: PublishMutation;
  unpublish: UnpublishMutation;
}

export interface PiecePublishAction {
  /** Live to readers right now. A scheduled piece is NOT this. */
  isPublished: boolean;
  /** Has a `publishedAt` the clock has not reached yet. */
  isScheduled: boolean;
  /** A past `publishedAt` on a piece whose own stage has not caught up to
   *  Published yet: with no job to flip it, a Ready piece's date can pass
   *  while it still sits at Ready. Live to readers already, so the publish
   *  confirm needs its own copy here for settling it. */
  isAlreadyLive: boolean;
  /** The publish instant, formatted the way the rest of the desk formats
   *  dates, or `null` when the piece is still a draft. Never a raw ISO string. */
  publishedAtLabel: string | null;
  /** Reader-facing path for the live piece, or `null` when nothing is live. */
  publicHref: string | null;
  /** Labels of the care items still open, from the record the client holds. */
  openGateItems: string[];
  hasOpenGateItems: boolean;
  /** The server's own refusal from the last attempt, once it has answered.
   *  Rendered item by item: the local gate can be out of date. */
  refusal: PublishRefusalDto | null;
  /** Which confirm dialog is open, or `null` for none. */
  confirmIntent: PiecePublishIntent | null;
  /** Opens the publish confirm. Safe to call from a blocked button: it shows
   *  the reason instead of the dialog, so the gate never depends on `disabled`. */
  askToPublish: () => void;
  askToUnpublish: () => void;
  closeConfirm: () => void;
  confirmPublish: () => void;
  confirmUnpublish: () => void;
  isPending: boolean;
}

export function usePiecePublishAction({
  record,
  publish,
  unpublish,
}: UsePiecePublishActionParams): PiecePublishAction {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [confirmIntent, setConfirmIntent] = useState<PiecePublishIntent | null>(
    null,
  );
  const [refusal, setRefusal] = useState<PublishRefusalDto | null>(null);

  const publishGate = record?.publishGate;
  const openGateItems = useMemo(
    () =>
      (publishGate ?? [])
        .filter((item) => !item.done)
        .map((item) => item.label),
    [publishGate],
  );
  const hasOpenGateItems = openGateItems.length > 0;

  // `publishedAt` in the future means scheduled, in the past means live. The
  // backend leaves the stage at `ready` for a schedule, so the instant is the
  // only thing that separates the two states.
  const publishedAt = record?.publishedAt ?? null;
  const hasValidInstant = hasPublishDate({ publishedAt });
  const isScheduled = isPieceScheduled({ publishedAt });
  const isPublished = record?.isPublished === true && !isScheduled;
  // The backend's own `isPublished` already answers "live right now",
  // strictly narrower than "has a `publishedAt`" (it excludes a scheduled
  // instant), so it is true for a Ready piece whose date already passed:
  // that piece IS live. The piece's own stage is what tells settled apart
  // from unsettled here.
  const isAlreadyLive =
    hasValidInstant && !isScheduled && record?.stage !== "published";
  const publishedAtLabel =
    publishedAt && hasValidInstant
      ? formatDate(publishedAt, intlLocale(language), PUBLISHED_AT_FORMAT)
      : null;

  function askToPublish(): void {
    setRefusal(null);
    if (hasOpenGateItems) {
      // The button is only aria-disabled, so this path is reachable by
      // keyboard and by anything that ignores the attribute. Say why rather
      // than doing nothing at all.
      showToast(
        t("magazine:piece.publish.blockedToast", {
          count: openGateItems.length,
        }),
        "error",
      );
      return;
    }
    setConfirmIntent("publish");
  }

  function askToUnpublish(): void {
    setRefusal(null);
    setConfirmIntent("unpublish");
  }

  function closeConfirm(): void {
    setConfirmIntent(null);
  }

  function confirmPublish(): void {
    setConfirmIntent(null);
    // No `publishedAt`: the record's Publish action always means "now".
    // Scheduling a specific instant belongs to the article editor's publish
    // rail and to the issue ship, both of which have a picker.
    publish.mutate(
      {},
      {
        onSuccess: () => {
          setRefusal(null);
          showToast(t("magazine:piece.publish.publishedToast"), "success");
        },
        onError: (error) => {
          const serverRefusal = readPublishRefusal(error);
          setRefusal(serverRefusal);
          showToast(
            serverRefusal?.code === CARE_GATE_OPEN_CODE
              ? t("magazine:piece.publish.refusedCareGateToast")
              : serverRefusal
                ? t("magazine:piece.publish.refusedNotReadyToast")
                : t("magazine:piece.publish.failedToast"),
            "error",
          );
        },
      },
    );
  }

  function confirmUnpublish(): void {
    setConfirmIntent(null);
    unpublish.mutate(undefined, {
      onSuccess: () => {
        setRefusal(null);
        showToast(t("magazine:piece.publish.unpublishedToast"), "success");
      },
      onError: () =>
        showToast(t("magazine:piece.publish.unpublishFailedToast"), "error"),
    });
  }

  return {
    isPublished,
    isScheduled,
    isAlreadyLive,
    publishedAtLabel,
    publicHref: record?.publicHref ?? null,
    openGateItems,
    hasOpenGateItems,
    refusal,
    confirmIntent,
    askToPublish,
    askToUnpublish,
    closeConfirm,
    confirmPublish,
    confirmUnpublish,
    isPending: publish.isPending || unpublish.isPending,
  };
}
