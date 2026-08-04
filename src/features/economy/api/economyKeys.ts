/**
 * Per-domain react-query key factory for the economy domain (jobs, employers,
 * workshops, landlords). Both the read site (where a query is DEFINED) and the
 * write site (where a mutation INVALIDATES) go through this one source of truth,
 * so the two can never drift — e.g. the pre-factory bug where `useJob` keyed on
 * `["job", slug, demoMode, language]` but `useJobMutations` invalidated a
 * hand-written `["job", slug]` that could silently stop matching.
 *
 * NOTE ON SHAPE: these keys deliberately keep their EXISTING segment order
 * (`demoMode`/`language` wherever each key already had them — NOT the later
 * "demoMode last" convention used by `eventKeys`/`opportunityKeys`). This is a
 * safety refactor, not a behaviour change: the arrays produced here are
 * byte-for-byte the ones the hooks used before, so cache identity and
 * invalidation matching are unchanged. `landlord` keeps `demoMode` BEFORE its
 * slug because that is the order both its reader and its live-only invalidation
 * already relied on.
 *
 * `*Root` / `*BySlug` / `*ById` helpers produce the PREFIX arrays used for
 * invalidation (react-query matches queries by key prefix), matching exactly the
 * partial keys the mutations passed by hand before.
 *
 * These same string prefixes are also invalidated by two providers outside this
 * folder (`PostedJobsProvider`, `WorkshopsProvider`); the shapes above are the
 * contract they rely on, so they keep matching without change.
 */
export const economyKeys = {
  // Jobs board (list) — read by `useJobs`; invalidated on job create.
  jobsRoot: ["jobs"] as const,
  jobs: (
    demoMode: boolean,
    language: string,
    params: { cat?: string; type?: string },
  ) => ["jobs", demoMode, language, params] as const,

  // A single job (detail) — read by `useJob`; invalidated by slug on apply.
  job: (slug: string | undefined, demoMode: boolean, language: string) =>
    ["job", slug, demoMode, language] as const,
  jobBySlug: (slug: string) => ["job", slug] as const,

  // The signed-in member's applications — read by `useMyApplications`;
  // invalidated on a successful apply.
  myApplicationsRoot: ["my-applications"] as const,
  myApplications: (demoMode: boolean, language: string) =>
    ["my-applications", demoMode, language] as const,

  // Employers list — read by `useCompanies`; invalidated on job/company create.
  companiesRoot: ["companies"] as const,
  companies: (demoMode: boolean) => ["companies", demoMode] as const,

  // A single company (detail) — read by `useCompany`; invalidated by slug.
  company: (slug: string | undefined, demoMode: boolean, language: string) =>
    ["company", slug, demoMode, language] as const,
  companyBySlug: (slug: string) => ["company", slug] as const,

  // A company's reviews — read by `useCompanyReviews`; invalidated by slug on
  // a new review.
  companyReviews: (slug: string | undefined, demoMode: boolean) =>
    ["company-reviews", slug, demoMode] as const,
  companyReviewsBySlug: (slug: string) => ["company-reviews", slug] as const,

  // Workshops catalogue (list) — read by `useWorkshops`; invalidated on
  // RSVP/edit/delete.
  workshopsRoot: ["workshops"] as const,
  workshops: (
    demoMode: boolean,
    language: string,
    params: { cat?: string },
  ) => ["workshops", demoMode, language, params] as const,

  // A single workshop (detail) — read by `useWorkshop`; invalidated by id (the
  // FE's slug) on RSVP/edit/delete.
  workshop: (slug: string | undefined, demoMode: boolean, language: string) =>
    ["workshop", slug, demoMode, language] as const,
  workshopById: (id: string) => ["workshop", id] as const,

  // Landlord (detail) — read by `useLandlord`; live-only invalidation on
  // recommend passes `demoMode: false` to hit exactly the live cache entry.
  landlord: (demoMode: boolean, slug: string | undefined) =>
    ["landlord", demoMode, slug] as const,

  // Landlord board (list) — read by `useLandlords`; invalidated on suggest.
  landlordsRoot: ["landlords"] as const,
  landlords: (demoMode: boolean) => ["landlords", demoMode] as const,
};
