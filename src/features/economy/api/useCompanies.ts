import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCompanies } from "./companies.api";
import { companyCardToEmployer, type EmployerCard } from "./companies.adapters";
import { EMPLOYERS } from "../jobs.data";
import { COMPANY_SLUG_BY_NAME } from "../companies.data";

/** The mock employers grid, with each row's profile slug resolved by name. */
const DEMO_EMPLOYERS: EmployerCard[] = EMPLOYERS.map((e) => ({
  slug: COMPANY_SLUG_BY_NAME[e.name] ?? null,
  logo: e.logo,
  bg: e.bg,
  text: e.text,
  name: e.name,
  type: e.type,
  qr: e.qr,
  badge: e.badge,
  badgeBg: e.badgeBg,
  badgeText: e.badgeText,
}));

/**
 * Companies list for the employers grid. Demo returns the page's own EMPLOYERS
 * registry (with slugs resolved); live calls GET /companies and adapts each
 * card to an employers-grid row.
 */
export function useCompanies(params: { page?: number } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<EmployerCard[]>({
    queryKey: ["companies", demoMode, params],
    queryFn: async () => {
      if (demoMode) return DEMO_EMPLOYERS;
      const res = await getCompanies(params);
      return res.items.map(companyCardToEmployer);
    },
  });
}
