export interface CritStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

export interface CritExample {
  goodKey: string;
  avoidKey: string;
}

export const PRINCIPLE_KEY = "resources:artCritGuide.principle.body";

export const FLOW: CritStep[] = [
  {
    n: "01",
    titleKey: "resources:artCritGuide.flow.step1.title",
    bodyKey: "resources:artCritGuide.flow.step1.body",
  },
  {
    n: "02",
    titleKey: "resources:artCritGuide.flow.step2.title",
    bodyKey: "resources:artCritGuide.flow.step2.body",
  },
  {
    n: "03",
    titleKey: "resources:artCritGuide.flow.step3.title",
    bodyKey: "resources:artCritGuide.flow.step3.body",
  },
  {
    n: "04",
    titleKey: "resources:artCritGuide.flow.step4.title",
    bodyKey: "resources:artCritGuide.flow.step4.body",
  },
];

export const EXAMPLES: CritExample[] = [
  {
    goodKey: "resources:artCritGuide.example1.good",
    avoidKey: "resources:artCritGuide.example1.avoid",
  },
  {
    goodKey: "resources:artCritGuide.example2.good",
    avoidKey: "resources:artCritGuide.example2.avoid",
  },
  {
    goodKey: "resources:artCritGuide.example3.good",
    avoidKey: "resources:artCritGuide.example3.avoid",
  },
];
