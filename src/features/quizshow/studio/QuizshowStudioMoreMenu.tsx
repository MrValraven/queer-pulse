import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiClipboard,
  FiCommand,
  FiCopy,
  FiDownload,
  FiEye,
  FiFileText,
  FiLayers,
  FiLayout,
  FiMonitor,
  FiMoreHorizontal,
  FiPlay,
  FiPlusSquare,
  FiPrinter,
  FiRotateCcw,
  FiSend,
  FiSmartphone,
} from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { IconButton } from "../../../shared/components/ui";
import type { QuizshowSourceTemplateRef } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowDryRun } from "../builder/QuizshowDryRun";
import { csvSeparatorForLanguage } from "../builder/quizshowCsv";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import { quizshowPrintPath, type QuizshowPrintSheet } from "../quizshowPaths";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import {
  isQuizshowSessionScope,
  quizshowScopeRemotePath,
  quizshowScopeScreenPath,
  type QuizshowSessionScope,
} from "../quizshowScope";
import { QuizshowPasteDialog } from "./QuizshowPasteDialog";
import {
  useQuizshowStudio,
  type QuizshowStudioContextValue,
} from "./QuizshowStudioContext";
import {
  QuizshowStudioMenu,
  type QuizshowStudioMenuEntry,
} from "./QuizshowStudioMenu";
import { QuizshowStudioReplacePickers } from "./QuizshowStudioReplacePickers";
import { useIsStudioBarRoomy } from "./useIsStudioWide";
import { useStudioMenuAnchor } from "./useStudioMenuAnchor";
import { useQuizshowPasteAddedToast } from "./useQuizshowPasteAddedToast";
import {
  downloadQuizCsvWithNote,
  historyEntriesOf,
  openQuizshowPrintSheet,
} from "./quizshowStudioTools";
import styles from "./QuizshowStudioTopBar.module.css";

/** What a page action may ask of the studio when it runs. */
export interface QuizshowStudioMoreActionContext {
  /** Lands the autosave first; see `QuizshowStudioSave.saveFirst`. */
  saveFirst: () => Promise<string | null>;
}

/** An action the page adds to More (Duplicate game, Delete game, Results). */
export interface QuizshowStudioMoreAction {
  key: string;
  labelKey: string;
  icon: IconType;
  /** Additive: the studio passes its context; an action that needs none ignores it. */
  onSelect: (studio: QuizshowStudioMoreActionContext) => void;
  isDestructive?: boolean;
}

type Translate = ReturnType<typeof useTranslation>["t"];

/** The saved quiz's template after a newer publish, and how to open its preview (C6.25). */
export interface QuizshowStudioTemplateChanges {
  sourceTemplate: QuizshowSourceTemplateRef;
  onOpen: () => void;
}

/**
 * Below 1024px the bar has no room for the "Based on" line, so More carries
 * "See what changed" with "Based on {title}" as its hint.
 */
function templateChangesEntriesOf(
  studio: QuizshowStudioContextValue,
  t: Translate,
  templateChanges: QuizshowStudioTemplateChanges | null,
): QuizshowStudioMenuEntry[] {
  if (studio.isWide || templateChanges === null) return [];
  return [
    {
      key: "seeWhatChanged",
      label: t("quizshow:studio.seeWhatChanged"),
      description: t("quizshow:studio.basedOn", {
        title: templateCardTitleOf(
          templateChanges.sourceTemplate.title,
          studio.viewLanguage,
        ),
      }),
      icon: FiEye,
      onSelect: templateChanges.onOpen,
    },
  ];
}

/** A template's Publish or Unpublish as a More entry. */
function publishEntriesOf(
  studio: QuizshowStudioContextValue,
  t: Translate,
): QuizshowStudioMenuEntry[] {
  const { publishing, templateMeta } = studio;
  if (publishing === null || templateMeta === null) return [];
  const isPublished = templateMeta.status === "published";
  return [
    {
      key: "publish",
      label: t(
        isPublished
          ? "quizshow:templates.unpublish"
          : "quizshow:templates.publish",
      ),
      icon: FiSend,
      isDisabled:
        publishing.isPending ||
        (!isPublished && publishing.blockedReasonKey !== null),
      disabledReason: publishing.blockedReasonKey
        ? t(publishing.blockedReasonKey)
        : undefined,
      onSelect: isPublished ? publishing.unpublish : publishing.publish,
    },
  ];
}

/**
 * Below 1024px the top bar keeps Open lobby (or a template's Save) and folds
 * the rest in here: Try it, the language you type in, the 18+ switch, the
 * live game's screen and remote, and a template's Publish and Discard changes.
 */
