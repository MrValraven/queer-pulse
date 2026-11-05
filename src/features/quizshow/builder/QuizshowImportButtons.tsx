import { useId, useState, type ReactNode } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import {
  isEventImportSource,
  useQuizshowImportSources,
  type QuizshowEventImportSource,
} from "../api/useQuizshowQuiz";
import type { QuizshowSessionScope } from "../quizshowScope";
import { QuizshowImportSourcePicker } from "./QuizshowImportSourcePicker";
import { QuizshowTemplatePicker } from "./QuizshowTemplatePicker";
import { useQuizshowImport } from "./useQuizshowImport";
import styles from "./QuizshowImport.module.css";

interface QuizshowImportButtonsProps {
  scope: QuizshowSessionScope;
  hasQuiz: boolean;
  eventStartAt: Date | null;
  isAdultsEvent: boolean;
  variant: "empty" | "toolbar";
  onImported?: (response: QuizshowQuizResponse) => void;
  /** Opens this picker on mount, once (the empty My games "Copy" hand-off). */
  initialOpenPicker?: QuizshowImportPicker | null;
  /**
   * Additive. Controls which picker is open (the studio's More menu opens
   * them); left out, the buttons own that state as before.
   */
  openPicker?: QuizshowImportPicker | null;
  /** Additive. Hears every open and close of a picker. */
  onOpenPickerChange?: (picker: QuizshowImportPicker | null) => void;
  /** Additive. Renders only the pickers and the replace confirm, for a caller with its own triggers. */
  isButtonsHidden?: boolean;
  /** Additive. Rendered inside the replace confirm (the studio's dark stamp). */
  confirmChildren?: ReactNode;
  /** Additive. Runs before the import goes out; see `useQuizshowImport`. */
  beforeImport?: () => Promise<unknown>;
}

export type QuizshowImportPicker = "template" | "sources";

/** The first source from this event's series that ran before this event. */
function findSeriesSource(
  items: QuizshowImportSource[] | undefined,
  eventStartAt: Date,
): QuizshowEventImportSource | undefined {
  return items
    ?.filter(isEventImportSource)
    .find(
      (source) =>
        source.isSameSeries && new Date(source.startAt) < eventStartAt,
    );
}

/**
 * The import actions as a fragment, so the caller lays the buttons out beside
 * its own (the empty state adds "Start blank"). The two pickers portal out.
 */
export function QuizshowImportButtons({
  scope,
  hasQuiz,
  eventStartAt,
  isAdultsEvent,
  variant,
  onImported,
  initialOpenPicker = null,
  openPicker: controlledOpenPicker,
  onOpenPickerChange,
  isButtonsHidden = false,
  confirmChildren,
  beforeImport,
}: QuizshowImportButtonsProps) {
  const { t } = useTranslation();
  const seriesHintId = useId();
  const fmt = useFormat();
  const [ownOpenPicker, setOwnOpenPicker] =
    useState<QuizshowImportPicker | null>(initialOpenPicker);
  const openPicker =
    controlledOpenPicker === undefined ? ownOpenPicker : controlledOpenPicker;
  const setOpenPicker = (picker: QuizshowImportPicker | null) => {
    setOwnOpenPicker(picker);
    onOpenPickerChange?.(picker);
  };
  const { requestImport, confirmDialog, isPending } = useQuizshowImport(scope, {
    hasQuiz,
    onImported,
    confirmChildren,
    beforeImport,
  });
  const isEmptyVariant = variant === "empty";
  const isSeriesShortcutAllowed =
    isEmptyVariant && scope.kind === "event" && eventStartAt !== null;
  const sources = useQuizshowImportSources(scope, {
    isEnabled: isSeriesShortcutAllowed,
  });
  const seriesSource =
    isSeriesShortcutAllowed && eventStartAt !== null
      ? findSeriesSource(sources.data?.items, eventStartAt)
      : undefined;
  const isSeriesBlocked = Boolean(
    seriesSource?.hasAdultsRounds && !isAdultsEvent,
  );
  const secondaryVariant =
    seriesSource || !isEmptyVariant ? "ghost" : "primary";

  return (
    <>
      {!isButtonsHidden && (
        <>
          <Collapse
            isOpen={seriesSource !== undefined}
            className={styles.seriesShortcut}
          >
            {seriesSource && (
              <div className={styles.seriesRow}>
                <Button
                  aria-disabled={isPending || isSeriesBlocked}
                  aria-describedby={isSeriesBlocked ? seriesHintId : undefined}
                  onClick={() => {
                    if (!isSeriesBlocked) {
                      requestImport({
                        from: "event",
                        eventSlug: seriesSource.eventSlug,
                      });
                    }
                  }}
                >
                  {t("quizshow:builder.empty.fromSeries")}
                </Button>
                <span id={seriesHintId} className={styles.seriesHint}>
                  {t("quizshow:builder.empty.fromSeriesHint", {
                    event: seriesSource.eventTitle ?? "",
                    date: fmt.date(new Date(seriesSource.startAt), {
                      dateStyle: "medium",
                    }),
                  })}
                  {isSeriesBlocked
                    ? `, ${t("quizshow:importSources.adultsTag")}`
                    : ""}
                </span>
              </div>
            )}
          </Collapse>
          <Button
            variant={secondaryVariant}
            aria-disabled={isPending}
            onClick={() => setOpenPicker("template")}
          >
            {t("quizshow:builder.empty.fromTemplate")}
          </Button>
          <Button
            variant="ghost"
            aria-disabled={isPending}
            onClick={() => setOpenPicker("sources")}
          >
            {t(
              scope.kind === "game"
                ? "quizshow:import.fromCopy"
                : "quizshow:builder.empty.fromEvent",
            )}
          </Button>
        </>
      )}
      <QuizshowTemplatePicker
        isOpen={openPicker === "template"}
        isAdultsAllowed={isAdultsEvent}
        onClose={() => setOpenPicker(null)}
        onPick={(card) => {
          setOpenPicker(null);
          requestImport({ from: "template", templateId: card.id });
        }}
      />
      <QuizshowImportSourcePicker
        scope={scope}
        isOpen={openPicker === "sources"}
        isAdultsEvent={isAdultsEvent}
        onClose={() => setOpenPicker(null)}
        onPick={(input) => {
          setOpenPicker(null);
          requestImport(input);
        }}
      />
      {confirmDialog}
    </>
  );
}
