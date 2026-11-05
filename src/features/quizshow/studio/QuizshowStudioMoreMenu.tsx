import { useState } from "react";
import { AnimatePresence } from "motion/react";
import type { IconType } from "react-icons";
import {
  FiCommand,
  FiCopy,
  FiLayout,
  FiMonitor,
  FiMoreHorizontal,
  FiPlay,
  FiRotateCcw,
  FiSend,
  FiSmartphone,
} from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowDryRun } from "../builder/QuizshowDryRun";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import {
  isQuizshowSessionScope,
  quizshowScopeRemotePath,
  quizshowScopeScreenPath,
} from "../quizshowScope";
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

/** "Replace with a template" and "Replace with another quiz", on an event or a game that holds a quiz. */
function replaceEntriesOf(
  studio: QuizshowStudioContextValue,
  t: Translate,
  onOpenPicker: (picker: QuizshowImportPicker) => void,
): QuizshowStudioMenuEntry[] {
  if (studio.start.sessionScope === null || !studio.hasQuiz) return [];
  return [
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

/** The top bar's More menu: the page's own actions, the folded bar on a narrow screen, and the shortcuts sheet. */
export function QuizshowStudioMoreMenu({
  moreActions,
  onShowShortcuts,
}: {
  moreActions: readonly QuizshowStudioMoreAction[];
  onShowShortcuts: () => void;
}) {
  const { t } = useTranslation();
  const studio = useQuizshowStudio();
  const menu = useStudioMenuAnchor();
  const isBarRoomy = useIsStudioBarRoomy();
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const [replacePicker, setReplacePicker] =
    useState<QuizshowImportPicker | null>(null);

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
    // From 1024px to 1366px a live template's Unpublish leaves the bar for here.
    studio.isWide && !isBarRoomy && studio.templateMeta?.status === "published"
      ? publishEntriesOf(studio, t)
      : [],
    replaceEntriesOf(studio, t, setReplacePicker),
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
    </>
  );
}