function foldedEntriesOf(
  studio: QuizshowStudioContextValue,
  t: Translate,
  onTryIt: () => void,
): QuizshowStudioMenuEntry[] {
  const { controller, viewLanguage, adults, data, scope } = studio;
  const entries: QuizshowStudioMenuEntry[] = [
    {
      key: "tryIt",
      label: t("quizshow:dryRun.open"),
      icon: FiPlay,
      isDisabled: studio.dryRunProblems.length > 0,
      disabledReason: t("quizshow:dryRun.blockedTitle"),
      onSelect: onTryIt,
    },
  ];
  if (controller.draft.languages === "both") {
    for (const language of ["en", "pt"] as const) {
      entries.push({
        key: `language-${language}`,
        label: t("quizshow:studio.typeIn", {
          language: t(`quizshow:language.${language}`),
        }),
        check: { role: "radio", isChecked: viewLanguage === language },
        onSelect: () => studio.setViewLanguage(language),
      });
    }
  }
  if (adults !== null) {
    const isLocked =
      adults.isAdultsEvent && adults.adultsRoundNumbers.length > 0;
    entries.push({
      key: "adults",
      label: t("quizshow:settings.adults.label"),
      check: { role: "checkbox", isChecked: adults.isAdultsEvent },
      isDisabled: isLocked,
      disabledReason: t("quizshow:settings.adults.locked", {
        count: adults.adultsRoundNumbers.length,
        rounds: adults.adultsRoundNumbers.join(", "),
      }),
      onSelect: () => adults.setIsAdultsOnly(!adults.isAdultsEvent),
    });
  }
  if (data.liveSession !== null && isQuizshowSessionScope(scope)) {
    entries.push(
      {
        key: "screen",
        label: t("quizshow:live.openScreen"),
        icon: FiMonitor,
        to: quizshowScopeScreenPath(scope),
        onSelect: () => undefined,
      },
      {
        key: "remote",
        label: t("quizshow:live.openRemote"),
        icon: FiSmartphone,
        to: quizshowScopeRemotePath(scope),
        onSelect: () => undefined,
      },
    );
  }
  entries.push(...publishEntriesOf(studio, t));
  if (studio.save.isExplicit && studio.save.isUnsaved) {
    entries.push({
      key: "discard",
      label: t("quizshow:save.discard"),
      icon: FiRotateCcw,
      isDisabled: studio.save.isSaving,
      onSelect: studio.save.discard,
    });
  }
  return entries;
}

/**
 * "Replace with a template" and "Replace with another quiz", on an event or a
 * game that holds a quiz; with rounds to add after, "Add rounds from a
 * template" and "Add rounds from another quiz" (item 23) open the same
 * pickers in append mode.
 */
function replaceEntriesOf(
  studio: QuizshowStudioContextValue,
  t: Translate,
  onOpenPicker: (picker: QuizshowImportPicker) => void,
): QuizshowStudioMenuEntry[] {
  if (studio.start.sessionScope === null || !studio.hasQuiz) return [];
  const appendEntries: QuizshowStudioMenuEntry[] =
    studio.controller.draft.rounds.length > 0
      ? [
          {
            key: "addFromTemplate",
            label: t("quizshow:studio.more.addFromTemplate"),
            icon: FiLayers,
            onSelect: () => onOpenPicker("templateAppend"),
          },
          {
            key: "addFromCopy",
            label: t("quizshow:studio.more.addFromCopy"),
            icon: FiPlusSquare,
            onSelect: () => onOpenPicker("sourcesAppend"),
          },
        ]
      : [];
  return [
    ...appendEntries,
    {
      key: "replaceFromTemplate",
      label: t("quizshow:studio.more.replaceFromTemplate"),
      icon: FiLayout,
      onSelect: () => onOpenPicker("template"),
    },
    {
      key: "replaceFromCopy",
      label: t("quizshow:studio.more.replaceFromCopy"),
      icon: FiCopy,
      onSelect: () => onOpenPicker("sources"),
    },
  ];
}

type ShowToast = ReturnType<typeof useToast>["showToast"];

/** What the quiz tools need besides the studio: copy, toasts and the paste dialog. */
interface QuizToolHandlers {
  t: Translate;
  /** The app language, which picks the CSV separator. */
  language: string;
  showToast: ShowToast;
  onOpenPaste: () => void;
  /** Demo mode: the print sheet opens in this tab (see openQuizshowPrintSheet). */
  navigateInTab?: (path: string) => void;
}

function openPrintSheet(
  studio: QuizshowStudioContextValue,
  scope: QuizshowSessionScope,
  sheet: QuizshowPrintSheet,
  { t, showToast, navigateInTab }: QuizToolHandlers,
): void {
  openQuizshowPrintSheet({
    path: quizshowPrintPath(scope, sheet),
    save: studio.save,
    copy: {
      tabBlocked: t("quizshow:studio.print.tabBlocked"),
      saveFailed: t("quizshow:studio.print.saveFailed"),
    },
    showToast,
    navigateInTab,
  });
}

/**
 * Paste questions and Download as CSV on any quiz, and the two print sheets
 * on an event or a game (item 22, item 62).
 */
