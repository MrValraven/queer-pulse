export interface HowStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

// Attributed peer quotes (a member's own words) — stay English per the
// scope rule, same precedent as therapist bios. Not routed through i18n.
export interface Voice {
  text: string;
  who: string;
}

export const STEPS: HowStep[] = [
  {
    n: "01",
    titleKey: "resources:oralHistoryProject.step1.title",
    bodyKey: "resources:oralHistoryProject.step1.body",
  },
  {
    n: "02",
    titleKey: "resources:oralHistoryProject.step2.title",
    bodyKey: "resources:oralHistoryProject.step2.body",
  },
  {
    n: "03",
    titleKey: "resources:oralHistoryProject.step3.title",
    bodyKey: "resources:oralHistoryProject.step3.body",
  },
  {
    n: "04",
    titleKey: "resources:oralHistoryProject.step4.title",
    bodyKey: "resources:oralHistoryProject.step4.body",
  },
];

export const VOICES: Voice[] = [
  {
    text: "I wasn't prepared for how much this would move me. I'm treating each recording with everything I have.",
    who: "Sofia, interviewer",
  },
  {
    text: "I didn't think anyone would want my ordinary life on tape. Telling it back was the first time it felt like it had mattered.",
    who: "A participant",
  },
];
