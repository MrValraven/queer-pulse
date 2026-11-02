import type { UseQueryResult } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import type {
  CreateEventBatchDto,
  EventBatchTemplateDTO,
  EventBatchTemplateOption,
} from "../api/eventBatch.api";
import { useEventBatchTemplate } from "../api/useEventBatchTemplate";
import {
  useEventBatchTemplateOptions,
  type EventBatchTemplateOptionsResult,
} from "../api/useEventBatchTemplateOptions";
import { ADD_EVENT_MONTH_FROM_PARAM } from "../gatheringPaths";
import {
  lastAllowedDate,
  monthOf,
  wallClockNow,
  type WallClockNow,
} from "./addMonthDates";
import {
  addMonthReducer,
  costValuesFromTemplate,
  EMPTY_ADD_MONTH_STATE,
  placeValuesFromTemplate,
  type AddMonthAction,
  type AddMonthBlock,
  type AddMonthRowIssue,
  type AddMonthState,
} from "./addMonthState";
import { addMonthStateToDto } from "./addMonthPayload";
import { issuesByDate, publishBlock } from "./addMonthValidation";
import {
  eventBatchFailureOf,
  type EventBatchFailure,
} from "./eventBatchErrors";
import { useAddMonthDraft } from "./useAddMonthDraft";

const MILLISECONDS_PER_MINUTE = 60_000;

export interface AddEventMonthPageModel {
  state: AddMonthState;
  dispatch: Dispatch<AddMonthAction>;
  options: EventBatchTemplateOptionsResult;
  template: UseQueryResult<EventBatchTemplateDTO, Error>;
  /** The loaded starting event, held while the next picked one loads, so the
   *  dates section (and the shared cover upload inside it) stays mounted
   *  across a switch. Undefined once no event is picked. */
  shownTemplate: EventBatchTemplateDTO | undefined;
  /** The picker's stand-in for a picked event beyond the loaded pages. */
  selectedFallback: EventBatchTemplateOption | undefined;
  templateFailure: EventBatchFailure | null;
  now: WallClockNow;
  bounds: { today: string; lastDate: string };
  visibleMonth: string;
  setVisibleMonth: (month: string) => void;
  issues: Record<string, AddMonthRowIssue[]>;
  block: AddMonthBlock | null;
  isEditingShared: boolean;
  toggleEditingShared: () => void;
  openSharedEdit: () => void;
  closeSharedEdit: () => void;
  /** The request body for the month, null until a starting event is picked. */
  payload: CreateEventBatchDto | null;
  draft: ReturnType<typeof useAddMonthDraft>;
}

/** The picker row for the loaded starting event. The template read carries
 *  no start instant, so the row prints its place alone. */
function templateOptionOf(
  template: EventBatchTemplateDTO,
): EventBatchTemplateOption {
  return {
    slug: template.slug,
    title: template.title,
    startAt: "",
    timezone: template.timezone,
    place: template.isOnline
      ? ""
      : (template.venue ?? template.neighbourhood ?? ""),
    isOnline: template.isOnline,
    coverImageUrl: template.coverImageUrl,
  };
}

/** Renders once a minute, so the wall clock read during render moves on. */
function useMinuteTick(): void {
  const [, setTickCount] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(
      () => setTickCount((count) => count + 1),
      MILLISECONDS_PER_MINUTE,
    );
    return () => window.clearInterval(interval);
  }, []);
}

/** Holds the last loaded starting event while a picked one loads. */
function useShownTemplate(
  data: EventBatchTemplateDTO | undefined,
  templateSlug: string | null,
): EventBatchTemplateDTO | undefined {
  const [heldTemplate, setHeldTemplate] = useState(data);
  if (data !== undefined && data !== heldTemplate) setHeldTemplate(data);
  if (templateSlug === null && heldTemplate !== undefined) {
    setHeldTemplate(undefined);
  }
  return templateSlug === null ? undefined : (data ?? heldTemplate);
}

/** The shared place and cost edit: open only while both hold values, so a
 *  reset to the starting event or a new pick folds it. */
