import { ComposeAudienceList } from "./ComposeAudienceList";
import { ComposeCategoryGrid } from "./ComposeCategoryGrid";
import { ComposeDetailsSection } from "./ComposeDetailsSection";
import { ComposeTagsSection } from "./ComposeTagsSection";
import type { ComposeAudience } from "./composeThread.types";
import type { ComposeThreadPage } from "./useComposeThreadPage";

// ── The four filing questions ───────────────────────────────────────────────
// Where does it go, who sees it, anything else worth saying, and what to file
// it under. Each component renders its OWN <section> and heading, so this is
// pure wiring: a second section head around them would put two headings on one
// region and read as two regions to a screen reader.

export interface ForumNewPostSectionsProps {
  page: ComposeThreadPage;
  /** The member's own communities. The town square row is built by
   *  `ComposeAudienceList` itself and is not one of these. */
  communities: readonly ComposeAudience[];
}

export function ForumNewPostSections({
  page,
  communities,
}: ForumNewPostSectionsProps) {
  const { state, setters } = page;

  return (
    <>
      <ComposeCategoryGrid
        category={state.category}
        onChange={setters.setCategory}
        suggestedCategory={page.suggestedCategory}
      />

      <ComposeAudienceList
        communities={communities}
        communitySlug={state.communitySlug}
        onChangeCommunitySlug={setters.setCommunitySlug}
        crossPost={state.crossPost}
        onChangeCrossPost={setters.setCrossPost}
      />

      <ComposeDetailsSection
        category={state.category}
        hasPoll={!!state.poll}
        body={state.body}
        language={state.language}
        onChangeLanguage={setters.setLanguage}
        neighbourhood={state.neighbourhood}
        onChangeNeighbourhood={setters.setNeighbourhood}
        closeAfter={state.closeAfter}
        onChangeCloseAfter={setters.setCloseAfter}
      />

      <ComposeTagsSection
        tags={state.tags}
        onAddTag={setters.addTag}
        onRemoveTag={setters.removeTag}
        suggestedTags={page.suggestedTags}
      />
    </>
  );
}
