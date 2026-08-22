import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getCompanies } from "./companies.api";
import { companyCardToEmployer, type EmployerCard } from "./companies.adapters";
import { economyKeys } from "./economyKeys";

/**
 * The mock employers grid, with each row's profile slug resolved by name.
 * Demo-only mock — loaded on demand so it never ships in the live bundle.
 */
async function loadDemoEmployers(): Promise<EmployerCard[]> {
  const { EMPLOYERS } = await import("../jobs.data");
  const { COMPANY_SLUG_BY_NAME } = await import("../companies.data");
  return EMPLOYERS.map((e) => ({
    slug: COMPANY_SLUG_BY_NAME[e.name] ?? null,
    logo: e.logo,
    background: e.background,
    text: e.text,
    name: e.name,
    type: e.type,
    qr: e.qr,
    badge: e.badge,
    badgeBg: e.badgeBg,
    badgeText: e.badgeText,
  }));
}

export interface CompaniesResult {
  /** All employer rows fetched so far, flattened across loaded pages. */
  items: EmployerCard[];
  /** Server-reported total across all pages. */
  total: number;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
}

interface CompaniesPageVM {
  items: EmployerCard[];
  total: number;
  page: number;
}

/**
 * Companies list for the employers grid, paginated. Demo returns the page's own
 * EMPLOYERS registry (with slugs resolved) as a single synthetic full page, so
 * demo renders exactly as today and never offers "Load more". Live calls
 * GET /companies?page= and appends each page, stopping at the server `total`,
 * adapting every card to an employers-grid row.
 */
export function useCompanies(): CompaniesResult {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();

  const query = useInfiniteQuery<CompaniesPageVM>({
    // `language` is appended to the shared key rather than baked into the
    // factory: the adapter now resolves each card's badge through `t`, so a
    // language switch has to re-derive. Appending keeps `companiesRoot`
    // (`["companies"]`) matching for every existing prefix invalidation.
    queryKey: [...economyKeys.companies(demoMode), language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const demoEmployers = await loadDemoEmployers();
        return {
          items: demoEmployers,
          total: demoEmployers.length,
          page: 1,
        };
      }
      const res = await getCompanies({ page: pageParam as number });
      return {
        items: res.items.map((card) => companyCardToEmployer(card, t)),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