function useSharedEditToggle(
  state: AddMonthState,
  dispatch: Dispatch<AddMonthAction>,
  template: EventBatchTemplateDTO | undefined,
) {
  const [isOpenWanted, setIsOpenWanted] = useState(false);
  const isEditingShared =
    isOpenWanted && state.place !== null && state.cost !== null;
  const openSharedEdit = useCallback(() => {
    if (!template) return;
    if (state.place === null || state.cost === null) {
      dispatch({
        type: "startEditingShared",
        place: state.place ?? placeValuesFromTemplate(template),
        cost: state.cost ?? costValuesFromTemplate(template),
      });
    }
    setIsOpenWanted(true);
  }, [dispatch, state.cost, state.place, template]);
  const toggleEditingShared = useCallback(() => {
    if (isEditingShared) setIsOpenWanted(false);
    else openSharedEdit();
  }, [isEditingShared, openSharedEdit]);
  const closeSharedEdit = useCallback(() => setIsOpenWanted(false), []);
  return {
    isEditingShared,
    toggleEditingShared,
    openSharedEdit,
    closeSharedEdit,
  };
}

/**
 * The month page's state and everything read from it: the reducer, the
 * starting event, the wall clock in its zone, the card issues, what holds
 * Publish back and the local draft.
 */
export function useAddEventMonthPage(): AddEventMonthPageModel {
  const [state, dispatch] = useReducer(addMonthReducer, EMPTY_ADD_MONTH_STATE);
  const [searchParams] = useSearchParams();
  const fromSlug = searchParams.get(ADD_EVENT_MONTH_FROM_PARAM);
  const hasAppliedFromRef = useRef(false);
  // The `from` link picks once. A resumed draft replaces the whole state, so
  // it wins over the link when the host chooses Resume.
  useEffect(() => {
    if (hasAppliedFromRef.current || !fromSlug) return;
    hasAppliedFromRef.current = true;
    dispatch({ type: "pickTemplate", slug: fromSlug });
  }, [fromSlug]);

  const options = useEventBatchTemplateOptions();
  const template = useEventBatchTemplate(state.templateSlug ?? undefined);
  const templateData = template.data;
  useEffect(() => {
    if (templateData && templateData.slug === state.templateSlug) {
      dispatch({ type: "applyTemplateTimes", template: templateData });
    }
  }, [templateData, state.templateSlug, state.timesTemplateSlug]);
  const shownTemplate = useShownTemplate(templateData, state.templateSlug);
  const templateError = template.error;
  // A failed background refetch keeps the loaded event, so only a read with
  // nothing loaded names a failure and folds the sections below.
  const templateFailure = useMemo(
    () =>
      templateError && !templateData
        ? eventBatchFailureOf(templateError)
        : null,
    [templateError, templateData],
  );
  const selectedFallback = useMemo(
    () => (templateData ? templateOptionOf(templateData) : undefined),
    [templateData],
  );

  // An empty zone reads the device clock until a starting event loads. The
  // tick renders once a minute, so a start that passes while the host sits
  // idle is flagged.
  useMinuteTick();
  const now = wallClockNow(shownTemplate?.timezone ?? "", new Date());
  const today = now.date;
  const nowTime = now.time;
  const bounds = useMemo(
    () => ({ today, lastDate: lastAllowedDate(today) }),
    [today],
  );
  const [movedMonth, setVisibleMonth] = useState<string | null>(null);
  const firstRowDate = state.rows[0]?.date;
  const visibleMonth = movedMonth ?? monthOf(firstRowDate ?? bounds.today);

  // Publish sends this one body, built once per state. `publishBlock` builds
  // the same pure body again to measure it, and stays the one source of the
  // block order.
  const payload = useMemo(
    () => (state.templateSlug === null ? null : addMonthStateToDto(state)),
    [state],
  );
  const issues = useMemo(
    () => issuesByDate(state, { date: today, time: nowTime }),
    [state, today, nowTime],
  );
  const loadedTemplateSlug = templateData?.slug ?? null;
  const block = useMemo(
    () => publishBlock(state, issues, loadedTemplateSlug),
    [state, issues, loadedTemplateSlug],
  );

  const sharedEdit = useSharedEditToggle(state, dispatch, templateData);
  const { user } = useAuth();
  const onRestore = useCallback(
    (restored: AddMonthState) => dispatch({ type: "restore", state: restored }),
    [],
  );
  const draft = useAddMonthDraft({ memberId: user?.id, state, onRestore });

  return {
    state,
    dispatch,
    options,
    template,
    shownTemplate,
    selectedFallback,
    templateFailure,
    now,
    bounds,
    visibleMonth,
    setVisibleMonth,
    issues,
    block,
    payload,
    ...sharedEdit,
    draft,
  };
}
