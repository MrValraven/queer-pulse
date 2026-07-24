export interface ProcessStep {
  n: string;
  titleKey: string;
  bodyKey: string;
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
