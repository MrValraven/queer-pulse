import { useContext, useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowResultsPodiumEntry,
  QuizshowResultsResponse,
} from "../../../shared/contracts/quizshow";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { Sending } from "../../../shared/components/ui/Spinner";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { SkeletonCard } from "../../../shared/components/ui/Skeleton";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeleteQuizshowResults } from "../api/useQuizshowMutations";
import { useQuizshowResults } from "../api/useQuizshowResults";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";
import { useQuizshowGameResultsActions } from "../games/useQuizshowGameActions";
import { QuizshowShape } from "../QuizshowShape";
import { QuizshowResultsWinBadges } from "../winBadges/QuizshowResultsWinBadges";
import type { QuizshowSessionScope } from "../quizshowScope";
import { QuizshowStudioContext } from "../studio/QuizshowStudioContext";
import { QuizshowRecap } from "./QuizshowRecap";
import styles from "./QuizshowEvent.module.css";

function PodiumRow({ entry }: { entry: QuizshowResultsPodiumEntry }) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <li className={styles.podiumRow} data-mine={entry.isMine || undefined}>
      <span className={styles.podiumPlace}>
        {t(`quizshow:results.place.${entry.place}`)}
      </span>
      {entry.colorKey !== null && (
        <QuizshowShape colorKey={entry.colorKey} size="small" label={null} />
      )}
      <span className={styles.podiumName}>{entry.name}</span>
      <span className={styles.podiumScore}>
        {t("quizshow:common.points", { points: format.number(entry.score) })}
      </span>
    </li>
  );
}

function OwnPlacing({ results }: { results: QuizshowResultsResponse }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { me } = results;
  if (me === null) return null;
  const total =
    me.teamName !== null
      ? (results.teamCount ?? results.playerCount)
      : results.playerCount;
  const placing =
    me.teamName !== null
      ? t("quizshow:results.meTeam", {
          team: me.teamName,
          place: me.place,
          total,
        })
      : t("quizshow:results.me", { place: me.place, total });
  return (
    <p className={styles.ownPlacing}>
      {me.teamColorKey !== null && (
        <QuizshowShape colorKey={me.teamColorKey} size="small" label={null} />
      )}
      <span>{placing}</span>
      <span className={styles.ownScore}>
        {t("quizshow:results.myScore", { points: format.number(me.score) })}
      </span>
    </p>
  );
}

/** Nothing waits to be saved outside the studio. */
const NOTHING_TO_SAVE = (): Promise<string | null> => Promise.resolve(null);

/**
 * Duplicate and open (item 60): on a game page the results panel leads with
 * it. It lands the studio's autosave first, like Duplicate game in More.
 */
function DuplicateAndOpenButton() {
  const { t } = useTranslation();
  const gameResults = useQuizshowGameResultsActions();
  const studio = useContext(QuizshowStudioContext);
  if (gameResults === null) return null;
  const { isDuplicatePending } = gameResults;
  const label = t("quizshow:game.duplicateAndOpen");
  return (
    <Button
      variant="stage"
      size="sm"
      aria-busy={isDuplicatePending ? true : undefined}
      aria-disabled={isDuplicatePending ? true : undefined}
      onClick={() => {
        if (isDuplicatePending) return;
        gameResults.duplicateAndOpen(studio?.save.saveFirst ?? NOTHING_TO_SAVE);
      }}
    >
      {isDuplicatePending ? <Sending label={label} /> : label}
    </Button>
  );
}

