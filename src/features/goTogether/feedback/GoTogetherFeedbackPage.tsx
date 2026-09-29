import { useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import {
  Button,
  Eyebrow,
  LoadErrorState,
  RadioCardGroup,
  Sending,
  Toggle,
} from "../../../shared/components/ui";
import { PageLoader } from "../../../shared/components/feedback/PageLoader";
import { ApiError } from "../../../shared/api/client";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { gatheringPath } from "../../gatherings/data";
import {
  useGoTogetherFeedback,
  useSaveGoTogetherFeedback,
} from "../api/useGoTogetherFeedback";
import { useGoTogetherGroup } from "../api/useGoTogetherGroup";
import { goTogetherErrorCode } from "../api/goTogether.api";
import type {
  FeedbackBody,
  GoTogetherFeedbackDTO,
  GoTogetherFeedbackMemberDTO,
  GroupClickAnswer,
  MeetAgainVerdict,
} from "../api/goTogether.types";
import { FeedbackOptionLabel } from "./FeedbackOptionLabel";
import {
  FeedbackClosedView,
  FeedbackSavedPanel,
} from "./GoTogetherFeedbackOutcome";
import { MeetAgainRow } from "./MeetAgainRow";
import styles from "./GoTogetherFeedback.module.css";

const CLICK_ANSWERS: GroupClickAnswer[] = ["yes", "somewhat", "no"];

/** A load failure that means "there is nothing to answer here any more":
 *  the group was purged by retention (90 days), the viewer is no longer a
 *  member (404), or the window has closed. These read as the calm closed
 *  view. Network and server failures keep the Retry state. */
function isGoneLoadError(loadError: unknown): boolean {
  if (goTogetherErrorCode(loadError) === "GO_TOGETHER_FEEDBACK_CLOSED") {
    return true;
  }
  return loadError instanceof ApiError && loadError.status === 404;
}

/** Builds the PUT body from the already-saved feedback plus whatever this
 *  visit changed. A member the viewer never touched this time keeps their
 *  already-saved verdict, so reopening the page and pressing Save right away
 *  is harmless. */
function buildSaveBody(
  members: GoTogetherFeedbackMemberDTO[],
  editedVerdicts: Partial<Record<string, MeetAgainVerdict>>,
  clicked: GroupClickAnswer | null,
  goAgain: boolean,
): FeedbackBody {
  const verdicts: Record<string, MeetAgainVerdict> = {};
  for (const member of members) {
    const verdict = editedVerdicts[member.slug] ?? member.verdict;
    if (verdict) verdicts[member.slug] = verdict;
  }
  return { verdicts, clicked: clicked ?? undefined, goAgain };
}

interface GoTogetherFeedbackFormProps {
  feedback: GoTogetherFeedbackDTO;
  /** The gathering's title, once `useGoTogetherGroup` has resolved it; `null`
   *  while that query is loading, has errored, or the member somehow reaches
   *  this page before it settles. The heading falls back to a generic phrase
   *  in that case. */
  eventTitle: string | null;
  backLabel: string;
  backHref: string;
  editedVerdicts: Partial<Record<string, MeetAgainVerdict>>;
  clicked: GroupClickAnswer | null;
  goAgain: boolean;
  isSaving: boolean;
  onSelectVerdict: (slug: string, verdict: MeetAgainVerdict) => void;
  onSelectClicked: (clicked: GroupClickAnswer) => void;
  onChangeGoAgain: (goAgain: boolean) => void;
  onSave: () => void;
}

/** The form itself: the other members' rows, the group click question, the
 *  "go together again" switch, and Save. Every field is optional, so Save is
 *  always available and simply sends whatever has an answer. */
function GoTogetherFeedbackForm({
  feedback,
  eventTitle,
  backLabel,
  backHref,
  editedVerdicts,
  clicked,
  goAgain,
  isSaving,
  onSelectVerdict,
  onSelectClicked,
  onChangeGoAgain,
  onSave,
}: GoTogetherFeedbackFormProps) {
  const { t } = useTranslation();
  const clickQuestionLabelId = useId();

  return (
    <>
      <header className={styles.header}>
        <Link to={backHref} className={styles.backLink}>
          <FiArrowLeft aria-hidden />
          {backLabel}
        </Link>
        <Eyebrow>{t("goTogether:product.name")}</Eyebrow>
        <h1 className={styles.title}>
          {eventTitle
            ? t("goTogether:feedback.titleWithEvent", { title: eventTitle })
            : t("goTogether:feedback.title")}
        </h1>
        <p className={styles.likingGap}>{t("goTogether:feedback.likingGap")}</p>
        <p className={styles.privacyLine}>
          {t("goTogether:feedback.privacyLine")}
        </p>
      </header>

      <div className={styles.list}>
        {feedback.members.map((member) => (
          <MeetAgainRow
            key={member.slug}
            member={member}
            value={editedVerdicts[member.slug] ?? member.verdict ?? ""}
            onChange={onSelectVerdict}
          />
        ))}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle} id={clickQuestionLabelId}>
          {t("goTogether:feedback.clickQuestion.title")}
        </p>
        <RadioCardGroup<GroupClickAnswer>
          value={clicked ?? ""}
          onChange={onSelectClicked}
          ariaLabelledBy={clickQuestionLabelId}
          ariaLabel={t("goTogether:feedback.clickQuestion.title")}
          columns={3}
          className={styles.clickOptions}
          optionClassName={styles.clickOption}
          checkedClassName={styles.clickOptionOn}
          options={CLICK_ANSWERS.map((answer) => ({
            id: answer,
            render: (
              <FeedbackOptionLabel
                label={t(`goTogether:feedback.click.${answer}`)}
                isSelected={answer === clicked}
              />
            ),
          }))}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.goAgainRow}>
          <div className={styles.goAgainText}>
            <span className={styles.goAgainTitle}>
              {t("goTogether:feedback.goAgain.title")}
            </span>
            <span className={styles.goAgainDescription}>
              {t("goTogether:feedback.goAgain.description")}
            </span>
          </div>
          <Toggle
            checked={goAgain}
            onChange={onChangeGoAgain}
            label={t("goTogether:feedback.goAgain.ariaLabel")}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Sending label={t("goTogether:feedback.savingLabel")} />
          ) : (
            t("goTogether:feedback.saveCta")
          )}
        </Button>
      </div>
    </>
  );
}

