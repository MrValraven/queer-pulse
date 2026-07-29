import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { ParamRedirect } from "../../app/routes.redirects";
import { lazyNamed } from "../../app/routeHelpers";

const MagazinePage = lazyNamed(() => import("./MagazinePage"), "MagazinePage");
const ArticlePage = lazyNamed(() => import("./ArticlePage"), "ArticlePage");
const AuthorPage = lazyNamed(() => import("./AuthorPage"), "AuthorPage");
const IssuePage = lazyNamed(() => import("./IssuePage"), "IssuePage");
const IssuesPage = lazyNamed(() => import("./IssuesPage"), "IssuesPage");
const CoverGalleryPage = lazyNamed(() => import("./CoverGalleryPage"), "CoverGalleryPage");
const TagPage = lazyNamed(() => import("./TagPage"), "TagPage");
const NewsletterArchivePage = lazyNamed(() => import("./NewsletterArchivePage"), "NewsletterArchivePage");
const NewsletterArchiveIssuePage = lazyNamed(() => import("./NewsletterArchiveIssuePage"), "NewsletterArchiveIssuePage");
const StoryPage = lazyNamed(() => import("./StoryPage"), "StoryPage");
const StoryTomasPage = lazyNamed(() => import("./StoryTomasPage"), "StoryTomasPage");
const StorySafetyPage = lazyNamed(() => import("./StorySafetyPage"), "StorySafetyPage");
const SubmitStoryPage = lazyNamed(() => import("./SubmitStoryPage"), "SubmitStoryPage");
const PitchTrackerPage = lazyNamed(() => import("./PitchTrackerPage"), "PitchTrackerPage");
const EditorDashboardPage = lazyNamed(() => import("./EditorDashboardPage"), "EditorDashboardPage");

/** The magazine: articles, authors, issues, the cover gallery, newsletter
 *  archive, first-person stories, and the editorial pitch/dashboard tools. */
export function magazineRoutes() {
  return (
    <>
      <Route path={routes.magazine} element={<MagazinePage />} />
      <Route path={routes.article} element={<ArticlePage />} />
      <Route path={routes.author} element={<AuthorPage />} />
      <Route path={`${routes.author}/:slug`} element={<AuthorPage />} />
      <Route path={routes.issue} element={<IssuePage />} />
      <Route path={routes.issues} element={<IssuesPage />} />
      <Route path={routes.coverGallery} element={<CoverGalleryPage />} />
      <Route path={routes.tag} element={<TagPage />} />
      <Route
        path={routes.newsletterArchive}
        element={<NewsletterArchivePage />}
      />
      <Route
        path={`${routes.newsletterArchive}/:slug`}
        element={<NewsletterArchiveIssuePage />}
      />
      <Route
        path="/newsletter-archive/:slug"
        element={
          <ParamRedirect
            build={(p) => `/magazine/newsletter-archive/${p.slug ?? ""}`}
          />
        }
      />
      <Route path={routes.story} element={<StoryPage />} />
      <Route path={routes.storyTomas} element={<StoryTomasPage />} />
      <Route path={routes.storySafety} element={<StorySafetyPage />} />
      <Route path={routes.submitStory} element={<SubmitStoryPage />} />
      <Route path={routes.pitchTracker} element={<PitchTrackerPage />} />
      <Route path={routes.magazineEditor} element={<EditorDashboardPage />} />
    </>
  );
}
