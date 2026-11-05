import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import type { QuizshowGameListResponse } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowGames } from "../api/useQuizshowGames";
import { QuizshowPickerFade } from "../builder/QuizshowTemplatePicker";
import { QuizshowGameRow } from "./QuizshowGameRow";
import {
  QuizshowGamesEmptyState,
  type QuizshowNewGameStart,
} from "./QuizshowGamesEmptyState";
import { QuizshowNewGameDialog } from "./QuizshowNewGameDialog";
import styles from "./QuizshowGames.module.css";

const SKELETON_CARD_KEYS = ["first-card", "second-card"] as const;
const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Two cards shaped like game cards (cover, title, a tag), so the list lands without a jump. */
function GameCardsSkeleton() {
  const { reducedMotion } = useMotionPrefs();
  return (
    <div
      aria-hidden
      className={`${styles.list} ${reducedMotion ? "" : styles.skeletonPulse}`}
    >
      {SKELETON_CARD_KEYS.map((cardKey) => (
        <div key={cardKey} className={styles.skeletonCard}>
          <div className={styles.skeletonCover} />
          <div className={styles.skeletonText}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonMeta} />
          </div>
        </div>
      ))}
    </div>
  );
}

function GameList({ list }: { list: QuizshowGameListResponse }) {
  return (
    <ul className={styles.list}>
      <AnimatePresence initial={false}>
        {list.games.map((game) => (
          <CollapseListItem key={game.id}>
            <QuizshowGameRow game={game} />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function MyGamesBody({
  onStartNewGame,
}: {
  onStartNewGame: (start: QuizshowNewGameStart) => void;
}) {
  const { t } = useTranslation();
  const games = useQuizshowGames({ isEnabled: true });
  if (games.data) {
    const hasGames = games.data.games.length > 0;
    return (
      <QuizshowPickerFade stateKey={hasGames ? "list" : "empty"}>
        {hasGames ? (
          <GameList list={games.data} />
        ) : (
          <QuizshowGamesEmptyState onStartNewGame={onStartNewGame} />
        )}
      </QuizshowPickerFade>
    );
  }
  if (games.isError) {
    return (
      <QuizshowPickerFade stateKey="error">
        <div className={styles.errorPanel} role="status">
          <FiAlertCircle
            aria-hidden
            fill="none"
            className={styles.errorPanelIcon}
          />
          <h3 className={styles.errorPanelTitle}>
            {t("quizshow:home.myGames.loadError")}
          </h3>
          <p className={styles.errorPanelBody}>{t("shared:loadError.body")}</p>
          <Button
            variant="stage"
            aria-disabled={games.isFetching || undefined}
            onClick={() => {
              if (!games.isFetching) void games.refetch();
            }}
          >
            {games.isFetching
              ? t("shared:loadError.retryingCta")
              : t("shared:loadError.retryCta")}
          </Button>
        </div>
      </QuizshowPickerFade>
    );
  }
  return (
    <QuizshowPickerFade stateKey="loading">
      <GameCardsSkeleton />
    </QuizshowPickerFade>
  );
}

/** The host's own games under the code form: a heading, New game, then the list or a way to start. */
export function QuizshowMyGames() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const titleId = useId();
  const games = useQuizshowGames({ isEnabled: true });
  // One dialog for every start, so a create that swaps the empty state for
  // the list never unmounts the open dialog mid-flight.
  const [openDialogStart, setOpenDialogStart] =
    useState<QuizshowNewGameStart | null>(null);
  const isAtLimit =
    games.data !== undefined && games.data.games.length >= games.data.limit;
  // The empty state offers every way to start, so the header button waits for a list.
  const isNewGameShown = games.data
    ? games.data.games.length > 0
    : games.isError;

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h2 id={titleId} className={styles.title}>
            {t("quizshow:home.myGames.title")}
          </h2>
          <p className={styles.sub}>{t("quizshow:home.myGames.sub")}</p>
        </div>
        <AnimatePresence initial={false}>
          {isNewGameShown && (
            <m.div
              key="new-game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.2,
                ease: FADE_EASE,
              }}
            >
              <Button
                variant="stage-ghost"
                aria-disabled={isAtLimit}
                onClick={() => {
                  if (!isAtLimit) setOpenDialogStart("blank");
                }}
              >
                <FiPlus aria-hidden fill="none" />
                {t("quizshow:home.myGames.new")}
              </Button>
            </m.div>
          )}
        </AnimatePresence>
      </header>
      <div role="status">
        <Collapse isOpen={isAtLimit}>
          <p className={styles.limitNote}>
            {t("quizshow:errors.game_limit_reached")}
          </p>
        </Collapse>
      </div>
      <div className={styles.body}>
        <MyGamesBody onStartNewGame={setOpenDialogStart} />
      </div>
      <QuizshowNewGameDialog
        isOpen={openDialogStart !== null}
        onClose={() => setOpenDialogStart(null)}
        shouldOpenSources={openDialogStart === "copy"}
      />
    </section>
  );
}
