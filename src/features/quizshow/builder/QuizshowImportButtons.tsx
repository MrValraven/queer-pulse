import { useId, useState } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { useQuizshowImportSources } from "../api/useQuizshowQuiz";
import { QuizshowImportSourcePicker } from "./QuizshowImportSourcePicker";
import { QuizshowPackPicker } from "./QuizshowPackPicker";
import { useQuizshowImport } from "./useQuizshowImport";
import styles from "./QuizshowImport.module.css";

interface QuizshowImportButtonsProps {
  slug: string;
  hasQuiz: boolean;
  eventStartAt: Date;
  isAdultsEvent: boolean;
  variant: "empty" | "toolbar";
  onImported?: (response: QuizshowQuizResponse) => void;
}

type OpenPicker = "pack" | "event" | null;

/** The first source from this event's series that ran before this event. */
function findSeriesSource(
  items: QuizshowImportSource[] | undefined,
  eventStartAt: Date,
): QuizshowImportSource | undefined {
  return items?.find(
    (source) => source.isSameSeries && new Date(source.startAt) < eventStartAt,
  );
}

/**
 * The import actions as a fragment, so the caller lays the buttons out beside
 * its own (the empty state adds "Start blank"). The two pickers portal out.
 */
export function QuizshowImportButtons({
  slug,
  hasQuiz,
  eventStartAt,
  isAdultsEvent,
  variant,
  onImported,
}: QuizshowImportButtonsProps) {
  const { t } = useTranslation();
  const seriesHintId = useId();
  const fmt = useFormat();
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const { requestImport, confirmDialog, isPending } = useQuizshowImport(slug, {
    hasQuiz,
    onImported,
  });
  const isEmptyVariant = variant === "empty";
  const sources = useQuizshowImportSources(slug, { isEnabled: isEmptyVariant });
  const seriesSource = isEmptyVariant
    ? findSeriesSource(sources.data?.items, eventStartAt)
    : undefined;
  const isSeriesBlocked = Boolean(
    seriesSource?.hasAdultsRounds && !isAdultsEvent,
  );
  const secondaryVariant =
    seriesSource || !isEmptyVariant ? "ghost" : "primary";

  return (
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
                event: seriesSource.eventTitle,
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
        onClick={() => setOpenPicker("pack")}
      >
        {t("quizshow:builder.empty.fromPack")}
      </Button>
      <Button
        variant="ghost"
        aria-disabled={isPending}
        onClick={() => setOpenPicker("event")}
      >
        {t("quizshow:builder.empty.fromEvent")}
      </Button>
      <QuizshowPackPicker
        isOpen={openPicker === "pack"}
        onClose={() => setOpenPicker(null)}
        onPick={(packKey) => {
          setOpenPicker(null);
          requestImport({ from: "pack", packKey });
        }}
      />
      <QuizshowImportSourcePicker
        slug={slug}
        isOpen={openPicker === "event"}
        isAdultsEvent={isAdultsEvent}
        onClose={() => setOpenPicker(null)}
        onPick={(eventSlug) => {
          setOpenPicker(null);
          requestImport({ from: "event", eventSlug });
        }}
      />
      {confirmDialog}
    </>
  );
}
