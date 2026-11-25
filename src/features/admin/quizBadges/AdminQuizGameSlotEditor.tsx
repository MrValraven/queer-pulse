import { useId, useRef, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
  Select,
} from "../../../shared/components/ui";
import type {
  QuizBadgeDefinitionDTO,
  QuizWinBadgeChip as QuizWinBadgeChipDTO,
} from "../../../shared/contracts/quizWinBadges";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizWinBadgeChip } from "../../quizshow/winBadges/QuizWinBadgeChip";
import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import { AdminChip } from "../ui";
import styles from "./AdminQuizEventBadges.module.css";

/**
 * Where the badge library stands for the pickers: `loaded` holds at least one
 * live badge, `empty` holds none, `failed` could not be read (the page names
 * that failure above the games).
 */
export type QuizSlotLibraryStatus = "loaded" | "empty" | "failed";

interface AdminQuizGameSlotEditorProps {
  gameNumber: number;
  badges: readonly QuizWinBadgeChipDTO[];
  isFinished: boolean;
  /** Live badges this game does not give yet. */
  attachable: readonly QuizBadgeDefinitionDTO[];
  limit: number;
  onAttach: (definitionId: string) => void;
  onRemove: (definitionId: string) => void;
  /** Defaults to `loaded`. */
  libraryStatus?: QuizSlotLibraryStatus;
  /** The draft takes a badge off this played game: the keeps-wins note shows. */
  hasRemovedFromPlayedGame?: boolean;
}

/**
 * One game's badges in the event setup: its chips with a remove button each,
 * and a picker that attaches a live badge while the game holds fewer than its
 * limit. A full game says so; a game with nothing left to attach says why. A
 * played game that loses a badge in the draft says its wins stay.
 * Focus follows the edits: a remove lands on the next remove button, the
 * previous one, or the heading; the attach that fills the game lands on the
 * heading.
 */
export function AdminQuizGameSlotEditor({
  gameNumber,
  badges,
  isFinished,
  attachable,
  limit,
  onAttach,
  onRemove,
  libraryStatus = "loaded",
  hasRemovedFromPlayedGame = false,
}: AdminQuizGameSlotEditorProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFull = badges.length >= limit;
  const hasAttachable = attachable.length > 0;
  const isNothingToAttach = !isFull && !hasAttachable;

  const attach = (definitionId: string) => {
    onAttach(definitionId);
    // The picker folds away once the game is full, so focus moves up.
    if (badges.length + 1 >= limit) {
      requestAnimationFrame(() => headingRef.current?.focus());
    }
  };

  return (
    <section className={styles.gameCard} aria-labelledby={headingId}>
      <div className={styles.gameHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.gameTitle}
        >
          {t("quizshow:winBadges.admin.setup.game", { number: gameNumber })}
        </h2>
        {isFinished && (
          <AdminChip tone="jade">
            {t("quizshow:winBadges.admin.setup.finishedTag")}
          </AdminChip>
        )}
      </div>

      <SlotChips
        gameNumber={gameNumber}
        badges={badges}
        headingRef={headingRef}
        onRemove={onRemove}
      />
      <Collapse isOpen={hasRemovedFromPlayedGame}>
        <p className={styles.note}>
          {t("quizshow:winBadges.admin.setup.removeKeepsWins")}
        </p>
      </Collapse>

      <Collapse isOpen={!isFull && hasAttachable}>
        <AttachPicker
          gameNumber={gameNumber}
          attachable={attachable}
          onAttach={attach}
        />
      </Collapse>
      <Collapse isOpen={isNothingToAttach && libraryStatus === "empty"}>
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.setup.noLibrary")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className={styles.libraryLink}
          to={routes.adminQuizshowBadges}
        >
          <FiArrowRight aria-hidden fill="none" />
          {t("quizshow:winBadges.admin.setup.libraryLink")}
        </Button>
      </Collapse>
      <Collapse isOpen={isNothingToAttach && libraryStatus === "loaded"}>
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.setup.allAttached")}
        </p>
      </Collapse>
      <Collapse isOpen={isFull}>
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.setup.full", { limit })}
        </p>
      </Collapse>
    </section>
  );
}

function SlotChips({
  gameNumber,
  badges,
  headingRef,
  onRemove,
}: {
  gameNumber: number;
  badges: readonly QuizWinBadgeChipDTO[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRemove: (definitionId: string) => void;
}) {
  const { t, language } = useTranslation();
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());

  const remove = (definitionId: string) => {
    const index = badges.findIndex(
      (badge) => badge.definitionId === definitionId,
    );
    const neighbour = badges[index + 1] ?? badges[index - 1];
    onRemove(definitionId);
    requestAnimationFrame(() => {
      const target =
        neighbour === undefined
          ? undefined
          : removeButtons.current.get(neighbour.definitionId);
      (target ?? headingRef.current)?.focus();
    });
  };

  return (
    <>
      <ul className={styles.slotList}>
        <AnimatePresence initial={false}>
          {badges.map((badge) => (
            <CollapseListItem key={badge.definitionId}>
              <div className={styles.slotRow}>
                <div className={styles.slotChip}>
                  <QuizWinBadgeChip badge={badge} size="md" />
                  {badge.isArchived && (
                    <AdminChip tone="ghost">
                      {t("quizshow:winBadges.admin.library.archivedTag")}
                    </AdminChip>
                  )}
                </div>
                <IconButton
                  size="sm"
                  ref={(button: HTMLButtonElement | null) => {
                    if (button) {
                      removeButtons.current.set(badge.definitionId, button);
                    } else {
                      removeButtons.current.delete(badge.definitionId);
                    }
                  }}
                  aria-label={t("quizshow:winBadges.admin.setup.removeAria", {
                    name: quizBadgeTextIn(badge.name, language),
                    number: gameNumber,
                  })}
                  onClick={() => remove(badge.definitionId)}
                >
                  <FiX aria-hidden fill="none" />
                </IconButton>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={badges.length === 0}>
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.setup.empty")}
        </p>
      </Collapse>
    </>
  );
}

function AttachPicker({
  gameNumber,
  attachable,
  onAttach,
}: {
  gameNumber: number;
  attachable: readonly QuizBadgeDefinitionDTO[];
  onAttach: (definitionId: string) => void;
}) {
  const { t, language } = useTranslation();
  const options = attachable
    .map((definition) => ({
      value: definition.id,
      label: quizBadgeTextIn(definition.name, language),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, language));
  return (
    <Select
      size="sm"
      value={null}
      options={options}
      placeholder={t("quizshow:winBadges.admin.setup.attach")}
      label={t("quizshow:winBadges.admin.setup.pickerLabel", {
        number: gameNumber,
      })}
      onChange={(definitionId) => {
        if (definitionId !== null) onAttach(definitionId);
      }}
    />
  );
}
