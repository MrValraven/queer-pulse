import { createElement, Suspense, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShellLeadContext } from "../../../shared/components/layout/PageShellLeadContext";
import { guidePageForSlug } from "../../resources/guidePages";
import { GuideReviewFooter } from "../../resources/GuideReviewFooter";
import {
  ManagedGuideBody,
  ManagedGuideSkeleton,
} from "../../resources/ManagedGuide";
import {
  ManagedGuideRowContext,
  SECTION_COMPOSED_GUIDE_SLUGS,
} from "../../resources/sectionComposedGuides";
import { AdminResourceGuideReviewModal } from "../AdminResourceGuideReviewModal";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import { useAdminResourceGuide } from "../api/useAdminResourceGuides";
import { GuidePreviewBar } from "./GuidePreviewBar";
import {
  GuidePreviewNoPage,
  GuidePreviewUnavailable,
} from "./GuidePreviewStates";

/**
 * `/admin/resource-guides/preview/:id`: a guide exactly as readers get it,
 * whether or not readers can see it yet.
 *
 * The public route hides any guide that is unpublished or never reviewed
 * (`ManagedGuide` renders the under-review page), which is exactly the state
 * an editor most needs to look at. This route loads the admin row instead,
 * skips that gate, and renders the same body `ManagedGuide` would once the
 * guide is public, under a slim admin bar.
 *
 * The bar reaches the page's `PageShell` through `PageShellLeadContext`, which
 * renders it as the first child of `<main>`: a route change focuses `<main>`,
 * so the first Tab lands on the bar before the guide body.
 */
export function AdminGuidePreviewPage() {
  const { id } = useParams();
  const guideQuery = useAdminResourceGuide(id);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  if (guideQuery.isPending) return <ManagedGuideSkeleton />;

  const guide = guideQuery.data;
  if (!guide) {
    return (
      <GuidePreviewUnavailable
        error={guideQuery.error}
        onRetry={() => void guideQuery.refetch()}
      />
    );
  }

  // Created as an element here, the way `routes.tsx` hands `ManagedGuide` its
  // fallback: the page is a module-level lazy component, looked up by slug.
  const HardcodedPage = guidePageForSlug(guide.slug);
  const hardcodedPageElement = HardcodedPage
    ? createElement(HardcodedPage)
    : null;
  // A section-composed guide (sexual health) never takes its page over: its
  // page reads each section by anchor. The row goes to that page through
  // `ManagedGuideRowContext`, so the preview shows sections the public
  // endpoint does not serve yet.
  const hasManagedBody =
    !SECTION_COMPOSED_GUIDE_SLUGS.has(guide.slug) && guide.sections.length > 0;
  if (!hasManagedBody && !hardcodedPageElement) {
    return <GuidePreviewNoPage guideId={guide.id} title={guide.title} />;
  }

  const previewBar = (
    <GuidePreviewBar guide={guide} onReview={() => setIsReviewOpen(true)} />
  );

  return (
    <>
      <PageShellLeadContext.Provider value={previewBar}>
        {hasManagedBody ? (
          <ManagedGuideBody slug={guide.slug} guide={guide} />
        ) : (
          <ManagedGuideRowContext.Provider value={guide}>
            <Suspense fallback={<ManagedGuideSkeleton />}>
              {hardcodedPageElement}
              <PreviewReviewFooter guide={guide} />
            </Suspense>
          </ManagedGuideRowContext.Provider>
        )}
      </PageShellLeadContext.Provider>
      {isReviewOpen && (
        <AdminResourceGuideReviewModal
          guide={guide}
          onClose={() => setIsReviewOpen(false)}
        />
      )}
    </>
  );
}

/** The review line `ManagedGuide` prints under a hardcoded page. */
function PreviewReviewFooter({ guide }: { guide: AdminResourceGuideDTO }) {
  return (
    <GuideReviewFooter
      lastReviewedOn={guide.lastReviewedOn}
      reviewedBy={guide.reviewedBy}
      reviewDueOn={guide.reviewDueOn}
    />
  );
}
