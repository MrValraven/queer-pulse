import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowHostState } from "../../../shared/contracts/quizshow";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import {
  QuizshowRemoteErrorLine,
  QuizshowRemoteFade,
} from "./QuizshowRemoteControls";
import { useQuizshowHostCommand } from "./useQuizshowHostCommand";
import styles from "./QuizshowRemote.module.css";

/** One written answer as the hosts see it, whichever phase it comes from. */
interface ReviewEntry {
  rowKey: string;
  answerId: string | null;
  optionId: string | null;
  text: string;
  authorName: string | null;
  isHidden: boolean;
  isTruth: boolean;
  voteCount: number | null;
}

const FAVOURITE_ROUND_KINDS = ["caption_this", "drag_name"] as const;

/** The review list in `review`, the vote options in `vote`, the authored entries at a party `reveal`. */
function reviewEntriesOf(state: QuizshowHostState): ReviewEntry[] {
  const { phase } = state.cursor;
  if (phase === "review") {
    return (state.reviewList?.submissions ?? []).map((submission) => ({
      rowKey: submission.answerId,
      answerId: submission.answerId,
      optionId: null,
      text: submission.text,
      authorName: submission.screenName,
      isHidden: submission.isHidden,
      isTruth: false,
      voteCount: null,
    }));
  }
  if (phase === "vote") {
    return (state.voteOptions?.options ?? []).map((option) => ({
      rowKey: option.optionId,
      answerId: option.answerId,
      optionId: option.optionId,
      text: option.text,
      authorName: option.authorName,
      isHidden: false,
      isTruth: option.isTruth,
      voteCount: null,
    }));
  }
  const distribution = state.reveal?.distribution;
  if (phase !== "reveal" || distribution?.kind !== "votes") return [];
  return distribution.entries.map((entry) => ({
    rowKey: entry.optionId,
    answerId: entry.answerId,
    optionId: entry.optionId,
    text: entry.text,
    authorName: entry.authorName,
    isHidden: false,
    isTruth: entry.isTruth,
    voteCount: entry.voteCount,
  }));
}

function ReviewRow({
  entry,
  actions,
}: {
  entry: ReviewEntry;
  actions: ReactNode;
}) {
  const { t } = useTranslation();
  const textId = `quizshow-review-${entry.rowKey}`;
  return (
    <div className={styles.row}>
      <div className={styles.rowBody}>
        <p
          id={textId}
          className={`${styles.rowText} ${entry.isHidden ? styles.rowHidden : ""}`}
        >
          {entry.text}
        </p>
        <p className={styles.rowMeta}>
          {entry.authorName !== null && <span>{entry.authorName}</span>}
          {entry.isTruth && (
            <span className={styles.tag}>{t("quizshow:stage.theTruth")}</span>
          )}
          <QuizshowRemoteFade fadeKey={entry.isHidden ? "hidden" : null}>
            <span className={styles.tag}>{t("quizshow:remote.hidden")}</span>
          </QuizshowRemoteFade>
          {entry.voteCount !== null && (
            <span className={styles.count}>
              {t("quizshow:stage.votes", { count: entry.voteCount })}
            </span>
          )}
        </p>
      </div>
      <div className={styles.rowActions}>{actions}</div>
    </div>
  );
}

/** Hosts check written answers: Hide in every phase, Show only in `review`, and the favourite at a Caption This or Drag Name reveal. */
export function QuizshowRemoteReview({
  controller,
  state,
}: {
  controller: QuizshowSessionController;
  state: QuizshowHostState;
}) {
  const { t } = useTranslation();
  const { run, isPending, lastErrorKey } = useQuizshowHostCommand(controller);
  const { phase, phaseId } = state.cursor;
  const entries = reviewEntriesOf(state);
  const distribution = state.reveal?.distribution;
  const favouriteOptionId =
    distribution?.kind === "votes" ? distribution.favouriteOptionId : null;
  const roundKind = state.round?.kind;
  const isFavouritePicking =
    phase === "reveal" &&
    FAVOURITE_ROUND_KINDS.some((kind) => kind === roundKind);
  const questionId = state.question?.questionId ?? state.reveal?.questionId;
  const isHideBusy = isPending("host:hideAnswer");
  const isFavouriteBusy = isPending("host:pickFavourite");

  const actionsFor = (entry: ReviewEntry): ReactNode => {
    const describedBy = `quizshow-review-${entry.rowKey}`;
    const { answerId, optionId } = entry;
    const isFavourite = optionId !== null && optionId === favouriteOptionId;
    const canPick =
      favouriteOptionId === null &&
      !entry.isTruth &&
      answerId !== null &&
      optionId !== null &&
      questionId !== undefined;
    let favouriteSlot: "favourite" | "pick" | null = null;
    if (isFavouritePicking && isFavourite) favouriteSlot = "favourite";
    else if (isFavouritePicking && canPick) favouriteSlot = "pick";
    let hideSlot: "hide" | "show" | null = null;
    if (answerId !== null && !entry.isHidden) hideSlot = "hide";
    else if (answerId !== null && phase === "review") hideSlot = "show";
    return (
      <>
        <QuizshowRemoteFade fadeKey={favouriteSlot}>
          {favouriteSlot === "favourite" ? (
            <span className={`${styles.tag} ${styles.tagAccent}`}>
              <FiStar aria-hidden="true" fill="currentColor" />
              {t("quizshow:remote.favourite")}
            </span>
          ) : (
            <Button
              variant="soft"
              size="md"
              aria-describedby={describedBy}
              aria-disabled={isFavouriteBusy}
              onClick={() => {
                if (isFavouriteBusy || optionId === null) return;
                if (questionId === undefined) return;
                void run("host:pickFavourite", {
                  phaseId,
                  questionId,
                  optionId,
                });
              }}
            >
              {t("quizshow:remote.pickFavourite")}
            </Button>
          )}
        </QuizshowRemoteFade>
        <QuizshowRemoteFade fadeKey={hideSlot}>
          <Button
            variant="ghost"
            size="md"
            aria-describedby={describedBy}
            aria-disabled={isHideBusy}
            onClick={() => {
              if (isHideBusy || answerId === null) return;
              void run("host:hideAnswer", {
                answerId,
                isHidden: hideSlot === "hide",
              });
            }}
          >
            {t(
              hideSlot === "show"
                ? "quizshow:remote.unhide"
                : "quizshow:remote.hide",
            )}
          </Button>
        </QuizshowRemoteFade>
      </>
    );
  };

  return (
    <section
      className={styles.section}
      aria-labelledby="quizshow-remote-review"
    >
      <h2 id="quizshow-remote-review" className={styles.sectionTitle}>
        {t("quizshow:remote.reviewTitle")}
      </h2>
      <p className={styles.hint}>{t("quizshow:remote.reviewHint")}</p>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <CollapseListItem key={entry.rowKey}>
              <ReviewRow entry={entry} actions={actionsFor(entry)} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <QuizshowRemoteErrorLine errorKey={lastErrorKey} />
    </section>
  );
}
