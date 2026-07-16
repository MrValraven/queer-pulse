import { routes } from "../../app/routeMap";

export interface TransHubStep {
  n: string;
  titleKey: string;
  bodyKey: string;
  /** Route for the single embedded `<a>` run in `bodyKey`, if any. */
  linkTo?: string;
}

/**
 * i18n Pattern A — platform-authored trans healthcare/legal navigation
 * guidance for Portugal (flag for native review). Real-world proper nouns
 * (SNS, Hospital de Santa Maria, ILGA Portugal, Cartão de Cidadão, Law
 * 38/2018, "Jonas Ferreira" the community organiser) stay untranslated
 * inside the catalog values themselves.
 */
export const HEALTHCARE: TransHubStep[] = [
  {
    n: "01",
    titleKey: "resources:transHub.healthcare.step1.title",
    bodyKey: "resources:transHub.healthcare.step1.body",
  },
  {
    n: "02",
    titleKey: "resources:transHub.healthcare.step2.title",
    bodyKey: "resources:transHub.healthcare.step2.body",
  },
  {
    n: "03",
    titleKey: "resources:transHub.healthcare.step3.title",
    bodyKey: "resources:transHub.healthcare.step3.body",
  },
  {
    n: "04",
    titleKey: "resources:transHub.healthcare.step4.title",
    bodyKey: "resources:transHub.healthcare.step4.body",
    linkTo: routes.changemakers,
  },
  {
    n: "05",
    titleKey: "resources:transHub.healthcare.step5.title",
    bodyKey: "resources:transHub.healthcare.step5.body",
    linkTo: routes.legal,
  },
];

export const LEGAL: TransHubStep[] = [
  {
    n: "01",
    titleKey: "resources:transHub.legal.step1.title",
    bodyKey: "resources:transHub.legal.step1.body",
  },
  {
    n: "02",
    titleKey: "resources:transHub.legal.step2.title",
    bodyKey: "resources:transHub.legal.step2.body",
  },
  {
    n: "03",
    titleKey: "resources:transHub.legal.step3.title",
    bodyKey: "resources:transHub.legal.step3.body",
  },
];

export const RESOURCES: {
  catKey: string;
  catColor: string;
  catBg: string;
  titleKey: string;
  descKey: string;
}[] = [
  {
    catKey: "resources:transHub.resources.cat.guide",
    catColor: "var(--accent-ink)",
    catBg: "rgba(232,119,90,.1)",
    titleKey: "resources:transHub.resource.snsGuide.title",
    descKey: "resources:transHub.resource.snsGuide.desc",
  },
  {
    catKey: "resources:transHub.resources.cat.checklist",
    catColor: "var(--jade)",
    catBg: "rgba(74,140,111,.12)",
    titleKey: "resources:transHub.resource.docChecklist.title",
    descKey: "resources:transHub.resource.docChecklist.desc",
  },
  {
    catKey: "resources:transHub.resources.cat.directory",
    catColor: "var(--plum)",
    catBg: "rgba(45,27,61,.08)",
    titleKey: "resources:transHub.resource.clinicians.title",
    descKey: "resources:transHub.resource.clinicians.desc",
  },
  {
    catKey: "resources:transHub.resources.cat.peerSupport",
    catColor: "var(--violet)",
    catBg: "rgba(155,111,212,.1)",
    titleKey: "resources:transHub.resource.peerCircle.title",
    descKey: "resources:transHub.resource.peerCircle.desc",
  },
];
