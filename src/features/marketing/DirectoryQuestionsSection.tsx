import { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingQuestions } from "./api/useListingQuestions";
import type { DirectoryPlace } from "./directoryPlaces";
import { DirectoryQuestionAskForm } from "./DirectoryQuestionAskForm";
import { DirectoryQuestionCard } from "./DirectoryQuestionCard";
import q from "./DirectoryQuestions.module.css";
import s from "./DirectorySpacePage.module.css";

/** How many questions the detail payload carries inline. At this many, there
 *  may well be more behind the paged endpoint, so offer the way through. */
const INLINE_QUESTION_CAP = 10;

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: read-only, no compose affordances anywhere. */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it. */
  ownerRef?: string;
}

/**
 * "Ask the owner, in public": the questions members have asked this business
 * and the answers that came back.
 *
 * The detail payload already carries the ten most recent questions, so the
 * section renders with no extra request. Asking for more switches it onto the
 * paged endpoint, which owns the list from then on.
 *
 * A page full of questions and no answers still reads well: each unanswered
 * question carries a calm waiting line (see `DirectoryQuestionAnswer`) and the
 * section says nothing about how fast, or whether, a business replies.
 */
export function DirectoryQuestionsSection({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const pagedQuestions = useListingQuestions(place.slug, isShowingAll);

  const inlineQuestions = place.questions ?? [];
  // Until the first page lands, keep the inline ten on screen rather than
  // blanking the section the reader just asked to expand.
  const questions =
    isShowingAll && pagedQuestions.questions.length > 0
      ? pagedQuestions.questions
      : inlineQuestions;
  // The server total only becomes meaningful once a page has actually landed;
  // until then the inline count is the honest number to show.
  const total =
    isShowingAll && pagedQuestions.questions.length > 0
      ? pagedQuestions.total
      : inlineQuestions.length;

  const canShowAll =
    !isShowingAll && inlineQuestions.length >= INLINE_QUESTION_CAP;

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.questions.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {t(
          questions.length === 0
            ? "marketing:directory.detail.questions.emptySub"
            : "marketing:directory.detail.questions.sub",
          { count: total },
        )}
      </p>

      {/* The moderation preview shows the questions and answers, never the
          compose affordances, matching the review form above it. */}
      {!preview &&
        (ownerRef ? (
          <p className={q.ownerNote}>
            {t("marketing:directory.detail.questions.ownerNote")}
          </p>
        ) : (
          <DirectoryQuestionAskForm slug={place.slug} />
        ))}

      {questions.length === 0 ? (
        <p className={q.empty}>
          <FiHelpCircle aria-hidden />
          {t("marketing:directory.detail.questions.emptyBody")}
        </p>
      ) : (
        <div className={q.list}>
          {questions.map((question) => (
            <DirectoryQuestionCard
              key={question.id}
              question={question}
              slug={place.slug}
              placeName={place.name}
              preview={preview}
              ownerRef={ownerRef}
            />
          ))}
        </div>
      )}

      {canShowAll && (
        <div className={q.moreRow}>
          <Button variant="ghost" onClick={() => setIsShowingAll(true)}>
            {t("marketing:directory.detail.questions.seeAll")}
          </Button>
        </div>
      )}
      {isShowingAll && pagedQuestions.hasNextPage && (
        <div className={q.moreRow}>
          <Button
            variant="ghost"
            disabled={pagedQuestions.isFetchingNextPage}
            onClick={pagedQuestions.fetchNextPage}
          >
            {pagedQuestions.isFetchingNextPage
              ? t("marketing:directory.detail.questions.loadingMore")
              : t("marketing:directory.detail.questions.loadMore")}
          </Button>
        </div>
      )}
      {isShowingAll && pagedQuestions.isError && (
        <p className={q.askError} role="alert">
          {t("marketing:directory.detail.questions.loadError")}
        </p>
      )}
    </section>
  );
}