function quizToolEntriesOf(
  studio: QuizshowStudioContextValue,
  handlers: QuizToolHandlers,
): QuizshowStudioMenuEntry[] {
  if (!studio.hasQuiz) return [];
  const { t, onOpenPaste } = handlers;
  const { scope, controller } = studio;
  const entries: QuizshowStudioMenuEntry[] = [];
  if (controller.replaceDraft !== undefined) {
    entries.push({
      key: "paste",
      label: t("quizshow:studio.paste.open"),
      icon: FiClipboard,
      onSelect: onOpenPaste,
    });
  }
  entries.push({
    key: "downloadCsv",
    label: t("quizshow:studio.csv.download"),
    icon: FiDownload,
    onSelect: () =>
      downloadQuizCsvWithNote(
        controller.draft,
        {
          fallbackFileName: t("quizshow:studio.csv.untitledFile"),
          downloadedTitle: t("quizshow:studio.csv.downloaded"),
          keepsDetail: t("quizshow:studio.csv.keeps"),
          separator: csvSeparatorForLanguage(handlers.language),
        },
        handlers.showToast,
      ),
  });
  if (isQuizshowSessionScope(scope)) {
    entries.push(
      {
        key: "printHost",
        label: t("quizshow:studio.print.host"),
        icon: FiPrinter,
        onSelect: () => openPrintSheet(studio, scope, "host", handlers),
      },
      {
        key: "printAnswers",
        label: t("quizshow:studio.print.answers"),
        icon: FiFileText,
        onSelect: () => openPrintSheet(studio, scope, "answers", handlers),
      },
    );
  }
  return entries;
}

/** The top bar's More menu: the page's own actions, the folded bar on a narrow screen, and the shortcuts sheet. */
export function QuizshowStudioMoreMenu({
  moreActions,
  onShowShortcuts,
  templateChanges = null,
}: {
  moreActions: readonly QuizshowStudioMoreAction[];
  onShowShortcuts: () => void;
  /** Additive (C6.25). The saved quiz's template has a newer publish; null otherwise. */
  templateChanges?: QuizshowStudioTemplateChanges | null;
}) {
  const { t, language } = useTranslation();
  const studio = useQuizshowStudio();
  const menu = useStudioMenuAnchor();
  const isBarRoomy = useIsStudioBarRoomy();
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const [replacePicker, setReplacePicker] =
    useState<QuizshowImportPicker | null>(null);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  // Here, so the toast outlives the dialog and a Cmd/Ctrl+Z takes it down.
  const showPasteAddedToast = useQuizshowPasteAddedToast();

  const pageEntries: QuizshowStudioMenuEntry[] = moreActions.map((action) => ({
    key: action.key,
    label: t(action.labelKey),
    icon: action.icon,
    isDestructive: action.isDestructive,
    onSelect: () => action.onSelect({ saveFirst: studio.save.saveFirst }),
  }));
  const groups: QuizshowStudioMenuEntry[][] = [
    studio.isWide
      ? []
      : foldedEntriesOf(studio, t, () => setIsDryRunOpen(true)),
    historyEntriesOf(studio, t),
    templateChangesEntriesOf(studio, t, templateChanges),
    // From 1024px to 1366px a live template's Unpublish leaves the bar for here.
    studio.isWide && !isBarRoomy && studio.templateMeta?.status === "published"
      ? publishEntriesOf(studio, t)
      : [],
    replaceEntriesOf(studio, t, setReplacePicker),
    quizToolEntriesOf(studio, {
      t,
      language,
      showToast,
      onOpenPaste: () => setIsPasteOpen(true),
      navigateInTab: demoMode ? (path) => void navigate(path) : undefined,
    }),
    pageEntries,
    studio.isWide
      ? [
          {
            key: "shortcuts",
            label: t("quizshow:studio.shortcuts.open"),
            icon: FiCommand,
            onSelect: onShowShortcuts,
          },
        ]
      : [],
  ];
  const entries = groups
    .filter((group) => group.length > 0)
    .flatMap((group, groupIndex) =>
      groupIndex === 0
        ? group
        : [
            { key: `separator-${groupIndex}`, kind: "separator" as const },
            ...group,
          ],
    );

  return (
    <>
      <IconButton
        tone="dark"
        className={styles.moreButton}
        aria-label={t("quizshow:studio.more")}
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        onClick={(event) => menu.toggleFrom(event.currentTarget)}
      >
        <FiMoreHorizontal aria-hidden />
      </IconButton>
      <QuizshowStudioMenu
        label={t("quizshow:studio.more")}
        entries={entries}
        anchor={menu.anchor}
        onClose={menu.close}
      />
      {studio.hasQuiz && (
        <QuizshowStudioReplacePickers
          picker={replacePicker}
          onPickerChange={setReplacePicker}
        />
      )}
      <AnimatePresence>
        {isDryRunOpen && (
          <QuizshowDryRun
            key="studio-more-dry-run"
            draft={studio.controller.draft}
            pickedPreviewUrls={studio.controller.pickedPreviewUrls}
            onClose={() => setIsDryRunOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPasteOpen && (
          <QuizshowPasteDialog
            key="studio-more-paste"
            onClose={() => setIsPasteOpen(false)}
            onAdded={showPasteAddedToast}
          />
        )}
      </AnimatePresence>
    </>
  );
}
