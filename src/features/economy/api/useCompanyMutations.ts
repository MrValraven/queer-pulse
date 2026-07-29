import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createCompany,
  createReview,
  type CreateCompanyDto,
  type CreateReviewDto,
} from "./companies.api";

/**
 * POST /companies — create/claim a company. Demo is a no-op (returns null; the
 * live-only "add a company" affordance is hidden in demo). Live posts, then
 * invalidates the companies list and returns the new company's slug so the
 * caller can affiliate to it.
 */
export function useCreateCompany() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ slug: string } | null, Error, CreateCompanyDto>({
    // AffiliateCompanyModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return null;
      const res = await createCompany(dto);
      return { slug: res.slug };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

/**
 * POST /companies/:slug/reviews — leave a review. Demo is a no-op (the page
 * keeps the optimistic review in local state). Live posts then invalidates the
 * reviews + profile queries. A repeat review answers 409; the error propagates
 * as an `ApiError` so the caller can surface "you've already reviewed this".
 */
export function useCreateReview(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateReviewDto>({
    // CompanyReviewModal toasts its own error (incl. the 409 "already reviewed"),
    // so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return;
      await createReview(slug, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["company-reviews", slug] });
      void queryClient.invalidateQueries({ queryKey: ["company", slug] });
    },
  });
}
