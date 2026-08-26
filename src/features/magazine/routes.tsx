import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MagazinePage = lazyNamed(() => import("./MagazinePage"), "MagazinePage");
const ArticlePage = lazyNamed(() => import("./ArticlePage"), "ArticlePage");
const DeckPage = lazyNamed(() => import("./DeckPage"), "DeckPage");
const AuthorPage = lazyNamed(() => import("./AuthorPage"), "AuthorPage");
const AuthorsDirectoryPage = lazyNamed(
  () => import("./AuthorsDirectoryPage"),
  "AuthorsDirectoryPage",
);
const MagazineSectionsPage = lazyNamed(
  () => import("./MagazineSectionsPage"),
  "MagazineSectionsPage",
);
const MagazineSectionArticlesPage = lazyNamed(
  () => import("./MagazineSectionArticlesPage"),
  "MagazineSectionArticlesPage",
);
const MagazineSearchPage = lazyNamed(
  () => import("./MagazineSearchPage"),
  "MagazineSearchPage",
);
const IssuePage = lazyNamed(() => import("./IssuePage"), "IssuePage");
const IssuesPage = lazyNamed(() => import("./IssuesPage"), "IssuesPage");
const SubmitStoryPage = lazyNamed(
  () => import("./SubmitStoryPage"),
  "SubmitStoryPage",
);
const PitchTrackerPage = lazyNamed(
  () => import("./PitchTrackerPage"),
  "PitchTrackerPage",
);
const EditorDashboardPage = lazyNamed(
  () => import("./EditorDashboardPage"),
  "EditorDashboardPage",
);
const DeckEditorPage = lazyNamed(
  () => import("./DeckEditorPage"),
  "DeckEditorPage",
);
const PieceRecordPage = lazyNamed(
  () => import("./PieceRecordPage"),
  "PieceRecordPage",
);
const WriterWorkspacePage = lazyNamed(
  () => import("./WriterWorkspacePage"),
  "WriterWorkspacePage",
);
const IssueProductionPage = lazyNamed(
  () => import("./IssueProductionPage"),
  "IssueProductionPage",
);
const ArticleEditorPage = lazyNamed(
  () => import("./ArticleEditorPage"),
  "ArticleEditorPage",
);
const LifecycleDeskPage = lazyNamed(
  () => import("./LifecycleDeskPage"),
  "LifecycleDeskPage",
);
const ApplyToWritePage = lazyNamed(
  () => import("./ApplyToWritePage"),
  "ApplyToWritePage",
);

// The three first-person stories are now regular data-driven articles in the
// article registry; their legacy paths resolve to the generic ArticlePage.
const STORY_ARTICLE_IDS: Record<string, string> = {
  [routes.story]: "studio-principe-real",
  [routes.storyTomas]: "supper-club-mouraria",
  [routes.storySafety]: "invite-only-safety",
};

/** The magazine: articles, authors, issues, first-person stories, and the
 *  editorial pitch/dashboard tools. */
export function magazineRoutes() {
  return (
    <>
      <Route path={routes.magazine} element={<MagazinePage />} />
      <Route path={routes.article} element={<ArticlePage />} />
      <Route path={routes.deck} element={<DeckPage />} />
      <Route path={routes.author} element={<AuthorPage />} />
      <Route path={`${routes.author}/:slug`} element={<AuthorPage />} />
      <Route path={routes.magazineAuthors} element={<AuthorsDirectoryPage />} />
      {/* CNT-20 — section/topic taxonomy browse; the drill-down's `:section`
          segment is `encodeURIComponent`-ed by `MagazineSectionGrid`'s link
          (a name like "Last word" carries a space). */}
      <Route
        path={routes.magazineSections}
        element={<MagazineSectionsPage />}
      />
      <Route
        path={`${routes.magazineSections}/:section`}
        element={<MagazineSectionArticlesPage />}
      />
      {/* CON-12 — the magazine's own search and tag browse. Reads `?q=` and
          `?tag=` from the URL, so a search is shareable and every tag pill in
          the magazine links here. */}
      <Route path={routes.magazineSearch} element={<MagazineSearchPage />} />
      <Route path={routes.issue} element={<IssuePage />} />
      {/* CNT-8 fix: a real per-issue route — every archive/masthead link used
          to point at this same bare path (always issue 09), so no past issue
          was actually reachable. Falls back to the current issue when no
          `:number` is given (see `IssuePage`/`useIssue`). */}
      <Route path={`${routes.issue}/:number`} element={<IssuePage />} />
      <Route path={routes.issues} element={<IssuesPage />} />
      <Route
        path={routes.story}
        element={
          <Navigate
            to={`${routes.article}?id=${STORY_ARTICLE_IDS[routes.story]}`}
            replace
          />
        }
      />
      <Route
        path={routes.storyTomas}
        element={
          <Navigate
            to={`${routes.article}?id=${STORY_ARTICLE_IDS[routes.storyTomas]}`}
            replace
          />
        }
      />
      <Route
        path={routes.storySafety}
        element={
          <Navigate
            to={`${routes.article}?id=${STORY_ARTICLE_IDS[routes.storySafety]}`}
            replace
          />
        }
      />
      <Route path={routes.submitStory} element={<SubmitStoryPage />} />
      <Route
        path={routes.magazineApplyToWrite}
        element={<ApplyToWritePage />}
      />
      <Route path={routes.pitchTracker} element={<PitchTrackerPage />} />
      <Route path={routes.magazineEditor} element={<EditorDashboardPage />} />
      <Route path={routes.magazineWriter} element={<WriterWorkspacePage />} />
      {/* CON-16 — the lifecycle desk. Declared before the `:id`-bearing editor
          routes below is unnecessary (no wildcard collides with this literal
          path), so it sits with the other editor surfaces. */}
      <Route path={routes.magazineLifecycle} element={<LifecycleDeskPage />} />
      <Route path={routes.deckEditor} element={<DeckEditorPage />} />
      <Route path={routes.magazinePiece} element={<PieceRecordPage />} />
      <Route
        path={routes.magazineIssueProd}
        element={<IssueProductionPage />}
      />
      <Route path={routes.magazineWrite} element={<ArticleEditorPage />} />
    </>
  );
}
