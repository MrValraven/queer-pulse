import {
  useDeferredValue,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  FiChevronDown,
  FiFileText,
  FiInfo,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  Button,
  Collapse,
  FormField,
  Modal,
} from "../../../shared/components/ui";
import { useDebouncedValue } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { decodeCsvBytes, parseQuizCsv } from "../builder/quizshowCsv";
import type { QuizshowDraft } from "../builder/quizshowDraft";
import {
  QUIZSHOW_PASTE_TEXT_MAX,
  importLimitIssuesOf,
  importedQuestionCountOf,
  parsePastedQuestions,
  withImportedRounds,
  type QuizshowImportIssue,
} from "../builder/quizshowPasteFormat";
import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import { selectLineIn } from "./quizshowStudioTools";
import type { QuizshowPasteAdded } from "./useQuizshowPasteAddedToast";
import lobbyStyles from "../builder/QuizshowLobby.module.css";
import menuStyles from "./QuizshowStudioMenu.module.css";
import styles from "./QuizshowPasteDialog.module.css";

/** The largest CSV the dialog reads; a quiz of 100 questions is a few kilobytes. */
const CSV_FILE_MAX_BYTES = 1_000_000;
const CSV_FILE_MAX_LABEL = "1 MB";
/** The count is read out once typing has settled for this long. */
const STATUS_SETTLE_MS = 600;
/**
 * The issue list scrolls, so keyboard users need to reach it (WCAG 2.1.1).
 * Passed as a value: jsx-a11y allows a tab stop on a scroll region that way.
 */
const SCROLL_REGION_TAB_INDEX = 0;
/** The catalog key of the CSV issue that lists the expected columns; the list is drawn as chips. */
const MISSING_HEADER_REASON_KEY = "quizshow:studio.paste.issue.missingHeader";

interface ChosenCsv {
  fileName: string;
  text: string;
}

/** The chosen CSV file, read in the browser; nothing is uploaded. */
function useChosenCsv() {
  const [chosen, setChosen] = useState<ChosenCsv | null>(null);
  const [fileError, setFileError] = useState<{
    key: string;
    values: Record<string, string>;
  } | null>(null);
  const choose = async (file: File) => {
    setFileError(null);
    if (file.size > CSV_FILE_MAX_BYTES) {
      setFileError({
        key: "quizshow:studio.paste.fileTooLarge",
        values: { max: CSV_FILE_MAX_LABEL },
      });
      return;
    }
    try {
      const text = decodeCsvBytes(await file.arrayBuffer());
      setChosen({ fileName: file.name, text });
    } catch {
      setFileError({
        key: "quizshow:studio.paste.fileReadFailed",
        values: { name: file.name },
      });
    }
  };
  return { chosen, fileError, choose, clear: () => setChosen(null) };
}

type ChosenCsvState = ReturnType<typeof useChosenCsv>;

/** "Choose a CSV file", the chosen file's name with a way to drop it, and why a file could not be read. */
function QuizshowPasteFileField({ csv }: { csv: ChosenCsvState }) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    // Cleared, so choosing the same file again reads it again.
    event.currentTarget.value = "";
    if (file !== undefined) void csv.choose(file);
  };
  return (
    <div className={lobbyStyles.field}>
      <div className={menuStyles.pasteFileRow}>
        <Button
          variant="stage-ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload aria-hidden />
          {t(
            csv.chosen === null
              ? "quizshow:studio.paste.chooseFile"
              : "quizshow:studio.paste.chooseAnother",
          )}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          tabIndex={-1}
          onChange={handleChange}
        />
      </div>
      <Collapse isOpen={csv.chosen !== null}>
        <div className={menuStyles.pasteFileRow}>
          <span className={menuStyles.pasteFileName}>
            <FiFileText aria-hidden />
            {t("quizshow:studio.paste.fileChosen", {
              name: csv.chosen?.fileName ?? "",
            })}
          </span>
          <Button variant="stage-ghost" size="sm" onClick={csv.clear}>
            <FiX aria-hidden />
            {t("quizshow:studio.paste.removeFile")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={csv.fileError !== null}>
        <p className={menuStyles.pasteError} role="alert">
          {csv.fileError === null
            ? null
            : t(csv.fileError.key, csv.fileError.values)}
        </p>
      </Collapse>
    </div>
  );
}

