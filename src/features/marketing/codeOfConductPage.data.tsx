export interface LadderStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

export interface PactItem {
  n: string;
  titleKey: string;
  bodyKey: string;
}

/**
 * i18n Pattern A. All fields here are platform-authored governance chrome —
 * the binding Code of Conduct itself — so every title/body is a catalog key.
 * `LadderStep.bodyKey` and a couple of `PactItem.bodyKey` values carry inline
 * `<em>` runs; the consumer (`CodeOfConductSections.tsx`) resolves those with
 * `<Translation components={{ em: <em /> }} />` rather than baking JSX here.
 */
export const TOC = [
  { id: "scope", labelKey: "coc.toc.scope" },
  { id: "pact", labelKey: "coc.toc.pact" },
  { id: "harm", labelKey: "coc.toc.harm" },
  { id: "enforce", labelKey: "coc.toc.enforce" },
  { id: "appeal", labelKey: "coc.toc.appeal" },
  { id: "offplatform", labelKey: "coc.toc.offplatform" },
  { id: "changes", labelKey: "coc.toc.changes" },
];

export const PACT: PactItem[] = [
  {
    n: "01",
    titleKey: "coc.pact.item01.title",
    bodyKey: "coc.pact.item01.body",
  },
  {
    n: "02",
    titleKey: "coc.pact.item02.title",
    bodyKey: "coc.pact.item02.body",
  },
  {
    n: "03",
    titleKey: "coc.pact.item03.title",
    bodyKey: "coc.pact.item03.body",
  },
  {
    n: "04",
    titleKey: "coc.pact.item04.title",
    bodyKey: "coc.pact.item04.body",
  },
  {
    n: "05",
    titleKey: "coc.pact.item05.title",
    bodyKey: "coc.pact.item05.body",
  },
  {
    n: "06",
    titleKey: "coc.pact.item06.title",
    bodyKey: "coc.pact.item06.body",
  },
];

export const LADDER: LadderStep[] = [
  {
    n: "1",
    titleKey: "coc.ladder.step1.title",
    bodyKey: "coc.ladder.step1.body",
  },
  {
    n: "2",
    titleKey: "coc.ladder.step2.title",
    bodyKey: "coc.ladder.step2.body",
  },
  {
    n: "3",
    titleKey: "coc.ladder.step3.title",
    bodyKey: "coc.ladder.step3.body",
  },
  {
    n: "4",
    titleKey: "coc.ladder.step4.title",
    bodyKey: "coc.ladder.step4.body",
  },
  {
    n: "5",
    titleKey: "coc.ladder.step5.title",
    bodyKey: "coc.ladder.step5.body",
  },
];
