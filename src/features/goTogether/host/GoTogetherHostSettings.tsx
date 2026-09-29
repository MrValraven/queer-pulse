import { useId, useState } from "react";
import { FiLock } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  Field,
  InlineNote,
  SwitchRow,
  TextArea,
  TextInput,
} from "../../gatherings/CreateGatheringFields";
import { eventZoneFormat } from "../../gatherings/eventTimezone";
import { goTogetherErrorCode, isGoTogetherOff } from "../api/goTogether.api";
import type { HostConfigDTO } from "../api/goTogether.types";
import { goTogetherKeys } from "../api/goTogetherKeys";
import {
  useGoTogetherHostConfig,
  useGoTogetherHostSummary,
  useSaveGoTogetherHostConfig,
} from "../api/useGoTogetherHostConfig";
import {
  MAX_MEETING_POINT_LENGTH,
  MIN_HOST_OPTIONS,
} from "../goTogetherQuestionnaire.data";
import { GoTogetherHostOffConfirmDialog } from "./GoTogetherHostOffConfirmDialog";
import { GoTogetherHostQuestionsEditor } from "./GoTogetherHostQuestionsEditor";
import {
  areQuestionBodiesValid,
  cutoffBodyPart,
  cutoffInputBounds,
  draftsToQuestionBodies,
  epochToZonedInputValue,
  questionsToDrafts,
  savedConfigBody,
  savedQuestionBodies,
  useCachedEventTimezone,
} from "./goTogetherHostSettings.helpers";
import styles from "./GoTogetherHost.module.css";

/** The toast for a save the section cannot show inline. */
function useSaveErrorToast() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  return (error: unknown) => {
    const code = goTogetherErrorCode(error);
    if (code === "GO_TOGETHER_LOCKED") {
      showToast(t("goTogether:host.toast.locked"), "warning");
      void queryClient.invalidateQueries({
        queryKey: goTogetherKeys.hostConfigRoot,
      });
      return;
    }
    if (code === "GO_TOGETHER_UNAVAILABLE") {
      showToast(t("goTogether:host.toast.closed"), "warning");
      return;
    }
    if (code === "GO_TOGETHER_BAD_CUTOFF") {
      showToast(t("goTogether:host.toast.badCutoff"), "error");
      return;
    }
    showToast(t("goTogether:host.toast.saveError"), "error");
  };
}

/** A readable "Fri 3 Oct, 19:00" in the gathering's own clock. */
function useCutoffLabel(timeZone: string | undefined) {
  const format = useFormat();
  return (epochMs: number) => {
    const zone = eventZoneFormat(timeZone, new Date(epochMs));
    const dateLabel = format.date(epochMs, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...zone.dateOptions,
    });
    return `${dateLabel}, ${format.time(epochMs, zone.timeOptions)}`;
  };
}