/** One issue's reason; the CSV's missing header lists the expected columns as wrapping chips. */
function QuizshowPasteIssueReason({ issue }: { issue: QuizshowImportIssue }) {
  const { t } = useTranslation();
  if (issue.reasonKey !== MISSING_HEADER_REASON_KEY) {
    return <>{t(issue.reasonKey, issue.values)}</>;
  }
  return (
    <>
      {t("quizshow:studio.paste.issue.missingHeaderLead")}
      <ul className={menuStyles.pasteColumns}>
        {String(issue.values?.columns ?? "")
          .split(",")
          .map((columnName) => (
            <li key={columnName}>
              <code className={menuStyles.pasteColumn}>{columnName}</code>
            </li>
          ))}
      </ul>
    </>
  );
}

/**
 * The issues to fix, each with its line number and the reason, in a list that
 * scrolls. With a text to point into, the line number is a button that
 * selects that line in the textarea.
 */
function QuizshowPasteIssues({
  issues,
  id,
  onSelectLine,
}: {
  issues: readonly QuizshowImportIssue[];
  id: string;
  /** Selects the line in the pasted text; absent for a CSV file, which has no text box. */
  onSelectLine?: (line: number) => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <Collapse isOpen={issues.length > 0}>
      <section
        id={id}
        className={menuStyles.pasteIssues}
        aria-labelledby={titleId}
      >
        <p id={titleId} className={menuStyles.pasteIssuesTitle}>
          {t("quizshow:studio.paste.issuesTitle", { count: issues.length })}
        </p>
        <ul
          className={`${menuStyles.pasteIssueList} ${styles.issueList}`}
          aria-labelledby={titleId}
          tabIndex={SCROLL_REGION_TAB_INDEX}
        >
          {issues.map((issue, issueIndex) => (
            <li
              key={`${issue.line}-${issue.reasonKey}-${issueIndex}`}
              className={menuStyles.pasteIssue}
            >
              {onSelectLine === undefined ? (
                <span className={menuStyles.pasteIssueLine}>
                  {t("quizshow:studio.paste.issueLine", { line: issue.line })}
                </span>
              ) : (
                <Button
                  variant="quiet"
                  size="sm"
                  className={menuStyles.pasteIssueLineButton}
                  aria-label={t("quizshow:studio.paste.selectLine", {
                    line: issue.line,
                  })}
                  onClick={() => onSelectLine(issue.line)}
                >
                  {t("quizshow:studio.paste.issueLine", { line: issue.line })}
                </Button>
              )}
              <div className={menuStyles.pasteIssueReason}>
                <QuizshowPasteIssueReason issue={issue} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}

/** "Show the format": the full syntax behind a toggle, so a short dialog head leaves the textarea and the count in view. */
function QuizshowPasteFormatHelp() {
  const { t } = useTranslation();
  const helpId = useId();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Button
        variant="stage-ghost"
        size="sm"
        aria-expanded={isOpen}
        aria-controls={helpId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {t(
          isOpen
            ? "quizshow:studio.paste.formatHide"
            : "quizshow:studio.paste.formatShow",
        )}
        <FiChevronDown
          aria-hidden
          fill="none"
          className={`${menuStyles.pasteFormatChevron} ${isOpen ? menuStyles.pasteFormatChevronOpen : ""}`}
        />
      </Button>
      <Collapse isOpen={isOpen}>
        <p id={helpId} className={menuStyles.pasteFormatHelp}>
          {t("quizshow:studio.paste.formatHelp")}
        </p>
      </Collapse>
    </div>
  );
}

/** The pasted text or the chosen file, read into rounds, with every issue (limits included) by line. */
function useQuizshowPasteImport(pastedText: string, chosen: ChosenCsv | null) {
  const { controller } = useQuizshowStudio();
  const { draft } = controller;
  // Typing stays quick in a long paste: the parse follows a beat behind.
  const deferredText = useDeferredValue(pastedText);
  const result = useMemo(
    () =>
      chosen === null
        ? parsePastedQuestions(deferredText, draft.languages)
        : parseQuizCsv(chosen.text, draft.languages),
    [chosen, deferredText, draft.languages],
  );
  const issues = useMemo(
    () =>
      [...result.issues, ...importLimitIssuesOf(draft, result.rounds)].sort(
        (first, second) => first.line - second.line,
      ),
    [result, draft],
  );
  const questionCount = importedQuestionCountOf(result.rounds);
  const isAddAllowed =
    questionCount > 0 &&
    issues.length === 0 &&
    deferredText === pastedText &&
    controller.replaceDraft !== undefined;
  /** Adds the rounds to the draft as it is when the update runs; null when nothing may be added. */
  const add = (): QuizshowPasteAdded | null => {
    if (!isAddAllowed) return null;
    const captured: { draftBefore: QuizshowDraft | null } = {
      draftBefore: null,
    };
    controller.replaceDraft?.(
      (current) => {
        // A save adopted since the last render can leave no room: then nothing is added.
        if (importLimitIssuesOf(current, result.rounds).length > 0) {
          return current;
        }
        captured.draftBefore = current;
        return withImportedRounds(current, result.rounds);
      },
      chosen === null ? "paste" : "csv",
    );
    return { questionCount, draftBeforeOf: () => captured.draftBefore };
  };
  return { result, issues, questionCount, isAddAllowed, add };
}

/**
 * Paste questions (item 22): a textarea in the paste grammar or a CSV file,
 * a live count, the issues to fix, and "Add these questions", which adds
 * the rounds in one undo step. Any issue, a limit included, adds nothing.
 */
export function QuizshowPasteDialog({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  /** Shows the added toast from a component that outlives the dialog; see `useQuizshowPasteAddedToast`. */
  onAdded: (added: QuizshowPasteAdded) => void;
}) {
  const { t, language } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const summaryId = useId();
  const issuesId = useId();
  const [pastedText, setPastedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const csv = useChosenCsv();
  const pasteImport = useQuizshowPasteImport(pastedText, csv.chosen);
  const { issues, questionCount } = pasteImport;
  const isAtTextLimit = pastedText.length >= QUIZSHOW_PASTE_TEXT_MAX;

  const handleAdd = () => {
    const added = pasteImport.add();
    if (added === null) return;
    onAdded(added);
    onClose();
  };

  // An issue adds nothing, so the summary points at the issues (their box holds the count); "Nothing to add yet" is for a text with no issue.
  const summary =
    issues.length > 0
      ? t("quizshow:studio.paste.fixToAdd")
      : questionCount === 0
        ? t("quizshow:studio.paste.empty")
        : t("quizshow:studio.paste.summary", {
            count: questionCount,
            rounds: t("quizshow:studio.paste.roundCount", {
              count: pasteImport.result.rounds.length,
            }),
          });
  const settledSummary = useDebouncedValue(summary, STATUS_SETTLE_MS);

  return (
    <Modal
      title={t("quizshow:studio.paste.title")}
      sub={t("quizshow:studio.paste.sub")}
      onClose={onClose}
      className={lobbyStyles.stageDialog}
      wide
      footer={
        <div className={lobbyStyles.footer}>
          <Button variant="stage-ghost" onClick={onClose}>
            {t("shared:confirmDialog.cancel")}
          </Button>
          <Button
            variant="stage"
            aria-disabled={!pasteImport.isAddAllowed}
            aria-describedby={
              issues.length > 0 ? `${summaryId} ${issuesId}` : summaryId
            }
            onClick={handleAdd}
          >
            {t("quizshow:studio.paste.submit")}
          </Button>
        </div>
      }
    >
      <div className={lobbyStyles.form} ref={darkDialogRef}>
        <QuizshowPasteFormatHelp />
        <Collapse isOpen={csv.chosen === null}>
          <FormField
            className={menuStyles.pasteText}
            label={t("quizshow:studio.paste.textLabel")}
          >
            <textarea
              ref={textareaRef}
              value={pastedText}
              placeholder={t("quizshow:studio.paste.placeholder")}
              spellCheck={false}
              rows={10}
              maxLength={QUIZSHOW_PASTE_TEXT_MAX}
              onChange={(event) => setPastedText(event.target.value)}
            />
          </FormField>
          <div role="status">
            <Collapse isOpen={isAtTextLimit}>
              <p className={menuStyles.pasteNote}>
                <FiInfo aria-hidden fill="none" />
                {t("quizshow:studio.paste.textLimitReached", {
                  max: QUIZSHOW_PASTE_TEXT_MAX.toLocaleString(
                    language === "pt" ? "pt-PT" : "en-GB",
                  ),
                })}
              </p>
            </Collapse>
          </div>
        </Collapse>
        <QuizshowPasteFileField csv={csv} />
        <p id={summaryId} className={menuStyles.pasteSummary} aria-hidden>
          {summary}
        </p>
        <p className={styles.visuallyHidden} role="status">
          {settledSummary}
        </p>
        <QuizshowPasteIssues
          issues={issues}
          id={issuesId}
          onSelectLine={
            csv.chosen === null
              ? (line) => {
                  if (textareaRef.current !== null) {
                    selectLineIn(textareaRef.current, pastedText, line);
                  }
                }
              : undefined
          }
        />
      </div>
    </Modal>
  );
}
