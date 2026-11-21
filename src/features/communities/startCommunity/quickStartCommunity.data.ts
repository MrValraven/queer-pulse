import type { QuickStep } from "./quickStartCommunity.model";

export interface QuickStepCopy {
  titleKey: string;
  leadKey: string;
  nextLabelKey: string;
}

/** The heading, lead line and forward button label of each quick step. */
export const QUICK_STEP_COPY: Record<QuickStep, QuickStepCopy> = {
  1: {
    titleKey: "communities:start.quick.step.name.title",
    leadKey: "communities:start.quick.step.name.lead",
    nextLabelKey: "communities:start.quick.next.who",
  },
  2: {
    titleKey: "communities:start.quick.step.who.title",
    leadKey: "communities:start.quick.step.who.lead",
    nextLabelKey: "communities:start.quick.next.open",
  },
  3: {
    titleKey: "communities:start.quick.step.open.title",
    leadKey: "communities:start.quick.step.open.lead",
    nextLabelKey: "communities:start.quick.next.submit",
  },
};
