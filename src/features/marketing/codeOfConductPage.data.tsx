import { type ReactNode } from "react";

export interface LadderStep {
  n: string;
  title: string;
  body: ReactNode;
}

export interface PactItem {
  n: string;
  title: string;
  body: string;
}

export const TOC = [
  { id: "scope", label: "Scope" },
  { id: "pact", label: "The six" },
  { id: "harm", label: "What counts as harm" },
  { id: "enforce", label: "How we enforce" },
  { id: "appeal", label: "Appeals" },
  { id: "offplatform", label: "Off-platform" },
  { id: "changes", label: "Changes & versioning" },
];

export const PACT: PactItem[] = [
  { n: "01", title: "Out anyone, ever.", body: "Including with the best of intentions. Including in private. Including \"just to a small group\". Their identity is theirs to share. Includes deadnaming, sharing legal names without consent, posting screenshots that out a member to anyone they hadn't already chosen." },
  { n: "02", title: "Misgender on purpose.", body: "Mistakes are mistakes. Self-correction is welcome and expected. Repeated misgendering — particularly after correction — is treated as harassment." },
  { n: "03", title: "Threaten or stalk.", body: "Threats of physical violence, of outing, of unwanted contact. Following someone across the platform after they've asked you to stop. Coordinated pile-ons. Reporting to law enforcement." },
  { n: "04", title: "Use slurs as slurs.", body: "Reclaimed use within community is welcome. Use against another person, or to refer to a group derogatorily — including queerphobic, racist, ableist, antisemitic, anti-Roma, Islamophobic, and casteist slurs — is grounds for immediate suspension." },
  { n: "05", title: "Solicit sexually without consent.", body: "Unsolicited explicit messages, images, or proposals. This includes \"compliments\" that escalate, persistent advances after a no, and assuming consent in shared spaces." },
  { n: "06", title: "Weaponise the platform against members.", body: "Using your access — to invites, to events, to DMs, to information shared in trust — against other members. Includes journalism with members as subjects without their consent. Includes scraping. Includes deceptive identity." },
];

export const LADDER: LadderStep[] = [
  { n: "1", title: "Quiet word", body: <>A moderator messages you directly. Not public. Not on your record after 90 days if no escalation. <em>Most situations resolve here.</em></> },
  { n: "2", title: "Content removed + warning", body: <>The specific post/comment/message is removed. A formal warning is added to your record. You can appeal in 7 days.</> },
  { n: "3", title: "Temporary suspension", body: <>You're signed out and can't post or message for 3, 7, or 30 days depending on severity. You can still read public content, attend already-RSVPed gatherings, and use crisis services.</> },
  { n: "4", title: "Permanent removal", body: <>Your account is closed. Connections are notified that you've left the platform without naming why (unless the violation was public). Refund of any active Sustainer membership pro-rated. <em>You can appeal once.</em></> },
  { n: "5", title: "Legal referral", body: <>For violations that may also be crimes — credible threats, doxxing of vulnerable members, hate crimes — we co-report with the member (if they consent) to ILGA Portugal and / or law enforcement.</> },
];
