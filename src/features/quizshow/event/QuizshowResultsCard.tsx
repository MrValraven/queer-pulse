import { useId, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowResultsPodiumEntry,
  QuizshowResultsResponse,
} from "../../../shared/contracts/quizshow";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { SkeletonCard } from "../../../shared/components/ui/Skeleton";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeleteQuizshowResults } from "../api/useQuizshowMutations";
import { useQuizshowResults } from "../api/useQuizshowResults";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { QuizshowShape } from "../QuizshowShape";
import type { QuizshowSessionScope } from "../quizshowScope";
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

function ResultsBody({
  results,
  canDelete,
  onDelete,
}: {
  results: QuizshowResultsResponse;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { t, language } = useTranslation();
  const recapId = useId();
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const counts = [
    t("quizshow:results.players", { count: results.playerCount }),
    ...(results.teamCount !== null
      ? [t("quizshow:results.teams", { count: results.teamCount })]
      : []),
  ].join(" · ");
  return (
    <section className={styles.results} aria-labelledby={`${recapId}-title`}>
      <h2 id={`${recapId}-title`} className={styles.resultsTitle}>
        {t("quizshow:results.title")}
      </h2>
      <ol className={styles.podium} aria-label={t("quizshow:results.podium")}>
        {results.podium.map((entry) => (
          <PodiumRow key={`${entry.place}-${entry.name}`} entry={entry} />
        ))}
      </ol>
      <OwnPlacing results={results} />
      <p className={styles.counts}>{counts}</p>
      <div className={styles.resultsActions}>
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
          </Button>
        )}
        {canDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            {t("quizshow:results.delete")}
          </Button>
        )}
      </div>
      {results.recap !== null && (
        <div id={recapId}>
          <Collapse isOpen={isRecapOpen}>
            <QuizshowRecap recap={results.recap} language={language} />
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
}: {
  scope: QuizshowSessionScope;
  canDelete: boolean;
}) {
  const { t } = useTranslation();
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
        canDelete={canDelete}
        onDelete={() => setIsConfirming(true)}
      />
    );
  } else if (query.isError) {
    body = (
      <div className={styles.results} role="alert">
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
      />
    </>
  );
}
