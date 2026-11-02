import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  CreateEventBatchDto,
  CreatedEventBatchEventDTO,
  EventBatchRowDto,
} from "../api/eventBatch.api";
import { useCreateEventBatch } from "../api/useCreateEventBatch";
import {
  ADD_MONTH_SECTION_IDS,
  addMonthRowAnchorId,
  addMonthRowFieldId,
} from "./addMonth.data";
import { formatRowDate } from "./addMonthDates";
import type {
  AddMonthAction,
  AddMonthBlock,
  AddMonthRowField,
  AddMonthRowIssue,
  AddMonthState,
} from "./addMonthState";
import { firstInvalidRowDate, serverIssueFor } from "./addMonthValidation";
import { ADD_MONTH_FAILURE_HEADING_ID } from "./AddMonthFailurePanel";
import { ADD_MONTH_PLEDGE_ANCHORS } from "./AddMonthPublishSection";
import { ADD_MONTH_RESULTS_HEADING_ID } from "./AddMonthResults";
import { ADD_MONTH_ROWS_HEADING_ID } from "./AddMonthRowList";
import {
  eventBatchFailureOf,
  eventBatchFailureText,
  type EventBatchFailure,
} from "./eventBatchErrors";

// ── Where the page moves the host ──────────────────────────────────────────

/** Section headings the page focuses when it sends the host to a section. */
export const ADD_MONTH_TEMPLATE_HEADING_ID = `${ADD_MONTH_SECTION_IDS.template}-heading`;
export const ADD_MONTH_DATES_HEADING_ID = `${ADD_MONTH_SECTION_IDS.dates}-heading`;

/** DOM id of the date heading on one card. */
export function addMonthRowHeadingId(date: string): string {
  return `${addMonthRowAnchorId(date)}-heading`;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotionNow() ? "auto" : "smooth";
}

/** Focuses an element by id. A heading takes focus through `tabindex="-1"`,
 *  so it never joins the tab order. */
export function focusElementById(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;
  if (element.tabIndex < 0 && !element.hasAttribute("tabindex")) {
    element.setAttribute("tabindex", "-1");
  }
  element.focus({ preventScroll: true });
}

/** Scrolls an element to the middle of the screen and focuses another (or
 *  the same) element inside it. */
export function revealElement(scrollId: string, focusId = scrollId): void {
  document
    .getElementById(scrollId)
    ?.scrollIntoView({ block: "center", behavior: scrollBehavior() });
  focusElementById(focusId);
}

/** The id of the control on a card that a field issue names. */
function rowFieldTargetId(date: string, field: AddMonthRowField): string {
  return field === "date"
    ? addMonthRowHeadingId(date)
    : addMonthRowFieldId(date, field);
}

function revealRow(date: string, field: AddMonthRowField): void {
  revealElement(addMonthRowAnchorId(date), rowFieldTargetId(date, field));
}

/** Where focus goes once a publish settles. `scrollId` null keeps the
 *  scroll where it is. */
interface AddMonthReveal {
  scrollId: string | null;
  focusId: string;
}

function rowReveal(date: string, field: AddMonthRowField): AddMonthReveal {
  return {
    scrollId: addMonthRowAnchorId(date),
    focusId: rowFieldTargetId(date, field),
  };
}

function applyReveal(reveal: AddMonthReveal): void {
  if (reveal.scrollId === null) {
    focusElementById(reveal.focusId);
    return;
  }
  revealElement(reveal.scrollId, reveal.focusId);
}

/** The section each remaining block sends the host to. */
const BLOCK_SECTIONS: Record<
  Exclude<AddMonthBlock["reason"], "rowsInvalid" | "pledgesOpen">,
  { scrollId: string; focusId: string }
> = {
  noTemplate: {
    scrollId: ADD_MONTH_SECTION_IDS.template,
    focusId: ADD_MONTH_TEMPLATE_HEADING_ID,
  },
  templateLoading: {
    scrollId: ADD_MONTH_SECTION_IDS.template,
    focusId: ADD_MONTH_TEMPLATE_HEADING_ID,
  },
  noDates: {
    scrollId: ADD_MONTH_SECTION_IDS.dates,
    focusId: ADD_MONTH_DATES_HEADING_ID,
  },
  sharedInvalid: {
    scrollId: ADD_MONTH_SECTION_IDS.template,
    focusId: ADD_MONTH_TEMPLATE_HEADING_ID,
  },
  tooLarge: {
    scrollId: ADD_MONTH_SECTION_IDS.rows,
    focusId: ADD_MONTH_ROWS_HEADING_ID,
  },
};

/** Sends the host to what holds Publish back. */
function revealBlock(
  block: AddMonthBlock,
  state: AddMonthState,
  issues: Record<string, AddMonthRowIssue[]>,
  openSharedEdit: () => void,
): void {
  if (block.reason === "rowsInvalid") {
    const date = firstInvalidRowDate(state, issues);
    const field = date ? issues[date]?.[0]?.field : undefined;
    if (date && field) revealRow(date, field);
    return;
  }
  if (block.reason === "pledgesOpen") {
    revealElement(ADD_MONTH_PLEDGE_ANCHORS[state.pledges[0] ? 1 : 0]);
    return;
  }
  if (block.reason === "sharedInvalid") openSharedEdit();
  const section = BLOCK_SECTIONS[block.reason];
  revealElement(section.scrollId, section.focusId);
}

