import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ComposeChecklistBlock } from "./ComposeChecklistBlock";
import { ComposePostingAs } from "./ComposePostingAs";
import { ComposePreviewCard } from "./ComposePreviewCard";
import { ComposeRail } from "./ComposeRail";
import { ComposeSimilarThreads } from "./ComposeSimilarThreads";
import type { ComposeThreadPage } from "./useComposeThreadPage";
import type { ComposeIdentity } from "./useComposeIdentity";
import type { SimilarThread } from "./useSimilarThreads";

// ── The advice beside the writing ───────────────────────────────────────────
// `ComposeRail` owns the <aside>, the sticky column and the bottom sheet it
// becomes below 1023px, so this is the four blocks and nothing around them.

export interface ForumNewPostRailProps {
  page: ComposeThreadPage;
  identity: ComposeIdentity;
  onReplyInstead: (thread: SimilarThread) => void;
}

export function ForumNewPostRail({
  page,
  identity,
  onReplyInstead,
}: ForumNewPostRailProps) {
  const { t } = useTranslation();
  const { state, setters } = page;
  // Compose is auth-gated, so a missing profile is a session that has not
  // resolved rather than an anonymous writer: name the member as themselves
  // instead of leaving the byline blank.
  const author = identity.author ?? {
    name: t("forum:author.you"),
    initials: "",
  };
  const coAuthor = identity.coAuthorOptions.find(
    (candidate) => candidate.slug === state.coAuthorSlug,
  );
  const requiredItems = page.checklist.filter((item) => item.isRequired);

  return (
    <ComposeRail
      postingAs={
        <ComposePostingAs
          author={author}
          canPostAsOfficial={identity.canPostAsOfficial}
          isOfficial={state.isOfficial}
          onOfficialChange={setters.setIsOfficial}
          isAnonymous={state.isAnonymous}
          onAnonymousChange={setters.setIsAnonymous}
          category={state.category}
          coAuthorSlug={state.coAuthorSlug}
          coAuthorOptions={identity.coAuthorOptions}
          onCoAuthorChange={setters.setCoAuthorSlug}
        />
      }
      preview={
        <ComposePreviewCard
          title={state.title}
          body={state.body}
          category={state.category}
          tags={state.tags}
          contentWarnings={state.contentWarnings}
          photos={state.photos}
          poll={state.poll}
          isOfficial={state.isOfficial}
          isAnonymous={state.isAnonymous}
          author={author}
          {...(coAuthor ? { coAuthorName: coAuthor.name } : {})}
          community={page.community}
          isCrossPosted={state.crossPost}
        />
      }
      similar={
        <ComposeSimilarThreads
          title={state.title}
          threads={page.similar.threads}
          isDuplicate={page.similar.isDuplicate}
          duplicateTitle={page.similar.duplicateTitle}
          isLoading={page.similar.isLoading}
          isAwaitingFirstSearch={page.similar.isAwaitingFirstSearch}
          onReplyInstead={onReplyInstead}
        />
      }
      checklist={<ComposeChecklistBlock items={page.checklist} />}
      similarCount={page.similar.threads.length}
      readyCount={requiredItems.filter((item) => item.isDone).length}
      readyTotal={requiredItems.length}
    />
  );
}
