export interface FormStep {
  n: string;
  titleKey: string;
  bodyKey: string;
}

export interface Right {
  badge: "protected" | "know" | "practical";
  titleKey: string;
  bodyKey: string;
}

// Attributed peer quotes (a member's own words) — stay English per the
// scope rule, same precedent as therapist bios. Not routed through i18n.
export interface Voice {
  text: string;
  who: string;
}

export const ON_FORMS: FormStep[] = [
  {
    n: "01",
    titleKey: "resources:schoolFormsGuide.form1.title",
    bodyKey: "resources:schoolFormsGuide.form1.body",
  },
  {
    n: "02",
    titleKey: "resources:schoolFormsGuide.form2.title",
    bodyKey: "resources:schoolFormsGuide.form2.body",
  },
  {
    n: "03",
    titleKey: "resources:schoolFormsGuide.form3.title",
    bodyKey: "resources:schoolFormsGuide.form3.body",
  },
];

export const RIGHTS: Right[] = [
  {
    badge: "protected",
    titleKey: "resources:schoolFormsGuide.right1.title",
    bodyKey: "resources:schoolFormsGuide.right1.body",
  },
  {
    badge: "know",
    titleKey: "resources:schoolFormsGuide.right2.title",
    bodyKey: "resources:schoolFormsGuide.right2.body",
  },
  {
    badge: "practical",
    titleKey: "resources:schoolFormsGuide.right3.title",
    bodyKey: "resources:schoolFormsGuide.right3.body",
  },
];

export const VOICES: Voice[] = [
  {
    text: "My kid starts school in September. The intake form had two parent fields, no gender specified. I asked about using both our names everywhere and they said yes without hesitation.",
    who: "Nuno, queer-parents",
  },
  {
    text: 'We crossed out "mãe / pai" and wrote our names. The teacher photocopied it as the example for the office. Small thing, but it mattered.',
    who: "Carla, queer-parents",
  },
];