// ── Publishing ─────────────────────────────────────────────────────────────

/** The card the server named, with its message and the field to mark. */
export interface AddMonthServerIssue {
  date: string;
  message: string;
  field: AddMonthRowField;
}

/**
 * Publishes the month and keeps what came back: the new events, or the
 * failure with the card it names. A press while blocked marks every card's
 * issues and sends the host to the first one.
 */
export function useAddMonthPublish(options: {
  state: AddMonthState;
  /** The body the page measured for `block`, the one Publish sends. */
  payload: CreateEventBatchDto | null;
  block: AddMonthBlock | null;
  issues: Record<string, AddMonthRowIssue[]>;
  dispatch: Dispatch<AddMonthAction>;
  onPublished: () => void;
  openSharedEdit: () => void;
  closeSharedEdit: () => void;
}) {
  const { state, payload, block, issues, dispatch } = options;
  const { onPublished, openSharedEdit, closeSharedEdit } = options;
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { mutate, isPending } = useCreateEventBatch();
  const isPublishInFlightRef = useRef(false);
  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);
  const [shouldShowIssues, setShouldShowIssues] = useState(false);
  const [created, setCreated] = useState<CreatedEventBatchEventDTO[] | null>(
    null,
  );
  const [failure, setFailure] = useState<EventBatchFailure | null>(null);
  const [serverIssue, setServerIssue] = useState<AddMonthServerIssue | null>(
    null,
  );
  const [isVenueListingRefused, setIsVenueListingRefused] = useState(false);
  // The form is inert while the publish is in flight, so focus can only move
  // once it settles: the answer stores its target here and the effect below
  // applies it after the render that lifts `inert` and shows the panel.
  const pendingRevealRef = useRef<AddMonthReveal | null>(null);
  useEffect(() => {
    const reveal = pendingRevealRef.current;
    if (reveal === null || isPending) return;
    pendingRevealRef.current = null;
    applyReveal(reveal);
  }, [isPending, created, failure, serverIssue]);

  const handleFailure = useCallback(
    (error: Error, sentRows: EventBatchRowDto[]) => {
      const nextFailure = eventBatchFailureOf(error, { context: "publish" });
      setFailure(nextFailure);
      const rowError = nextFailure.rowError;
      const match = rowError
        ? serverIssueFor(rowError, sentRows, latestStateRef.current)
        : null;
      if (match) {
        const message = eventBatchFailureText(nextFailure, t, (date) =>
          formatRowDate(date, language),
        );
        setServerIssue({ date: match.date, message, field: match.issue.field });
        pendingRevealRef.current = rowReveal(match.date, match.issue.field);
        return;
      }
      if (nextFailure.reason === "venueNotFound") {
        setIsVenueListingRefused(true);
        openSharedEdit();
      }
      const isTemplateCause =
        nextFailure.reason === "venueNotFound" ||
        nextFailure.reason === "templateNotFound" ||
        nextFailure.reason === "communityOnly";
      pendingRevealRef.current = isTemplateCause
        ? {
            scrollId: ADD_MONTH_SECTION_IDS.template,
            focusId: ADD_MONTH_TEMPLATE_HEADING_ID,
          }
        : {
            scrollId: ADD_MONTH_FAILURE_HEADING_ID,
            focusId: ADD_MONTH_FAILURE_HEADING_ID,
          };
    },
    [language, openSharedEdit, t],
  );

  const publish = useCallback(() => {
    if (isPublishInFlightRef.current || isPending) return;
    if (payload === null || block !== null) return;
    isPublishInFlightRef.current = true;
    pendingRevealRef.current = null;
    setFailure(null);
    setServerIssue(null);
    setIsVenueListingRefused(false);
    const sentRows = payload.rows;
    mutate(payload, {
      onSuccess: (answer) => {
        setCreated(Array.isArray(answer.events) ? answer.events : []);
        closeSharedEdit();
        onPublished();
        showToast(
          t("gatherings:addMonth.toast.published", { count: sentRows.length }),
          "success",
        );
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
        pendingRevealRef.current = {
          scrollId: null,
          focusId: ADD_MONTH_RESULTS_HEADING_ID,
        };
      },
      onError: (error) => handleFailure(error, sentRows),
      onSettled: () => {
        isPublishInFlightRef.current = false;
      },
    });
  }, [
    block,
    closeSharedEdit,
    handleFailure,
    isPending,
    mutate,
    onPublished,
    payload,
    showToast,
    t,
  ]);

  const pressBlocked = useCallback(() => {
    setShouldShowIssues(true);
    if (block) revealBlock(block, state, issues, openSharedEdit);
  }, [block, issues, openSharedEdit, state]);

  const startAnother = useCallback(() => {
    dispatch({ type: "reset" });
    closeSharedEdit();
    setCreated(null);
    setFailure(null);
    setServerIssue(null);
    setShouldShowIssues(false);
    setIsVenueListingRefused(false);
    pendingRevealRef.current = null;
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    // The results fold away with the button that was pressed, so focus goes
    // to the first section once the form is back.
    window.setTimeout(() => focusElementById(ADD_MONTH_TEMPLATE_HEADING_ID), 0);
  }, [closeSharedEdit, dispatch]);

  return {
    publish,
    pressBlocked,
    isPublishing: isPending,
    shouldShowIssues,
    created,
    failure,
    serverIssue,
    isVenueListingRefused,
    startAnother,
  };
}
