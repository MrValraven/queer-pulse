import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Structural sub-headings inside each company's `about` block. They are UI
 * chrome (the same two labels repeat across every profile), not editorial
 * prose, so they are translated. Rendered as components because `about` is a
 * `ReactNode` mounted inside the React tree (CompanyTabs' AboutPane), which
 * lets these read the active locale via `useTranslation`.
 */
function HowWeWorkHeading() {
  const { t } = useTranslation();
  return <h3>{t("economy:company.about.howWeWorkHeading")}</h3>;
}

function WhatWeLookForHeading() {
  const { t } = useTranslation();
  return <h3>{t("economy:company.about.whatWeLookForHeading")}</h3>;
}

export interface CompanyBadge {
  label: string;
  /** verified = jade dot, coral = award-style, plain = neutral chip */
  kind?: "verified" | "coral" | "plain";
}

export interface CompanyStat {
  value: ReactNode;
  label: string;
}

export interface CompanyValue {
  title: string;
  description: string;
}

export interface CompanyReviewBar {
  label: string;
  percent: number;
  score: string;
}

export interface CompanyReview {
  title: string;
  /** 1–5 filled stars */
  stars: number;
  byline: string;
  body: string[];
}

export interface CompanyInfoRow {
  label: string;
  value: string;
}

export interface CompanyTeamAv {
  initials: string;
  tone?: "coral" | "jade" | "plum";
}

export interface CompanyWorkSlot {
  label: string;
  /** Optional real image; falls back to a labelled placeholder tile. */
  image?: string;
}

export interface CompanyProfile {
  slug: string;
  logo: string;
  logoBg: string;
  logoText: string;
  /** Rich name (supports a coral <em>). */
  name: ReactNode;
  /** Plain name — must match the `org` field in jobs.data to surface open roles. */
  nameText: string;
  tagline: string;
  badges: CompanyBadge[];
  /** Four headline stats; the page appends a live "Open roles" stat. */
  stats: CompanyStat[];
  about: ReactNode;
  values: CompanyValue[];
  reviewScore: string;
  reviewCount: number;
  reviewBars: CompanyReviewBar[];
  reviews: CompanyReview[];
  /** Optional portfolio tab; omitted companies hide the Work tab. */
  work?: CompanyWorkSlot[];
  info: CompanyInfoRow[];
  team: CompanyTeamAv[];
  teamCount: number;
  membersLabel: string;
  hiringContact: { name: string; role: string };
}

const PROFILES: CompanyProfile[] = [
  {
    slug: "atelier-pulso",
    logo: "AP",
    logoBg: "rgba(247,243,238,.10)",
    logoText: "var(--cream)",
    name: (
      <>
        Atelier <em>Pulso</em>
      </>
    ),
    nameText: "Atelier Pulso",
    tagline:
      "A brand and editorial studio in Príncipe Real. We make identity systems, books, and slow internet things — mostly for cultural institutions and independent labels.",
    badges: [
      { label: "Queer-run · verified", kind: "verified" },
      { label: "Lisbon", kind: "plain" },
      { label: "12 people", kind: "plain" },
      { label: "Inclusive Workplace 2025", kind: "coral" },
    ],
    stats: [
      { value: <em>2022</em>, label: "Founded" },
      { value: "12", label: "People · 7 queer" },
      { value: <em>4.7</em>, label: "Avg review · 11 reviews" },
      { value: "14", label: "Hires from QueerPulse" },
    ],
    about: (
      <>
        <p>
          Atelier Pulso is a <em>twelve-person studio</em> working in identity,
          editorial, and digital, founded in 2022 by Inês Mateus. We split our
          time between commissioned work for cultural institutions — mostly
          museums, magazines, and independent labels — and self-initiated
          projects (a magazine, a riso press, a small grants programme).
        </p>
        <p>
          About a third of our work is print. Another third is identity systems.
          The last third is whatever the work asks for — a website, a workshop,
          an exhibition design, a typeface. We don't have a separate "digital
          team" and "print team", we have a studio of people who care equally
          about both.
        </p>
        <HowWeWorkHeading />
        <p>
          Four-day week, year-round. Generous time off (<strong>28 days</strong>{" "}
          + bank holidays + your birthday). Sliding-scale compensation: same
          role pays the same regardless of where you started. Loud about queer
          presence in our work and quiet about it externally — we don't put
          rainbow logos on anything.
        </p>
        <WhatWeLookForHeading />
        <p>
          Curiosity. People who can <strong>show their reasoning</strong>, not
          just their output. We hire portfolio-blind for first-round — your CV
          and a written sample are what we read first. We've hired self-taught
          designers, career changers, and people without a degree.
        </p>
      </>
    ),
    values: [
      {
        title: "Four-day week",
        description: 'Closed Fridays. Same salary. No exceptions, no "in-office Friday for emergencies".',
      },
      {
        title: "Pay equity",
        description: "Salary bands are public to the team. Same role pays the same. We don't negotiate.",
      },
      {
        title: "Slow hiring",
        description: 'Three rounds max. Paid trial week is paid (€500 flat). No "culture fit" rejections.',
      },
      {
        title: "Time for your work",
        description: "One paid day per month for self-initiated work, magazine contributions, or volunteering.",
      },
    ],
    reviewScore: "4.7",
    reviewCount: 11,
    reviewBars: [
      { label: "Inclusion & safety", percent: 96, score: "4.9" },
      { label: "Pay & benefits", percent: 88, score: "4.5" },
      { label: "Work–life balance", percent: 94, score: "4.8" },
      { label: "Growth opportunities", percent: 80, score: "4.1" },
      { label: "Management", percent: 92, score: "4.6" },
    ],
    reviews: [
      {
        title: "A studio that walks the talk.",
        stars: 5,
        byline:
          "Designer, 2 years in role · trans / non-binary · still here · posted 14 days ago",
        body: [
          "Genuinely the first job where my pronouns being respected wasn't something I had to explain or maintain. New hires get a briefing. Clients who repeatedly misgender get a polite call.",
          "Pay is below Berlin/Amsterdam rates, in line with Lisbon. Four-day week is real — Inês will call you out if you Slack on a Friday.",
        ],
      },
      {
        title: "Slow growth, deep work.",
        stars: 4,
        byline:
          "Senior designer, 4 years in role · gay man · still here · posted 2 months ago",
        body: [
          "If you're looking for a big career ladder this isn't it — the studio is 12 people and stays 12 people on purpose. But if you want a job where you can make the best work of your life, this is it.",
          "Only nit: training budget is small. They'll pay for one big thing a year. Within that, generous.",
        ],
      },
      {
        title: "Hiring process is exactly as advertised.",
        stars: 5,
        byline:
          "Designer, 6 months in role · lesbian · still here · posted 4 months ago",
        body: [
          "I came in via QueerPulse and they did the paid trial week thing genuinely — €500 wired before I started, no strings if it didn't work out. It worked out.",
        ],
      },
    ],
    work: [
      { label: "Project 01 · Identity" },
      { label: "Project 02 · Editorial" },
      { label: "Project 03 · Riso book" },
      { label: "Project 04 · Exhibition" },
    ],
    info: [
      { label: "Founded", value: "2022" },
      { label: "Team size", value: "12 people" },
      { label: "Queer headcount", value: "7 / 12" },
      { label: "Working week", value: "4 days" },
      { label: "Office", value: "Príncipe Real" },
      { label: "Hybrid", value: "2–3 days in" },
      { label: "Languages", value: "EN · PT · ES" },
    ],
    team: [
      { initials: "IM" },
      { initials: "AB", tone: "jade" },
      { initials: "LB", tone: "plum" },
      { initials: "JT" },
      { initials: "SC", tone: "jade" },
      { initials: "NA", tone: "plum" },
      { initials: "RV" },
    ],
    teamCount: 7,
    membersLabel: "View all 7 members",
    hiringContact: {
      name: "Inês Mateus",
      role: "Founder & design director — handles all hiring personally.",
    },
  },
  {
    slug: "national-lgbtq-rights-org",
    logo: "LR",
    logoBg: "rgba(247,243,238,.10)",
    logoText: "var(--cream)",
    name: <>A national LGBTQ+ rights organisation</>,
    nameText: "A national LGBTQ+ rights organisation",
    tagline:
      "A long-established LGBTI+ rights organisation. Advocacy, legal support, and community programmes, nationwide.",
    badges: [
      { label: "Queer-led · verified", kind: "verified" },
      { label: "Lisbon", kind: "plain" },
      { label: "NGO", kind: "plain" },
    ],
    stats: [
      { value: <em>2004</em>, label: "Founded" },
      { value: "34", label: "Staff · 21 queer" },
      { value: <em>4.4</em>, label: "Avg review · 9 reviews" },
      { value: "6", label: "Hires from QueerPulse" },
    ],
    about: (
      <>
        <p>
          We have been doing this work for two decades — advocacy at the
          level of law and policy, a legal support line, a documentation centre,
          and community programmes that run out of our building in Lisbon
          and out into the country. We are a <em>membership organisation</em>,
          which means the people we serve are also the people we answer to.
        </p>
        <p>
          Working here is public-facing and, at times, heavy. We take that
          seriously: supervision is structured, boundaries are respected, and no
          one is asked to carry the hard parts alone. The pay is NGO pay, and we
          are honest about that up front.
        </p>
        <HowWeWorkHeading />
        <p>
          Permanent contracts after a probation period, <strong>25 days</strong>{" "}
          holiday plus public holidays, and a genuine training budget.
          Portuguese is essential for most roles; the work happens in the
          community's own language.
        </p>
      </>
    ),
    values: [
      {
        title: "Institutional weight",
        description: "Three decades of relationships with clinics, schools, and lawmakers. Your work lands where it counts.",
      },
      {
        title: "Supervision, always",
        description: "Front-line roles come with structured supervision. Care work is treated as work.",
      },
      {
        title: "We reply to everyone",
        description: "Applicants hear back whether or not we move forward. No black holes.",
      },
      {
        title: "Members first",
        description: "We answer to the community we serve, not to funders or a board that's never met us.",
      },
    ],
    reviewScore: "4.4",
    reviewCount: 9,
    reviewBars: [
      { label: "Inclusion & safety", percent: 98, score: "4.9" },
      { label: "Pay & benefits", percent: 66, score: "3.3" },
      { label: "Work–life balance", percent: 78, score: "3.9" },
      { label: "Growth opportunities", percent: 84, score: "4.2" },
      { label: "Management", percent: 88, score: "4.4" },
    ],
    reviews: [
      {
        title: "The mission carries you.",
        stars: 5,
        byline:
          "Programmes, 3 years in role · bisexual · still here · posted 3 weeks ago",
        body: [
          "You will not get rich here, and no one pretends otherwise. But the work is real, the team is kind, and the supervision means the hard days don't follow you home.",
        ],
      },
      {
        title: "Under-resourced, over-delivering.",
        stars: 4,
        byline:
          "Legal support, 5 years in role · gay man · still here · posted 2 months ago",
        body: [
          "The demand always outstrips the funding, so expect to wear several hats. Management is transparent about the budget, which helps. Pay is the honest weak point.",
        ],
      },
    ],
    info: [
      { label: "Founded", value: "2004" },
      { label: "Team size", value: "34 people" },
      { label: "Queer headcount", value: "21 / 34" },
      { label: "Working week", value: "5 days" },
      { label: "Office", value: "Lisbon" },
      { label: "Hybrid", value: "Mostly in-person" },
      { label: "Languages", value: "PT · EN" },
    ],
    team: [
      { initials: "MC" },
      { initials: "RP", tone: "jade" },
      { initials: "AF", tone: "plum" },
      { initials: "TS" },
      { initials: "LG", tone: "jade" },
    ],
    teamCount: 5,
    membersLabel: "View all 5 members",
    hiringContact: {
      name: "Programmes team",
      role: "Applications are read by the programmes team, not a recruiter.",
    },
  },
  {
    slug: "opus-diversus",
    logo: "OD",
    logoBg: "rgba(247,243,238,.10)",
    logoText: "var(--cream)",
    name: <>Opus Diversus</>,
    nameText: "Opus Diversus",
    tagline:
      "A Lisbon community organisation providing peer support, mental-health navigation, and advocacy for LGBTQ+ people.",
    badges: [
      { label: "Community org · verified", kind: "verified" },
      { label: "Lisbon", kind: "plain" },
      { label: "Mental health", kind: "plain" },
    ],
    stats: [
      { value: <em>2011</em>, label: "Founded" },
      { value: "9", label: "Staff · 8 queer" },
      { value: <em>4.6</em>, label: "Avg review · 7 reviews" },
      { value: "4", label: "Hires from QueerPulse" },
    ],
    about: (
      <>
        <p>
          Opus Diversus runs peer support groups, a mental-health navigation
          line, and advocacy work for LGBTQ+ people across Lisbon. This is{" "}
          <em>care work</em>, and we treat it as such — with supervision,
          boundaries, and real support for the people who hold the room.
        </p>
        <p>
          We hire for lived experience and the ability to be steady in a hard
          moment, not for a clinical CV. Training is provided, and no one runs a
          group alone before they're ready.
        </p>
        <HowWeWorkHeading />
        <p>
          Part-time and flexible around fixed group times.{" "}
          <strong>Ongoing clinical supervision</strong> for everyone on the
          front line. Your wellbeing is taken as seriously as the group's.
        </p>
      </>
    ),
    values: [
      {
        title: "Lived experience counts",
        description: "No formal qualification required for peer roles. We train you and never leave you unsupported.",
      },
      {
        title: "Supervision as standard",
        description: "Clinical supervision for every front-line facilitator. Care work needs care.",
      },
      {
        title: "Steady, not heroic",
        description: "Good boundaries beat burnout. We build rotas that let people last.",
      },
      {
        title: "We read everything",
        description: "Every application is read by us and answered, usually within a week.",
      },
    ],
    reviewScore: "4.6",
    reviewCount: 7,
    reviewBars: [
      { label: "Inclusion & safety", percent: 98, score: "4.9" },
      { label: "Pay & benefits", percent: 70, score: "3.5" },
      { label: "Work–life balance", percent: 90, score: "4.5" },
      { label: "Growth opportunities", percent: 76, score: "3.8" },
      { label: "Management", percent: 94, score: "4.7" },
    ],
    reviews: [
      {
        title: "They practise what they facilitate.",
        stars: 5,
        byline:
          "Facilitator, 2 years in role · trans / non-binary · still here · posted 1 month ago",
        body: [
          "The supervision is the real thing — I've never felt dropped after a heavy session. Part-time pay is modest, but the boundaries are so healthy it never tips into burnout.",
        ],
      },
      {
        title: "Small, warm, and honest.",
        stars: 4,
        byline:
          "Navigation, 1 year in role · queer · still here · posted 6 weeks ago",
        body: [
          "Nine people who genuinely like each other. Growth paths are limited by size, and they'll tell you that in the interview. Everything else is a gift.",
        ],
      },
    ],
    info: [
      { label: "Founded", value: "2011" },
      { label: "Team size", value: "9 people" },
      { label: "Queer headcount", value: "8 / 9" },
      { label: "Working week", value: "Flexible" },
      { label: "Office", value: "Lisbon" },
      { label: "Hybrid", value: "In-person groups" },
      { label: "Languages", value: "PT · EN" },
    ],
    team: [
      { initials: "SD" },
      { initials: "PM", tone: "jade" },
      { initials: "CR", tone: "plum" },
      { initials: "VN" },
    ],
    teamCount: 4,
    membersLabel: "View all 4 members",
    hiringContact: {
      name: "The Opus Diversus team",
      role: "We read every application ourselves and reply to all of them.",
    },
  },
  {
    slug: "livraria-devagar",
    logo: "LD",
    logoBg: "rgba(247,243,238,.10)",
    logoText: "var(--cream)",
    name: <>Livraria Devagar</>,
    nameText: "Livraria Devagar",
    tagline:
      "A queer-run independent bookshop opening in Anjos in 2026 — LGBTQ+ literature, translation, and small presses.",
    badges: [
      { label: "Queer-run · verified", kind: "verified" },
      { label: "Anjos", kind: "plain" },
      { label: "Opening 2026", kind: "coral" },
    ],
    stats: [
      { value: <em>2026</em>, label: "Opening" },
      { value: "3", label: "People · 3 queer" },
      { value: <em>5.0</em>, label: "Avg review · 2 reviews" },
      { value: "2", label: "Hires from QueerPulse" },
    ],
    about: (
      <>
        <p>
          Livraria Devagar is a new queer bookshop opening in Anjos in September
          2026. We're small, we're deliberate, and we want the people who help
          us open the doors to have <em>real say</em> in what the shop becomes —
          the sections, the events, the feel of the place.
        </p>
        <p>
          This is retail — tills, shelves, slow afternoons — but it's also
          community work. The right person will love both halves equally.
        </p>
        <HowWeWorkHeading />
        <p>
          Founding roles with genuine ownership.{" "}
          <strong>Staff discount, first read of the new stock</strong>, and a
          workplace built by and for the community from the first day.
        </p>
      </>
    ),
    values: [
      {
        title: "A founding voice",
        description: "Join before we open and help shape the sections, the events, and the shop's whole feel.",
      },
      {
        title: "Books first",
        description: "A real love of queer literature matters more than a retail CV. We'll teach the till.",
      },
      {
        title: "Slow on purpose",
        description: "We're called Devagar for a reason. No rush, no churn, no pressure to upsell.",
      },
      {
        title: "Community, not footfall",
        description: "Readings, launches, and a space that belongs to the neighbourhood as much as to us.",
      },
    ],
    reviewScore: "5.0",
    reviewCount: 2,
    reviewBars: [
      { label: "Inclusion & safety", percent: 100, score: "5.0" },
      { label: "Pay & benefits", percent: 72, score: "3.6" },
      { label: "Work–life balance", percent: 96, score: "4.8" },
      { label: "Growth opportunities", percent: 80, score: "4.0" },
      { label: "Management", percent: 98, score: "4.9" },
    ],
    reviews: [
      {
        title: "Getting in on the ground floor.",
        stars: 5,
        byline:
          "Bookseller (founding) · lesbian · still here · posted 3 weeks ago",
        body: [
          "I helped pick the poetry section. Where else does a part-time bookseller get to do that? Pay is modest and the shop isn't even open yet — but it feels like ours.",
        ],
      },
    ],
    info: [
      { label: "Opening", value: "Sept 2026" },
      { label: "Team size", value: "3 people" },
      { label: "Queer headcount", value: "3 / 3" },
      { label: "Working week", value: "Part-time" },
      { label: "Office", value: "Anjos" },
      { label: "Hybrid", value: "In-person" },
      { label: "Languages", value: "PT · EN" },
    ],
    team: [
      { initials: "BF" },
      { initials: "MT", tone: "jade" },
      { initials: "GA", tone: "plum" },
    ],
    teamCount: 3,
    membersLabel: "View all 3 members",
    hiringContact: {
      name: "The founders",
      role: "Tell us about a book that mattered to you — that's what we read first.",
    },
  },
  {
    slug: "queerpulse",
    logo: "QP",
    logoBg: "rgba(247,243,238,.10)",
    logoText: "var(--cream)",
    name: (
      <>
        Queer<em>Pulse</em>
      </>
    ),
    nameText: "QueerPulse",
    tagline:
      "The community platform behind this network — a small, remote-friendly team building tools for queer life in Lisbon and beyond.",
    badges: [
      { label: "Queer-run · verified", kind: "verified" },
      { label: "Lisbon + remote", kind: "plain" },
      { label: "Platform", kind: "plain" },
    ],
    stats: [
      { value: <em>2023</em>, label: "Founded" },
      { value: "16", label: "People · 14 queer" },
      { value: <em>4.8</em>, label: "Avg review · 12 reviews" },
      { value: "9", label: "Hires from QueerPulse" },
    ],
    about: (
      <>
        <p>
          QueerPulse is the platform you're reading this on — a{" "}
          <em>member-owned</em> community network with a jobs board, a magazine,
          a directory, and a growing set of tools for queer economic life. The
          team is small, remote-friendly, and builds in the open.
        </p>
        <p>
          We hire slowly and we hire people, not résumés. Everything we ask of
          the employers on this board — pay transparency, real inclusion, honest
          hiring — we hold ourselves to first.
        </p>
        <HowWeWorkHeading />
        <p>
          Remote-first with a Lisbon anchor.{" "}
          <strong>Transparent salary bands</strong>, four weeks off, and
          equipment and setup covered wherever you are.
        </p>
      </>
    ),
    values: [
      {
        title: "Build in the open",
        description: "Roadmaps, salary bands, and decisions are shared with the team. No mystery.",
      },
      {
        title: "Practise what we list",
        description: "Every standard we hold employers to, we meet ourselves — starting with pay transparency.",
      },
      {
        title: "Remote, not scattered",
        description: "Async by default, a Lisbon anchor for those who want it, real overlap hours for the rest.",
      },
      {
        title: "People over résumés",
        description: "We read written samples before CVs and hire for judgement, not pedigree.",
      },
    ],
    reviewScore: "4.8",
    reviewCount: 12,
    reviewBars: [
      { label: "Inclusion & safety", percent: 100, score: "5.0" },
      { label: "Pay & benefits", percent: 90, score: "4.5" },
      { label: "Work–life balance", percent: 92, score: "4.6" },
      { label: "Growth opportunities", percent: 88, score: "4.4" },
      { label: "Management", percent: 94, score: "4.7" },
    ],
    reviews: [
      {
        title: "The mission isn't a poster.",
        stars: 5,
        byline:
          "Engineer, 1 year in role · trans / non-binary · still here · posted 2 weeks ago",
        body: [
          "Every value on the careers page is something I've watched a manager act on. Pay bands are public internally. It's the most honest workplace I've been in.",
        ],
      },
      {
        title: "Small team, big surface.",
        stars: 5,
        byline:
          "Product, 8 months in role · queer · still here · posted 1 month ago",
        body: [
          "You'll touch a lot because the team is lean — that's the trade for the ownership you get. Async works well; overlap hours are respected.",
        ],
      },
    ],
    info: [
      { label: "Founded", value: "2023" },
      { label: "Team size", value: "16 people" },
      { label: "Queer headcount", value: "14 / 16" },
      { label: "Working week", value: "5 days" },
      { label: "Office", value: "Lisbon + remote" },
      { label: "Hybrid", value: "Remote-first" },
      { label: "Languages", value: "EN · PT" },
    ],
    team: [
      { initials: "DL" },
      { initials: "KR", tone: "jade" },
      { initials: "HM", tone: "plum" },
      { initials: "TS" },
      { initials: "AO", tone: "jade" },
      { initials: "PW", tone: "plum" },
    ],
    teamCount: 6,
    membersLabel: "View all 6 members",
    hiringContact: {
      name: "The QueerPulse team",
      role: "First review is by the team you'd join, never a recruiter.",
    },
  },
];

export const COMPANY_PROFILES: Record<string, CompanyProfile> =
  Object.fromEntries(PROFILES.map((p) => [p.slug, p]));

/** Map an employer display name (jobs.data `org`) to its profile slug. */
export const COMPANY_SLUG_BY_NAME: Record<string, string> = Object.fromEntries(
  PROFILES.map((p) => [p.nameText, p.slug]),
);
