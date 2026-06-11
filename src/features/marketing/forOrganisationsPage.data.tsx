import { type ReactNode } from "react";

export interface ProcessStep {
  n: string;
  title: string;
  body: ReactNode;
}

export interface Partner {
  logo: string;
  logoCls: string;
  type: string;
  name: ReactNode;
  since: string;
  desc: string;
}

export const NOT_DO: ReactNode[] = [
  <><b>Pride-month campaigns.</b> Not in June, not ever. Members would (rightly) leave.</>,
  <><b>Sell our member list.</b> No targeting, no segmentation, no warm intros for a fee.</>,
  <><b>"Sponsored posts" or branded content</b> in the magazine, feed, or podcast.</>,
  <><b>Rainbow logos.</b> We don't add yours and we don't loan ours.</>,
  <><b>Recruit on your behalf.</b> Companies post jobs through Jobs like everyone else.</>,
];

export const PROCESS: ProcessStep[] = [
  { n: "01", title: "Email or a call", body: <>Tell us what you do, what you'd like, what's not negotiable on your side. <em>30 min, no commitment.</em></> },
  { n: "02", title: "An in-person meeting", body: <>Coffee in Lisbon if you're here, or video. We talk through how the seam would work — operationally, not theoretically.</> },
  { n: "03", title: "Two-page proposal", body: <>One of us drafts it; both sides edit. Includes <b>exit conditions</b>, public-disagreement clauses, and money flow.</> },
  { n: "04", title: "Assembly sign-off", body: <>Operational partnerships go to the monthly Assembly. The Sustainer membership weighs in. <em>~10% of partnerships are vetoed.</em></> },
];

export const PARTNERS: Partner[] = [
  { logo: "ILGA", logoCls: "", type: "Operational · founding", name: <>ILGA <em>Portugal</em></>, since: "Partnered since 2022", desc: "Operational case-bridge, free legal consults, joint advocacy. The 4-year-old seam that proves this model." },
  { logo: "CL", logoCls: "logoCoral", type: "Operational · 2024", name: <>Clínica <em>do Largo</em></>, since: "Partnered since 2024", desc: "Open clinic nights, trans-affirming care pathway, vouching for QP-verified therapists." },
  { logo: "FG", logoCls: "logoJade", type: "Programme funder", name: <>Fundação <em>Gulbenkian</em></>, since: "Funder since 2025", desc: "Three-year grant for the micro-grants fund. €60k/year. Quarterly reports + annual audit." },
];
