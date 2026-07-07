import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCompanyReviews } from "./companies.api";
import { reviewDtoToReview } from "./companies.adapters";
import { COMPANY_PROFILES, type CompanyReview } from "../companies.data";

/**
 * A company's reviews (GET /companies/:slug/reviews). Demo returns the mock
 * profile's reviews (the same list the reviews tab shows today); live fetches
 * and adapts them. Pass `enabled: false` to defer fetching until the reviews
 * tab is opened.
 */
export function useCompanyReviews(
  slug: string | undefined,
  opts: { enabled?: boolean } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery<CompanyReview[]>({
    queryKey: ["company-reviews", slug, demoMode],
    enabled: Boolean(slug) && (opts.enabled ?? true),
    queryFn: async () => {
      if (!slug) return [];
      if (demoMode) return COMPANY_PROFILES[slug]?.reviews ?? [];
      return (await getCompanyReviews(slug)).items.map(reviewDtoToReview);
    },
  });
}
