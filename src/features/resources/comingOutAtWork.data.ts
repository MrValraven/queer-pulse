export interface Consideration {
  titleKey: string;
  bodyKey: string;
}

export interface Signal {
  badge: "good" | "caution";
  textKey: string;
}

export interface Script {
  contextKey: string;
  lineKey: string;
}

// Attributed peer quotes (a member's own words) — stay English per the
// scope rule, same precedent as therapist bios. Not routed through i18n.
export interface Voice {
  text: string;
  who: string;
}

export const TIMING: Consideration[] = [
  {
    titleKey: "resources:comingOutAtWork.timing1.title",
    bodyKey: "resources:comingOutAtWork.timing1.body",
  },
  {
    titleKey: "resources:comingOutAtWork.timing2.title",
    bodyKey: "resources:comingOutAtWork.timing2.body",
  },
  {
    titleKey: "resources:comingOutAtWork.timing3.title",
    bodyKey: "resources:comingOutAtWork.timing3.body",
  },
];

export const SIGNALS: Signal[] = [
  { badge: "good", textKey: "resources:comingOutAtWork.signal1.text" },
  { badge: "good", textKey: "resources:comingOutAtWork.signal2.text" },
  { badge: "good", textKey: "resources:comingOutAtWork.signal3.text" },
  { badge: "caution", textKey: "resources:comingOutAtWork.signal4.text" },
  { badge: "caution", textKey: "resources:comingOutAtWork.signal5.text" },
  { badge: "caution", textKey: "resources:comingOutAtWork.signal6.text" },
];

export const SCRIPTS: Script[] = [
  {
    contextKey: "resources:comingOutAtWork.script1.context",
    lineKey: "resources:comingOutAtWork.script1.line",
  },
  {
    contextKey: "resources:comingOutAtWork.script2.context",
    lineKey: "resources:comingOutAtWork.script2.line",
  },
  {
    contextKey: "resources:comingOutAtWork.script3.context",
    lineKey: "resources:comingOutAtWork.script3.line",
  },
];

export const IF_BAD: Consideration[] = [
  {
    titleKey: "resources:comingOutAtWork.bad1.title",
    bodyKey: "resources:comingOutAtWork.bad1.body",
  },
  {
    titleKey: "resources:comingOutAtWork.bad2.title",
    bodyKey: "resources:comingOutAtWork.bad2.body",
  },
  {
    titleKey: "resources:comingOutAtWork.bad3.title",
    bodyKey: "resources:comingOutAtWork.bad3.body",
  },
];

export const VOICES: Voice[] = [
  {
    text: "I told one person first. By the time the rest of the office knew, it had already become completely unremarkable. That's the version I'd recommend.",
    who: "A member, coming-out space",
  },
  {
    text: "It did not go well, and I got through it, with the network, the legal templates, and a new job six months later. Even the bad version is survivable.",
    who: "A member, coming-out space",
  },
];