/**
 * The day-after meet-again prompt, `/go-together/feedback/:groupId` (F3
 * mounts the route). One screen: a private Yes / Maybe / Not for me per other
 * group member, "Did the group click?", the "Go together again" switch, then
 * Save. The window stays open for 7 days after the gathering and every answer
 * stays editable the whole time.
 *
 * A closed window is an expected state. Past the 7 days (the loaded
 * `feedback.isOpen`), or the moment the backend answers
 * `GO_TOGETHER_FEEDBACK_CLOSED` on save because it closed between load and
 * submit, the page reads as closed and shows no form and no error. A group
 * that no longer exists for this member (a 404 once retention purged it, or
 * after they left) reads as closed too: an old notification tap must never
 * land on a Retry that can't succeed.
 */
export function GoTogetherFeedbackPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const {
    data: feedback,
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useGoTogetherFeedback(groupId);
  const saveFeedback = useSaveGoTogetherFeedback(groupId ?? "");
  // Read-only: names the gathering in the heading and links back to it. Its
  // `event` is only known once this settles, so every reader below falls
  // back to the member's own events list while it loads or if it errors (a
  // member who has left the group gets a 404 here).
  const { data: group } = useGoTogetherGroup(groupId);
  const eventTitle = group?.event.title ?? null;
  const gatheringHref = group?.event.slug
    ? gatheringPath(group.event.slug)
    : routes.myEvents;
  const backLabel = eventTitle
    ? t("goTogether:feedback.backToGathering")
    : t("goTogether:feedback.backToEvents");

  const [editedVerdicts, setEditedVerdicts] = useState<
    Partial<Record<string, MeetAgainVerdict>>
  >({});
  const [editedClicked, setEditedClicked] = useState<GroupClickAnswer | null>(
    null,
  );
  const [editedGoAgain, setEditedGoAgain] = useState<boolean | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasClosedError, setHasClosedError] = useState(false);

  const clicked = editedClicked ?? feedback?.clicked ?? null;
  const goAgain = editedGoAgain ?? feedback?.goAgain ?? false;
  const isGone = isError && isGoneLoadError(loadError);
  const isClosed = hasClosedError || isGone || feedback?.isOpen === false;

  const handleSelectVerdict = (slug: string, verdict: MeetAgainVerdict) => {
    setEditedVerdicts((previous) => ({ ...previous, [slug]: verdict }));
  };

  const handleSave = () => {
    if (!feedback) return;
    const body = buildSaveBody(
      feedback.members,
      editedVerdicts,
      clicked,
      goAgain,
    );
    saveFeedback.mutate(body, {
      onSuccess: () => setHasSaved(true),
      onError: (saveError) => {
        if (goTogetherErrorCode(saveError) === "GO_TOGETHER_FEEDBACK_CLOSED") {
          setHasClosedError(true);
        } else {
          showToast(t("goTogether:feedback.saveError"), "error");
        }
      },
    });
  };

  return (
    <PageShell>
      <div className={styles.page}>
        {isLoading ? (
          <PageLoader size="section" label={t("goTogether:feedback.loading")} />
        ) : isError && !isGone ? (
          <LoadErrorState onRetry={() => void refetch()} />
        ) : hasSaved ? (
          <FeedbackSavedPanel
            backLabel={backLabel}
            onBack={() => {
              void navigate(gatheringHref);
            }}
          />
        ) : isClosed ? (
          <FeedbackClosedView
            backLabel={backLabel}
            backHref={gatheringHref}
            shouldTakeFocus={hasClosedError}
          />
        ) : feedback ? (
          <GoTogetherFeedbackForm
            feedback={feedback}
            eventTitle={eventTitle}
            backLabel={backLabel}
            backHref={gatheringHref}
            editedVerdicts={editedVerdicts}
            clicked={clicked}
            goAgain={goAgain}
            isSaving={saveFeedback.isPending}
            onSelectVerdict={handleSelectVerdict}
            onSelectClicked={setEditedClicked}
            onChangeGoAgain={setEditedGoAgain}
            onSave={handleSave}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
