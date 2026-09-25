import { AnimatePresence } from "motion/react";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { PublishedThread } from "../useCreateThreadFlow";
import { ComposeConfirmCloseModal } from "./ComposeConfirmCloseModal";
import { ComposeFirstPostReview } from "./ComposeFirstPostReview";
import { ComposeReplyInsteadModal } from "./ComposeReplyInsteadModal";
import { ComposeScheduleModal } from "./ComposeScheduleModal";
import { ComposeShortcutsModal } from "./ComposeShortcutsModal";
import { ComposeSuccessPanel } from "./ComposeSuccessPanel";
import { COMPOSE_CATEGORIES } from "./composeCategories.data";
import { CONTENT_WARNINGS } from "./composeWarnings.data";
import { toPlainText } from "./composeText";
import type { ComposeAudience } from "./composeThread.types";
import type { ComposeThreadPage } from "./useComposeThreadPage";
import type { ComposeThreadPageOverlays } from "./useComposeThreadPageOverlays";

// ── Everything that sits OVER the composer ──────────────────────────────────
// Each of these brings its own scrim, focus trap and Escape (`Modal`, or a
// portal of its own for the success screen), so this component adds no
// chrome — it decides which one is on and hands it what it needs.
//
// The success panel is deliberately NOT part of the overlay machine: it is not
// something the member opened, it is what happened, and it is driven by the
// publish flow's own `published` result so it can never appear ahead of the
// server confirming. It sits under `AnimatePresence` so a withdraw fades the
// plum screen gently back off the composer.
//
// The cards sit under an `AnimatePresence` of their own, so each one leaves
// with the shared `Modal` exit. `mode="wait"` lets one card finish leaving
// before the next arrives (schedule, then review), so focus returns to the
// composer before the next card takes it. On a publish the success screen
// fades in over the leaving card, whose exit starts slow, so the two read as
// one motion with no bare composer showing between them.

export interface ForumNewPostOverlaysProps {
  page: ComposeThreadPage;
  overlays: ComposeThreadPageOverlays;
  communities: readonly ComposeAudience[];
  /** The byline as the review card says it back. */
  postingAsLabel: string;
  /** The thread that now exists, or null while nothing has published. */
  published: PublishedThread | null;
  /** Absolute URL of the published thread, for the share row. */
  publishedUrl: string | null;
  onDiscardDraft: () => void;
  onKeepDraft: () => void;
  onWithdraw: () => void;
  onViewPost: () => void;
  onDone: () => void;
  onMoveAsReply: () => void;
  isFollowingReplies: boolean;
  onFollowRepliesChange: (isFollowing: boolean) => void;
}

export function ForumNewPostOverlays({
  page,
  overlays,
  communities,
  postingAsLabel,
  published,
  publishedUrl,
  onDiscardDraft,
  onKeepDraft,
  onWithdraw,
  onViewPost,
  onDone,
  onMoveAsReply,
  isFollowingReplies,
  onFollowRepliesChange,
}: ForumNewPostOverlaysProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { state } = page;
  const audienceName = audienceNameFor(state.communitySlug, communities, t);

  // Nothing the member opened stays up over the success screen.
  const renderActiveModal = () => {
    const { overlay } = overlays;
    if (overlay === "confirmClose")
      return (
        <ComposeConfirmCloseModal
          key="confirmClose"
          draftSummary={draftSummaryOf(state.title, state.body)}
          onDiscard={onDiscardDraft}
          onKeepWriting={overlays.closeOverlay}
          onKeepDraft={onKeepDraft}
        />
      );

    if (overlay === "shortcuts")
      return (
        <ComposeShortcutsModal
          key="shortcuts"
          onClose={overlays.closeOverlay}
        />
      );

    if (overlay === "schedule")
      return (
        <ComposeScheduleModal
          key="schedule"
          initialValue={overlays.scheduledAtLocal}
          onBack={overlays.closeOverlay}
          onSchedule={overlays.confirmSchedule}
        />
      );

    if (overlay === "review")
      return (
        <ComposeFirstPostReview
          key="review"
          title={state.title}
          categoryName={categoryNameFor(state.category, t)}
          audienceName={audienceName}
          postingAs={postingAsLabel}
          contentWarningLabels={state.contentWarnings.map((id) =>
            warningLabelFor(id, t),
          )}
          photoCount={state.photos.length}
          shouldSkipNextTime={overlays.shouldSkipReview}
          onShouldSkipNextTimeChange={overlays.setShouldSkipReview}
          onBack={overlays.closeOverlay}
          onConfirm={overlays.confirmReview}
        />
      );

    if (overlay === "replyInstead" && overlays.replyTarget)
      return (
        <ComposeReplyInsteadModal
          key="replyInstead"
          threadTitle={overlays.replyTarget.title}
          replyText={state.body}
          onKeepOwnPost={overlays.closeOverlay}
          onMoveAsReply={onMoveAsReply}
        />
      );
    return null;
  };

  return (
    <>
      <AnimatePresence>
        {published && (
          <ComposeSuccessPanel
            key="success"
            mode={published.mode}
            threadTitle={published.title}
            audienceName={audienceName}
            threadUrl={publishedUrl}
            {...(published.scheduledAt
              ? {
                  scheduledFor: `${format.date(new Date(published.scheduledAt))} · ${format.time(new Date(published.scheduledAt))}`,
                }
              : {})}
            // Offered only while there is a live thread to take back down.
            {...(published.isPublished ? { onUnpublish: onWithdraw } : {})}
            isFollowingReplies={isFollowingReplies}
            onFollowRepliesChange={onFollowRepliesChange}
            onDone={onDone}
            {...(published.isPublished && published.slug ? { onViewPost } : {})}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {!published && renderActiveModal()}
      </AnimatePresence>
    </>
  );
}

/** The community's own name, or the town square's. */
function audienceNameFor(
  communitySlug: string,
  communities: readonly ComposeAudience[],
  t: TFunction,
): string {
  if (!communitySlug) return t("forum:composePage.audience.townSquare");
  const audience = communities.find(
    (candidate) => candidate.slug === communitySlug,
  );
  return audience?.name ?? communitySlug;
}

function categoryNameFor(category: string | null, t: TFunction): string {
  const chosen = COMPOSE_CATEGORIES.find(
    (candidate) => candidate.id === category,
  );
  return chosen ? t(chosen.nameKey) : "";
}

function warningLabelFor(warningId: string, t: TFunction): string {
  const warning = CONTENT_WARNINGS.find(
    (candidate) => candidate.id === warningId,
  );
  // An id with no entry is a warning this build no longer offers; saying it
  // back verbatim beats saying nothing on a summary the member is checking.
  return warning ? t(warning.labelKey) : warningId;
}

/** What the draft holds, said back: the title, or the opening words of the
 *  body when there is no title yet. */
function draftSummaryOf(title: string, body: string): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle) return trimmedTitle;
  const plain = toPlainText(body).trim();
  if (!plain) return "";
  return plain.length > 80 ? `${plain.slice(0, 77)}…` : plain;
}