interface CutoffFieldProps {
  config: HostConfigDTO;
  timeZone: string | undefined;
  /** When the section opened: the floor of the range, since a new cutoff
   *  in the past is refused. */
  openedAtMs: number;
  /** Locked, or opt-in has closed: the time shows with no range hint. */
  isReadOnly: boolean;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

/** When matching runs, in the gathering's own clock. */
function CutoffField({
  config,
  timeZone,
  openedAtMs,
  isReadOnly,
  value,
  onChange,
  error,
}: CutoffFieldProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const cutoffLabel = useCutoffLabel(timeZone);
  const bounds = cutoffInputBounds(config, openedAtMs, timeZone);
  const describedBy = [
    isReadOnly ? null : `${inputId}-hint`,
    error ? `${inputId}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Field
      label={t("goTogether:host.cutoff.label")}
      htmlFor={inputId}
      hint={
        isReadOnly
          ? undefined
          : t("goTogether:host.cutoff.hint", {
              earliest: cutoffLabel(bounds.minMs),
              latest: cutoffLabel(bounds.maxMs),
            })
      }
      error={error}
    >
      <TextInput
        id={inputId}
        type="datetime-local"
        value={value}
        min={bounds.min}
        max={bounds.max}
        readOnly={isReadOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

interface MeetingPointFieldProps {
  value: string;
  onChange: (value: string) => void;
  isLocked: boolean;
}

function MeetingPointField({
  value,
  onChange,
  isLocked,
}: MeetingPointFieldProps) {
  const { t } = useTranslation();
  const inputId = useId();
  return (
    <Field
      label={t("goTogether:host.meetingPoint.label")}
      htmlFor={inputId}
      isOptional
      count={`${value.length}/${MAX_MEETING_POINT_LENGTH}`}
      hint={t("goTogether:host.meetingPoint.hint")}
    >
      <TextArea
        id={inputId}
        rows={2}
        value={value}
        maxLength={MAX_MEETING_POINT_LENGTH}
        readOnly={isLocked}
        placeholder={t("goTogether:host.meetingPoint.placeholder")}
        aria-describedby={`${inputId}-hint`}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

/** Counts only: how many are waiting and how many groups formed. The host
 *  never sees who. */
function HostSummary({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const { data: summary } = useGoTogetherHostSummary(slug);
  if (!summary) return null;
  return (
    <section aria-labelledby={headingId} className={styles.summary}>
      <h3 id={headingId} className={styles.summaryHeading}>
        {t("goTogether:host.summary.heading")}
      </h3>
      <StatGrid columns={2}>
        <StatTile
          value={format.number(summary.waiting)}
          label={t("goTogether:host.summary.waiting", {
            count: summary.waiting,
          })}
        />
        <StatTile
          value={format.number(summary.groups)}
          label={t("goTogether:host.summary.groups", { count: summary.groups })}
        />
      </StatGrid>
      <p className={styles.summaryNote}>{t("goTogether:host.summary.note")}</p>
    </section>
  );
}

interface HostSettingsDetailsProps {
  slug: string;
  config: HostConfigDTO;
  timeZone: string | undefined;
  /** Locked, or opt-in has closed: nothing here can change. */
  isReadOnly: boolean;
  /** The switch's own save is out, so this save would send a stale switch. */
  isSwitchPending: boolean;
}

/**
 * The cutoff, the questions and the meeting point, saved together. The draft
 * seeds from the saved config once; the parent remounts this with a new key
 * whenever the saved values change, so a save starts it fresh.
 */
function HostSettingsDetails({
  slug,
  config,
  timeZone,
  isReadOnly,
  isSwitchPending,
}: HostSettingsDetailsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const showSaveError = useSaveErrorToast();
  const saveConfig = useSaveGoTogetherHostConfig(slug);
  const [openedAtMs] = useState(() => Date.now());
  const [cutoffValue, setCutoffValue] = useState(() =>
    epochToZonedInputValue(Date.parse(config.cutoffAt), timeZone),
  );
  const [isCutoffTouched, setIsCutoffTouched] = useState(false);
  const [questions, setQuestions] = useState(() =>
    questionsToDrafts(config.hostQuestions),
  );
  const [meetingPoint, setMeetingPoint] = useState(
    config.meetingPointNote ?? "",
  );
  const [cutoffError, setCutoffError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const questionBodies = draftsToQuestionBodies(questions);
  const isDirty =
    isCutoffTouched ||
    meetingPoint.trim() !== (config.meetingPointNote ?? "") ||
    JSON.stringify(questionBodies) !==
      JSON.stringify(savedQuestionBodies(config.hostQuestions));

  const save = () => {
    const nowMs = Date.now();
    const isQuestionsValid = areQuestionBodiesValid(
      questionBodies,
      MIN_HOST_OPTIONS,
    );
    const cutoff = cutoffBodyPart({
      config,
      isCutoffTouched,
      cutoffValue,
      timeZone,
      nowMs,
    });
    setQuestionsError(
      isQuestionsValid ? null : t("goTogether:host.questions.error"),
    );
    setCutoffError(cutoff ? null : t("goTogether:host.cutoff.error"));
    if (!isQuestionsValid || !cutoff) return;
    const trimmedMeetingPoint = meetingPoint.trim();
    saveConfig.mutate(
      {
        enabled: config.enabled,
        ...cutoff,
        hostQuestions: questionBodies,
        meetingPointNote:
          trimmedMeetingPoint.length > 0 ? trimmedMeetingPoint : null,
      },
      {
        onSuccess: () => showToast(t("goTogether:host.toast.saved"), "success"),
        onError: (error) => {
          const code = goTogetherErrorCode(error);
          if (code === "GO_TOGETHER_BAD_CUTOFF") {
            setCutoffError(t("goTogether:host.cutoff.error"));
          } else if (code === "GO_TOGETHER_INVALID_QUESTIONS") {
            setQuestionsError(t("goTogether:host.questions.error"));
          } else {
            showSaveError(error);
          }
        },
      },
    );
  };

  return (
    <div className={styles.details}>
      <CutoffField
        config={config}
        timeZone={timeZone}
        openedAtMs={openedAtMs}
        isReadOnly={isReadOnly}
        value={cutoffValue}
        error={cutoffError}
        onChange={(value) => {
          setCutoffValue(value);
          setIsCutoffTouched(true);
          setCutoffError(null);
        }}
      />
      <GoTogetherHostQuestionsEditor
        questions={questions}
        isLocked={isReadOnly}
        hasSavedQuestions={config.hostQuestions.length > 0}
        error={questionsError}
        onChange={(nextQuestions) => {
          setQuestions(nextQuestions);
          setQuestionsError(null);
        }}
      />
      <MeetingPointField
        value={meetingPoint}
        isLocked={isReadOnly}
        onChange={setMeetingPoint}
      />
      {!isReadOnly && (
        <div className={styles.saveRow}>
          <Button
            variant="primary"
            disabled={!isDirty || saveConfig.isPending || isSwitchPending}
            onClick={save}
          >
            {saveConfig.isPending
              ? t("goTogether:host.saving")
              : t("goTogether:host.save")}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Remounts the details whenever the saved values behind the draft change. */
function detailsKey(config: HostConfigDTO): string {
  return JSON.stringify([
    config.cutoffAt,
    config.hostQuestions,
    config.meetingPointNote,
    config.isLocked,
  ]);
}

interface HostSwitchProps {
  config: HostConfigDTO;
  isOptInClosed: boolean;
  isEnabled: boolean;
  onChange: (isChecked: boolean) => void;
}

/** The enable switch, or its read-only form with a note saying why. */
function HostSwitch({
  config,
  isOptInClosed,
  isEnabled,
  onChange,
}: HostSwitchProps) {
  const { t } = useTranslation();
  const switchText = {
    title: t("goTogether:host.enable.title"),
    description: t("goTogether:host.enable.description"),
  };
  if (!config.isLocked && !isOptInClosed) {
    return (
      <SwitchRow {...switchText} isChecked={isEnabled} onChange={onChange} />
    );
  }
  return (
    <>
      {config.enabled && <SwitchRow {...switchText} isLocked />}
      <InlineNote tone="warning" icon={FiLock}>
        {config.isLocked
          ? t("goTogether:host.lockedNote")
          : t("goTogether:host.closedNote")}
      </InlineNote>
    </>
  );
}

function HostSettingsBody({
  slug,
  config,
}: {
  slug: string;
  config: HostConfigDTO;
}) {
  const timeZone = useCachedEventTimezone(slug);
  const showSaveError = useSaveErrorToast();
  const toggleConfig = useSaveGoTogetherHostConfig(slug);
  const [openedAtMs] = useState(() => Date.now());
  // A confirm gate before an on-to-off save: only a config saved as enabled
  // has anyone waiting to tell (PRD-416). Turning it on, or turning off a
  // config that was never saved enabled, skips straight to the save.
  const [isOffConfirmOpen, setIsOffConfirmOpen] = useState(false);
  // Opt-in closes at the latest cutoff; after it every save is refused.
  const isOptInClosed = openedAtMs >= Date.parse(config.latestCutoffAt);
  // The switch follows the press while the save is out, then the server.
  const isEnabled =
    toggleConfig.isPending && toggleConfig.variables
      ? toggleConfig.variables.enabled
      : config.enabled;
  const saveEnabled = (isChecked: boolean) =>
    toggleConfig.mutate(
      { ...savedConfigBody(config, Date.now()), enabled: isChecked },
      { onError: showSaveError },
    );
  return (
    <>
      <HostSwitch
        config={config}
        isOptInClosed={isOptInClosed}
        isEnabled={isEnabled}
        onChange={(isChecked) => {
          if (toggleConfig.isPending) return;
          if (!isChecked && config.enabled) {
            setIsOffConfirmOpen(true);
            return;
          }
          saveEnabled(isChecked);
        }}
      />
      <GoTogetherHostOffConfirmDialog
        open={isOffConfirmOpen}
        isPending={toggleConfig.isPending}
        onCancel={() => setIsOffConfirmOpen(false)}
        onConfirm={() => {
          setIsOffConfirmOpen(false);
          saveEnabled(false);
        }}
      />
      {(isEnabled || config.isLocked) && (
        <>
          <HostSettingsDetails
            key={detailsKey(config)}
            slug={slug}
            config={config}
            timeZone={timeZone}
            isReadOnly={config.isLocked || isOptInClosed}
            isSwitchPending={toggleConfig.isPending}
          />
          <HostSummary slug={slug} />
        </>
      )}
    </>
  );
}

/**
 * The host's Go together section on the manage page: switch it on, pick when
 * matching runs, add up to 2 fun questions and a meeting point, and see how
 * many are waiting and how many groups formed. Counts only, ever.
 */
export function GoTogetherHostSettings({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const headingId = useId();
  const configQuery = useGoTogetherHostConfig(slug);
  // Go together switched off everywhere answers 404: the section stays out.
  if (configQuery.isError && isGoTogetherOff(configQuery.error)) return null;
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <h2 id={headingId} className={styles.heading}>
        {t("goTogether:host.heading")}
      </h2>
      <p className={styles.intro}>{t("goTogether:host.intro")}</p>
      {configQuery.data ? (
        <HostSettingsBody slug={slug} config={configQuery.data} />
      ) : configQuery.isError ? (
        <LoadErrorState
          compact
          title={t("goTogether:host.loadError")}
          onRetry={() => void configQuery.refetch()}
        />
      ) : (
        <SkeletonLine height={56} />
      )}
    </section>
  );
}
