export interface NavStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

// Attributed peer quotes (a member's own words) — stay English per the
// scope rule, same precedent as therapist bios. Not routed through i18n.
export interface Tip {
  text: string;
  who: string;
}

export const STEPS: NavStep[] = [
  {
    n: "01",
    titleKey: "resources:disabilityHealthcare.step1.title",
    bodyKey: "resources:disabilityHealthcare.step1.body",
  },
  {
    n: "02",
    titleKey: "resources:disabilityHealthcare.step2.title",
    bodyKey: "resources:disabilityHealthcare.step2.body",
  },
  {
    n: "03",
    titleKey: "resources:disabilityHealthcare.step3.title",
    bodyKey: "resources:disabilityHealthcare.step3.body",
  },
  {
    n: "04",
    titleKey: "resources:disabilityHealthcare.step4.title",
    bodyKey: "resources:disabilityHealthcare.step4.body",
  },
];

export const TIPS: Tip[] = [
  {
    text: "Bring a one-page summary of your conditions and meds to every new doctor. It has saved me the fifteen-minutes-of-explaining tax more times than I can count.",
    who: "Mónica, disabled-queers",
  },
  {
    text: "Permission to rest is also part of healthcare. I had to learn that the appointment I cancel to protect a bad day is not a failure.",
    who: "Beatriz, disabled-queers",
  },
];
