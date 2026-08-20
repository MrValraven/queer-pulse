import type { GovernanceProposalDTO } from "./api/governanceProposals.api";

/**
 * Demo-mode fixture for the Governance page's Proposals section — no backend
 * of its own in demo (mirrors the Roadmap page's demo voting: each page load
 * starts fresh, `myVote` is always `null`, and the vote buttons track "just
 * voted" locally per card rather than persisting). One open proposal of each
 * type, plus one resolved example of each outcome, so every visual state
 * (open/passed/failed, council/funding) renders in demo mode.
 */
const now = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

export const DEMO_GOVERNANCE_PROPOSALS: GovernanceProposalDTO[] = [
  {
    id: "demo-council-removal-open",
    type: "council_removal",
    title: "Remove Jonas Ferreira from the advisory council",
    description:
      "Jonas has missed the last four council meetings and hasn't responded to member appeals for six weeks. Proposed by the moderation team under the council's own accountability clause.",
    targetMemberId: "demo-jonas",
    targetMember: {
      slug: "jonas",
      firstName: "Jonas",
      lastName: "Ferreira",
      avatarUrl: null,
    },
    status: "open",
    opensAt: new Date(now - 2 * DAY_MS).toISOString(),
    closesAt: new Date(now + 5 * DAY_MS).toISOString(),
    tally: { for: 34, against: 11, forPercent: 76 },
    myVote: null,
  },
  {
    id: "demo-funding-change-open",
    type: "funding_change",
    title: "Accept a restricted grant from a municipal LGBTQ+ office",
    description:
      "A city LGBTQ+ affairs office has offered a €1,500 restricted grant for the mental-health fund, with no editorial or platform influence attached. This would be our first government-linked funding, so per our principles it goes to a community vote before we accept anything.",
    targetMemberId: null,
    targetMember: null,
    status: "open",
    opensAt: new Date(now - 4 * DAY_MS).toISOString(),
    closesAt: new Date(now + 3 * DAY_MS).toISOString(),
    tally: { for: 58, against: 22, forPercent: 73 },
    myVote: null,
  },
  {
    id: "demo-council-removal-passed",
    type: "council_removal",
    title: "Remove the outgoing housing-activist seat",
    description:
      "Catarina Vaz stepped back from active community work in June and requested the council formally open her seat for replacement.",
    targetMemberId: "demo-catarina",
    targetMember: {
      slug: "catarina-vaz",
      firstName: "Catarina",
      lastName: "Vaz",
      avatarUrl: null,
    },
    status: "passed",
    opensAt: new Date(now - 21 * DAY_MS).toISOString(),
    closesAt: new Date(now - 14 * DAY_MS).toISOString(),
    tally: { for: 61, against: 4, forPercent: 94 },
    myVote: "for",
  },
  {
    id: "demo-funding-change-failed",
    type: "funding_change",
    title: "Accept sponsored placement from a dating-app brand",
    description:
      "A dating app offered €2,000/quarter for a footer placement on the Governance page. The council flagged a potential conflict with our no-corporate-funding principle and put it to a vote.",
    targetMemberId: null,
    targetMember: null,
    status: "failed",
    opensAt: new Date(now - 40 * DAY_MS).toISOString(),
    closesAt: new Date(now - 33 * DAY_MS).toISOString(),
    tally: { for: 9, against: 71, forPercent: 11 },
    myVote: "against",
  },
];