function ResultsBody({
  results,
  scope,
  canDelete,
  isFlat,
  onDelete,
}: {
  results: QuizshowResultsResponse;
  scope: QuizshowSessionScope;
  canDelete: boolean;
  /** In the studio's results panel: no card surface, and the panel's title stands in for this heading. */
  isFlat: boolean;
  onDelete: () => void;
}) {
  const { t, language } = useTranslation();
  const recapId = useId();
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const winBadges = results.winBadges ?? null;
  const counts = [
    t("quizshow:results.players", { count: results.playerCount }),
    ...(results.teamCount !== null
      ? [t("quizshow:results.teams", { count: results.teamCount })]
      : []),
  ].join(" · ");
  return (
    <section
      className={isFlat ? styles.resultsFlat : styles.results}
      aria-labelledby={isFlat ? undefined : `${recapId}-title`}
    >
      {!isFlat && (
        <h2 id={`${recapId}-title`} className={styles.resultsTitle}>
          {t("quizshow:results.title")}
        </h2>
      )}
      <ol className={styles.podium} aria-label={t("quizshow:results.podium")}>
        {results.podium.map((entry) => (
          <PodiumRow key={`${entry.place}-${entry.name}`} entry={entry} />
        ))}
      </ol>
      <OwnPlacing results={results} />
      <p className={styles.counts}>{counts}</p>
      {winBadges ? <QuizshowResultsWinBadges winBadges={winBadges} /> : null}
      <div className={styles.resultsActions}>
        <DuplicateAndOpenButton />
        {results.recap !== null && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={isRecapOpen}
            aria-controls={recapId}
            onClick={() => setIsRecapOpen((isOpen) => !isOpen)}
          >
            {t(
              isRecapOpen
                ? "quizshow:results.recap.hide"
                : "quizshow:results.recap.show",
            )}
            <FiChevronDown
              aria-hidden="true"
              fill="none"
              className={styles.toggleChevron}
              data-is-open={isRecapOpen}
            />
          </Button>
        )}
        {canDelete && (
          <Button
            variant={isFlat ? "ghost-dark" : "ghost"}
            size="sm"
            className={isFlat ? styles.resultsDeleteInStudio : undefined}
            onClick={onDelete}
          >
            {t("quizshow:results.delete")}
          </Button>
        )}
      </div>
      {results.recap !== null && (
        <div id={recapId}>
          <Collapse isOpen={isRecapOpen}>
            <QuizshowRecap
              recap={results.recap}
              language={language}
              scope={scope}
            />
          </Collapse>
        </div>
      )}
    </section>
  );
}

/** The kept podium and the viewer's own placing; organisers also get the recap
 *  and Delete results. Renders nothing once the results are gone. */
export function QuizshowResultsCard({
  scope,
  canDelete,
  isInDarkStudio = false,
}: {
  scope: QuizshowSessionScope;
  canDelete: boolean;
  /**
   * In the dark studio's results panel: no card surface (the panel is the
   * surface and its title names the results), a caution-toned ghost Delete
   * results, and a delete confirm that turns dark too (it portals to the body).
   */
  isInDarkStudio?: boolean;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  const { showToast } = useToast();
  const query = useQuizshowResults(scope, { isEnabled: true });
  const deleteResults = useDeleteQuizshowResults(scope);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;

  const confirmDelete = async () => {
    try {
      await deleteResults.mutateAsync();
      setIsDeleted(true);
      setIsConfirming(false);
      showToast(t("quizshow:results.deleted"), "success");
    } catch (error) {
      setIsConfirming(false);
      showToast(t(quizshowErrorKeyOf(quizshowErrorCodeOf(error))), "error");
    }
  };

  let body;
  if (query.data) {
    body = (
      <ResultsBody
        results={query.data}
        scope={scope}
        canDelete={canDelete}
        isFlat={isInDarkStudio}
        onDelete={() => setIsConfirming(true)}
      />
    );
  } else if (query.isError) {
    body = (
      <div
        className={isInDarkStudio ? styles.resultsFlat : styles.results}
        role="alert"
      >
        <p>{t("quizshow:results.loadError")}</p>
        <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
          {t("quizshow:common.retry")}
        </Button>
      </div>
    );
  } else {
    body = <SkeletonCard />;
  }

  return (
    <>
      <Collapse isOpen={!isDeleted && !isNotFound}>{body}</Collapse>
      <ConfirmDialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={() => void confirmDelete()}
        title={t("quizshow:results.deleteTitle")}
        description={t("quizshow:results.deleteBody")}
        confirmLabel={t("quizshow:results.delete")}
        tone="destructive"
        loading={deleteResults.isPending}
      >
        {isInDarkStudio && <span ref={darkDialogRef} hidden />}
      </ConfirmDialog>
    </>
  );
}
