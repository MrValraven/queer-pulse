import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryQuestionAnswer } from "./DirectoryQuestionAnswer";
import { DirectoryQuestionAnswerForm } from "./DirectoryQuestionAnswerForm";
import { DirectoryReportControl } from "./DirectoryReportControl";
import type { ListingPublicQuestion } from "./directoryPlaces";
import s from "./DirectoryQuestions.module.css";

interface Props {
  question: ListingPublicQuestion;
  slug: string;
  placeName: string;
  /** Moderation preview: no compose or report affordances. */
  preview: boolean;
  /** The viewer's own ref for this listing, present only when they own it. */
  ownerRef?: string;
}

/**
 * One public question: who asked, when, what they asked, the answer (or the
 * calm waiting line when there is none yet), the owner's answer affordance on
 * their own listing, and the report control every viewer gets.
 */
export function DirectoryQuestionCard({
  question,
  slug,
  placeName,
  preview,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const askedAt = new Date(question.createdAt);
  const hasDate = !Number.isNaN(askedAt.getTime());

  // The asker's name is visible next to the avatar, so `Avatar` gets no `name`
  // (it would be a redundant screen-reader announcement).
  const asker = (
    <>
      <Avatar
        initials={initialsFromName(question.askerName, "?")}
        tint="plum"
        src={question.askerAvatarUrl ?? undefined}
        size={32}
      />
      <span className={s.askerName}>{question.askerName}</span>
    </>
  );

  return (
    <article
      className={s.question}
      aria-label={t("marketing:directory.detail.questions.cardAria", {
        name: question.askerName,
      })}
    >
      <div className={s.questionHead}>
        {question.askerSlug ? (
          <Link to={`/members/${question.askerSlug}`} className={s.asker}>
            {asker}
          </Link>
        ) : (
          <div className={s.asker}>{asker}</div>
        )}
        {hasDate && (
          <time className={s.questionDate} dateTime={question.createdAt}>
            {fmt.date(askedAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        )}
      </div>
      <p className={s.questionBody}>{question.body}</p>
      <DirectoryQuestionAnswer question={question} placeName={placeName} />
      {!preview && ownerRef && (
        <DirectoryQuestionAnswerForm
          question={question}
          ownerRef={ownerRef}
          slug={slug}
        />
      )}
      {!preview && (
        <div className={s.questionActions}>
          <DirectoryReportControl
            subjectId={question.id}
            subjectKind="question"
            authorName={question.askerName}
          />
        </div>
      )}
    </article>
  );
}
