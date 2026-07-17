import { type ReactNode } from "react";

export interface ProcessStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

export interface Partner {
  slug: string;
  logo: string;
  logoCls: string;
  type: string;
  name: ReactNode;
  since: string;
  desc: string;
}

/**
 * i18n Pattern A. Each entry is a catalog key whose value carries a `<b>`
 * emphasis run, resolved by the consumer via `<Translation>`.
 */
export const NOT_DO_KEYS: string[] = [
  "marketing:forOrgs.notDo.prideCampaigns",
  "marketing:forOrgs.notDo.sellList",
  "marketing:forOrgs.notDo.sponsoredPosts",
  "marketing:forOrgs.notDo.rainbowLogos",
  "marketing:forOrgs.notDo.recruit",
];

export const PROCESS: ProcessStep[] = [
  {
    n: "01",
    titleKey: "marketing:forOrgs.process.step1.title",
    bodyKey: "marketing:forOrgs.process.step1.body",
  },
  {
    n: "02",
    titleKey: "marketing:forOrgs.process.step2.title",
    bodyKey: "marketing:forOrgs.process.step2.body",
  },
  {
    n: "03",
    titleKey: "marketing:forOrgs.process.step3.title",
    bodyKey: "marketing:forOrgs.process.step3.body",
  },
  {
    n: "04",
    titleKey: "marketing:forOrgs.process.step4.title",
    bodyKey: "marketing:forOrgs.process.step4.body",
  },
];

/**
 * These four partner records are each org's own content (name, tenure,
 * description) — left English, same precedent as the Partners listing page
 * (`partnerDetails.dataA/B.tsx`). Not part of the i18n sweep.
 */
export const PARTNERS: Partner[] = [
  {
    slug: "ilga-portugal",
    logo: "ILGA",
    logoCls: "",
    type: "Operational · founding",
    name: (
      <>
        ILGA <em>Portugal</em>
      </>
    ),
    since: "Partnered since 2022",
    desc: "Operational case-bridge, free legal consults, joint advocacy. The 4-year-old seam that proves this model.",
  },
  {
    slug: "clinica-do-largo",
    logo: "CL",
    logoCls: "logoCoral",
    type: "Operational · 2024",
    name: (
      <>
        Clínica <em>do Largo</em>
      </>
    ),
    since: "Partnered since 2024",
    desc: "Open clinic nights, trans-affirming care pathway, vouching for QP-verified therapists.",
  },
  {
    slug: "fundacao-gulbenkian",
    logo: "FG",
    logoCls: "logoJade",
    type: "Programme funder",
    name: (
      <>
        Fundação <em>Gulbenkian</em>
      </>
    ),
    since: "Funder since 2025",
    desc: "Three-year grant for the micro-grants fund. €60k/year. Quarterly reports + annual audit.",
  },
];
