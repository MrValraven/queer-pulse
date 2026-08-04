import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MagazinePage = lazyNamed(() => import("./MagazinePage"), "MagazinePage");
const ArticlePage = lazyNamed(() => import("./ArticlePage"), "ArticlePage");
const DeckPage = lazyNamed(() => import("./DeckPage"), "DeckPage");
const AuthorPage = lazyNamed(() => import("./AuthorPage"), "AuthorPage");
const IssuePage = lazyNamed(() => import("./IssuePage"), "IssuePage");
const IssuesPage = lazyNamed(() => import("./IssuesPage"), "IssuesPage");
const StoryPage = lazyNamed(() => import("./StoryPage"), "StoryPage");
const StoryTomasPage = lazyNamed(() => import("./StoryTomasPage"), "StoryTomasPage");
const StorySafetyPage = lazyNamed(() => import("./StorySafetyPage"), "StorySafetyPage");
const SubmitStoryPage = lazyNamed(() => import("./SubmitStoryPage"), "SubmitStoryPage");
const PitchTrackerPage = lazyNamed(() => import("./PitchTrackerPage"), "PitchTrackerPage");
const EditorDashboardPage = lazyNamed(() => import("./EditorDashboardPage"), "EditorDashboardPage");
const DeckEditorPage = lazyNamed(() => import("./DeckEditorPage"), "DeckEditorPage");

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
      <Route path={routes.issue} element={<IssuePage />} />
      <Route path={routes.issues} element={<IssuesPage />} />
      <Route path={routes.story} element={<StoryPage />} />
      <Route path={routes.storyTomas} element={<StoryTomasPage />} />
      <Route path={routes.storySafety} element={<StorySafetyPage />} />
      <Route path={routes.submitStory} element={<SubmitStoryPage />} />
      <Route path={routes.pitchTracker} element={<PitchTrackerPage />} />
      <Route path={routes.magazineEditor} element={<EditorDashboardPage />} />
      <Route path={routes.deckEditor} element={<DeckEditorPage />} />
    </>
  );
}
