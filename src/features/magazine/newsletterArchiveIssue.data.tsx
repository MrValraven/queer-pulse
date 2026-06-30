import { type ReactNode } from "react";

export interface IssueLink {
  label: string;
  meta: string;
}

export interface IssueSection {
  kicker: string;
  heading: ReactNode;
  body: ReactNode;
  links?: IssueLink[];
}

export interface NewsletterIssue {
  slug: string;
  stream: string;
  streamLabel: string;
  issueNo: string;
  date: string;
  readTime: string;
  openRate: string;
  recipients: string;
  subject: ReactNode;
  standfirst: string;
  sections: IssueSection[];
  signoff: { from: string; role: string; note: string };
}

/**
 * Rendered sent-newsletter content, keyed by slug (the issue number used in
 * the archive rows). Different slugs surface different issues; an unknown slug
 * falls back to FALLBACK_ISSUE.
 */
export const ISSUES: Record<string, NewsletterIssue> = {
  "52": {
    slug: "52",
    stream: "dispatch",
    streamLabel: "Community dispatch · fortnightly",
    issueNo: "52",
    date: "8 June 2026",
    readTime: "~ 8 min read",
    openRate: "61% open rate",
    recipients: "8,420 inboxes",
    subject: (
      <>
        The summer slowdown <em>edition.</em>
      </>
    ),
    standfirst:
      "Summer reading list, July gatherings calendar, and the new vetted-therapist additions. We slow the cadence in August — here is everything before we do.",
    sections: [
      {
        kicker: "What we are reading",
        heading: <>Six books for a quieter month</>,
        body: "We asked the reading-groups cohort what they are carrying to the beach, the clinic waiting room, the train. The list skews tender this time — less theory, more memoir. Two are translations debuting in Portuguese this summer.",
        links: [
          { label: "The full summer reading list", meta: "6 titles · 2 in PT" },
          { label: "Join a reading group", meta: "Next cohort opens 1 July" },
        ],
      },
      {
        kicker: "July gatherings",
        heading: (
          <>
            Who is hosting <em>while it is warm</em>
          </>
        ),
        body: "Eleven gatherings on the July calendar, three of them brand new hosts. The back room of Café Beirão keeps its Thursday slot. The sober social moves outdoors to the Jardim da Estrela for the season.",
        links: [
          {
            label: "July gatherings calendar",
            meta: "11 events · Lisbon & Porto",
          },
          {
            label: "Café Beirão back-room schedule",
            meta: "Thursdays · 19:00",
          },
        ],
      },
      {
        kicker: "Trans Hub",
        heading: <>Four new vetted therapists</>,
        body: "Our care team re-checked the provider list this fortnight and added four names — two endocrinology-adjacent, two affirming psychotherapists taking new clients. All re-verified within the last 90 days.",
        links: [
          {
            label: "The updated vetted-providers list",
            meta: "47 names · re-checked",
          },
        ],
      },
      {
        kicker: "From the magazine",
        heading: (
          <>
            Sara's cover piece, <em>the shorter take</em>
          </>
        ),
        body: "We pulled Sara Pinheiro's Issue 09 cover story into a five-minute read for anyone who missed the long-form. The whole thing is still online, free, no wall.",
        links: [
          { label: "Read the cover story", meta: "Issue 09 · ~ 18 min full" },
        ],
      },
    ],
    signoff: {
      from: "The QueerPulse team",
      role: "Community dispatch",
      note: "Reply to this email any time — a real person reads it. See you in two weeks (and a little slower in August).",
    },
  },
  "51": {
    slug: "51",
    stream: "dispatch",
    streamLabel: "Community dispatch · fortnightly",
    issueNo: "51",
    date: "25 May 2026",
    readTime: "~ 7 min read",
    openRate: "59% open rate",
    recipients: "8,310 inboxes",
    subject: (
      <>
        Pride month, and the <em>boring stuff that matters.</em>
      </>
    ),
    standfirst:
      "March schedule, legal-observer recruitment, an open call for 2026 grants. Plus a small piece on the Mercearia Rosa and why we keep showing up for the unglamorous parts.",
    sections: [
      {
        kicker: "The march",
        heading: <>Full schedule and meeting points</>,
        body: "The route is confirmed. We march from Príncipe Real at 16:00. Accessible-pace block at the front, sober contingent meeting at the fountain, marshals in jade vests.",
        links: [
          {
            label: "March schedule & meeting points",
            meta: "Sat · 16:00 start",
          },
        ],
      },
      {
        kicker: "We need you",
        heading: (
          <>
            Legal observers, <em>training provided</em>
          </>
        ),
        body: "We are recruiting twelve legal observers for the march. No experience needed — there is a two-hour training the Wednesday before. Know your rights, watch out for everyone else.",
        links: [
          {
            label: "Sign up as a legal observer",
            meta: "12 spots · training Wed",
          },
        ],
      },
      {
        kicker: "Open call",
        heading: <>2026 micro-grants are open</>,
        body: "Up to €1,500 per project, for community-led work. Last year we funded a binder library, a rural support line, and two zines. Applications close end of July.",
        links: [
          {
            label: "Apply for a 2026 micro-grant",
            meta: "Up to €1,500 · closes Jul",
          },
        ],
      },
    ],
    signoff: {
      from: "The QueerPulse team",
      role: "Community dispatch",
      note: "The boring stuff is the work. Thank you for reading to the end of it.",
    },
  },
  "50": {
    slug: "50",
    stream: "dispatch",
    streamLabel: "Community dispatch · fortnightly",
    issueNo: "50",
    date: "11 May 2026",
    readTime: "~ 9 min read",
    openRate: "68% open rate",
    recipients: "8,400 inboxes",
    subject: (
      <>
        Fiftieth dispatch. A little <em>thank you.</em>
      </>
    ),
    standfirst:
      "Two years, fifty issues. A short retrospective, plus the usual: gatherings, jobs, new members, and what we are reading this fortnight.",
    sections: [
      {
        kicker: "Two years",
        heading: <>Fifty issues, in numbers</>,
        body: "We started this dispatch from a single kitchen table with 60 subscribers. Fifty issues later there are 8,400 of you, across two languages, in eleven cities. We are a little stunned.",
        links: [
          {
            label: "The two-year retrospective",
            meta: "60 → 8,400 subscribers",
          },
        ],
      },
      {
        kicker: "This fortnight",
        heading: (
          <>
            Gatherings, jobs <em>and new faces</em>
          </>
        ),
        body: "Nine gatherings, fourteen new jobs on the board (three explicitly trans-inclusive employers), and forty-one new members vouched in since the last issue. Say hello in the welcome thread.",
        links: [
          { label: "This fortnight's gatherings", meta: "9 events" },
          { label: "New on the jobs board", meta: "14 roles" },
        ],
      },
    ],
    signoff: {
      from: "The QueerPulse team",
      role: "Community dispatch",
      note: "Here is to the next fifty. Genuinely — thank you for being here.",
    },
  },
  "18": {
    slug: "18",
    stream: "long",
    streamLabel: "Long reads · monthly",
    issueNo: "18",
    date: "6 June 2026",
    readTime: "~ 16 min read",
    openRate: "72% open rate",
    recipients: "2,100 inboxes",
    subject: (
      <>
        Five things I learned <em>navigating Lisbon's trans health system.</em>
      </>
    ),
    standfirst:
      "The full long-form, sent direct from Sara Pinheiro — Issue 09's cover story, distributed as this month's long-reads pick. One essay, no summary.",
    sections: [
      {
        kicker: "One",
        heading: <>The waiting is the system</>,
        body: "Nobody hands you a map. The first thing I learned is that the waiting list is not a queue to a door — it is the door. Treating the wait as the process, rather than an interruption of it, changed how I survived it.",
      },
      {
        kicker: "Two",
        heading: (
          <>
            A good GP is <em>worth a year of effort</em>
          </>
        ),
        body: "Find one affirming, curious GP and the whole system reorganises around you. Mine wrote the referral the others would not. I changed practices three times to find her. It was the single highest-leverage thing I did.",
      },
      {
        kicker: "Three",
        heading: <>Bring someone to appointments</>,
        body: "Not for protection — for memory. The second person hears what you, flooded with adrenaline, do not. Mine kept a notebook. Half of what I know about my own care is in that notebook.",
      },
    ],
    signoff: {
      from: "Sara Pinheiro",
      role: "Contributing writer · Issue 09 cover",
      note: "This is the long version. If it was useful, forward it to one person who is at the start of theirs.",
    },
  },
  "08": {
    slug: "08",
    stream: "trans",
    streamLabel: "Trans Hub bulletin · monthly",
    issueNo: "08",
    date: "20 May 2026",
    readTime: "~ 6 min read",
    openRate: "74% open rate",
    recipients: "1,600 inboxes",
    subject: (
      <>
        The 2026 vetted-providers list — <em>refreshed.</em>
      </>
    ),
    standfirst:
      "47 names, all re-checked within the last 90 days. New endocrinology and gynaecology entries this round, plus anonymised case notes from the care team.",
    sections: [
      {
        kicker: "The list",
        heading: <>47 providers, all re-verified</>,
        body: "Every name on the list has been re-confirmed as taking patients and practising affirmingly within the last 90 days. Eight names dropped off; six were added. We never list a provider we have not had a member experience with.",
        links: [
          {
            label: "Open the vetted-providers list",
            meta: "47 names · members only",
          },
        ],
      },
      {
        kicker: "New this round",
        heading: (
          <>
            Endocrinology <em>and gynaecology</em>
          </>
        ),
        body: "Two endocrinologists in the public system who came recommended by three members each, and one private gynaecologist with explicit trans-competency training. Notes on wait times and costs are on each entry.",
      },
    ],
    signoff: {
      from: "The Trans Hub care team",
      role: "Trans Hub bulletin",
      note: "If a provider on this list treats you badly, tell us. The list is only as good as your honesty about it.",
    },
  },
};

export const FALLBACK_ISSUE: NewsletterIssue = ISSUES["52"]!;

export function getIssue(slug: string | undefined): NewsletterIssue {
  if (!slug) return FALLBACK_ISSUE;
  return ISSUES[slug] ?? FALLBACK_ISSUE;
}
