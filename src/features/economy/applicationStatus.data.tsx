import type {
  Application,
  BadgeKind,
  StageState,
  LogoTint,
} from "./applicationStatus.types";

// Types live in ./applicationStatus.types and the state-transition / negotiation
// helpers in ./applicationStatus.patches. Import those symbols directly from
// their own modules — this file no longer re-exports them (a compat barrel that
// mixes value + type re-exports here trips react-refresh/only-export-components).

export const BADGE_CLASS: Record<BadgeKind, string> = {
  "in-review": "badgeInReview",
  interview: "badgeInterview",
  offer: "badgeOffer",
  rejected: "badgeRejected",
  draft: "badgeDraft",
  attention: "badgeAttention",
};
export const STAGE_CLASS: Record<StageState, string> = {
  "": "",
  done: "stageDone",
  active: "stageActive",
  rejected: "stageRejected",
};
export const LOGO_CLASS: Record<LogoTint, string> = {
  "": "",
  jade: "logoJade",
  plum: "logoPlum",
  draft: "logoDraft",
};

export const APPS: Application[] = [
  {
    id: "atelier-pulso",
    category: "active",
    logo: "AP",
    logoTint: "",
    title: "Junior Graphic Designer",
    company: <>Atelier Pulso · Lisbon · Hybrid</>,
    companyName: "Atelier Pulso",
    meta: ["€26–32k", "Full-time"],
    deadline: { text: "Closes 24 Jun", urgent: true },
    stages: [
      { label: "Submitted", state: "done" },
      {
        label: "In review",
        state: "active",
        hint: "A human at the company is reading your application. Next: they invite you to interview, or send a decision.",
      },
      { label: "Interview", state: "" },
      { label: "Decision", state: "" },
    ],
    status: (
      <>
        <b>In review by Marta R.</b> ·{" "}
        <span className="ago">submitted 4 hours ago</span> · they reply within
        10 days
      </>
    ),
    badge: { kind: "in-review", label: "In review", pulse: true },
    actions: [
      { label: "Message recruiter", kind: "message", arrow: true },
      { label: "View submission", kind: "submission", muted: true },
    ],
    recruiter: {
      name: "Marta Reis",
      role: "Studio lead · Atelier Pulso",
      initials: "MR",
      tint: "coral",
    },
    thread: [
      {
        from: "system",
        when: "26 Jun",
        text: "You applied for Junior Graphic Designer.",
      },
      {
        from: "them",
        name: "Marta",
        when: "26 Jun",
        text: "Thanks Sofia — your application's with me now. I'll come back to you within the week.",
      },
    ],
    submission: {
      date: "Submitted 26 Jun, 09:14",
      role: "Junior Graphic Designer",
      coverLetter:
        "I've followed Atelier Pulso's identity work for years — the Casa da Música rebrand especially. I'd bring a typographic eye, a love of risograph texture, and three years of editorial layout to your team.",
      attachments: [
        "Sofia-Marques-CV.pdf",
        "Portfolio-2026.pdf",
        "Cover-letter.pdf",
      ],
      answers: [
        { q: "Earliest start date?", a: "Two weeks' notice — early July." },
        { q: "Portfolio link", a: "sofiamarques.work" },
      ],
    },
  },
  {
    id: "pixel-mode",
    category: "active",
    logo: "PM",
    logoTint: "jade",
    title: "Senior Product Designer",
    company: <>Pixel Mode Studio · Lisbon / Porto · Remote OK</>,
    companyName: "Pixel Mode Studio",
    meta: ["€45–55k", "Full-time", "Equity"],
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      {
        label: "Interview · 2/3",
        state: "active",
        hint: "You're mid-way through their interview rounds (round 2 of 3). Next: a final round, then their decision.",
      },
      { label: "Decision", state: "" },
    ],
    status: (
      <>
        <b>Round 2 scheduled · Wed 11 Jun, 16:00</b> with João (CTO) and Liv
        (Design lead) · <span className="ago">arranged 2 days ago</span>
      </>
    ),
    badge: { kind: "interview", label: "Interview", pulse: true },
    actions: [
      { label: "Add to calendar", kind: "calendar", arrow: true },
      { label: "View company", kind: "company", muted: true },
    ],
    thread: [
      {
        from: "system",
        when: "20 May",
        text: "You applied for Senior Product Designer.",
      },
      {
        from: "them",
        name: "João",
        when: "9 Jun",
        text: "Really strong first round. We'd like to invite you to a round two — does Wed 11 Jun at 16:00 work?",
      },
      {
        from: "you",
        when: "9 Jun",
        text: "It does — thank you! See you both then.",
      },
      {
        from: "system",
        when: "9 Jun",
        text: "Round 2 scheduled · Wed 11 Jun, 16:00.",
      },
    ],
    interview: {
      title: "Round 2 · Senior Product Designer",
      when: "Wednesday 11 June 2026, 16:00–17:00 WEST",
      durationMin: 60,
      location: "Google Meet (link sent the morning of)",
      attendees: ["João Tavares — CTO", "Liv Andersson — Design lead"],
      notes:
        "A portfolio walk-through plus a short whiteboard exercise. They've shared the brief in advance.",
    },
    companyInfo: {
      about:
        "A 24-person product studio building tools for independent media. Worker-owned, four-day week pilot running since 2025.",
      size: "24 people",
      sector: "Product & design",
      verified: 11,
      location: "Lisbon / Porto · Remote OK",
    },
  },
  {
    id: "equip-editions",
    category: "offer",
    logo: "EQ",
    logoTint: "plum",
    title: "Editorial Lead, Magazine",
    company: <>Equip Editions · Lisbon · 4 days/week</>,
    companyName: "Equip Editions",
    meta: ["€38–44k pro-rata", "Part-time"],
    accent: "offer",
    deadline: { text: "Respond by 14 Jun", urgent: true },
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      { label: "Interview", state: "done" },
      {
        label: "Offer · respond by 14 Jun",
        state: "active",
        hint: "They've made you a formal offer — the decision is now yours. Next: accept, decline, or negotiate before the deadline.",
      },
    ],
    status: (
      <>
        <b>Offer received · €42k + 25 days holiday</b> ·{" "}
        <span className="ago">3 days ago</span> · respond by Sat 14 Jun
      </>
    ),
    badge: { kind: "offer", label: "Offer · respond" },
    actions: [
      { label: "Respond to offer", kind: "offer", solid: true, arrow: true },
      { label: "Open conversation", kind: "conversation", muted: true },
      { label: "Negotiate help", kind: "negotiate", muted: true },
    ],
    recruiter: {
      name: "Inês Carvalho",
      role: "Publisher · Equip Editions",
      initials: "IC",
      tint: "plum",
    },
    thread: [
      {
        from: "system",
        when: "12 May",
        text: "You applied for Editorial Lead, Magazine.",
      },
      {
        from: "them",
        name: "Inês",
        when: "15 May",
        text: "Sofia — your portfolio is wonderful. Could we talk this Thursday afternoon?",
      },
      {
        from: "you",
        when: "15 May",
        text: "Absolutely, Thursday works. Looking forward to it.",
      },
      {
        from: "system",
        when: "19 May",
        text: "Interview held with Inês Carvalho.",
      },
      {
        from: "them",
        name: "Inês",
        when: "8 Jun",
        text: "It was unanimous — we'd love to offer you the role. Full details are on the way.",
      },
      {
        from: "system",
        when: "8 Jun",
        text: "Offer received · €42k + 25 days holiday.",
      },
    ],
    offer: {
      salary: "€42,000 / year (pro-rata, 4 days)",
      holiday: "25 days + public holidays",
      start: "Flexible — ideally September 2026",
      respondBy: "Saturday 14 June 2026",
      market:
        "Editorial leads in Lisbon earn €40–52k. Your offer sits at the lower-middle — there's room.",
      terms: [
        "Permanent contract after a 3-month settling period",
        "Hybrid — two days in the Lisbon studio",
        "€600 yearly learning budget",
        "Full editorial sign-off on the print quarterly",
      ],
    },
  },
  {
    id: "casa-rua",
    category: "offer",
    logo: "CR",
    logoTint: "jade",
    title: "Senior Designer",
    company: <>Casa Rua Studio · Lisbon · Hybrid</>,
    companyName: "Casa Rua Studio",
    meta: ["€48k", "Full-time"],
    accent: "offer",
    deadline: { text: "Respond by 20 Jun", urgent: false },
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      { label: "Interview", state: "done" },
      {
        label: "Offer · respond by 20 Jun",
        state: "active",
        hint: "They've made you a formal offer — the decision is now yours. Next: accept, decline, or negotiate before the deadline.",
      },
    ],
    status: (
      <>
        <b>Offer received · €48k + 23 days holiday</b> ·{" "}
        <span className="ago">yesterday</span> · respond by Fri 20 Jun
      </>
    ),
    badge: { kind: "offer", label: "Offer · respond" },
    actions: [
      { label: "Respond to offer", kind: "offer", solid: true, arrow: true },
      { label: "Negotiate help", kind: "negotiate", muted: true },
    ],
    recruiter: {
      name: "Tomás Lima",
      role: "Founder · Casa Rua Studio",
      initials: "TL",
      tint: "jade",
    },
    offer: {
      salary: "€48,000 / year",
      holiday: "23 days + public holidays",
      start: "As soon as you're free",
      respondBy: "Friday 20 June 2026",
      market:
        "Senior designers in Lisbon earn €44–58k. This sits comfortably in range.",
      terms: [
        "Permanent from day one",
        "Hybrid — three days in the studio",
        "€800 yearly learning budget",
        "Private health insurance included",
      ],
    },
  },
  {
    id: "bairro-vivo",
    category: "active",
    logo: "BV",
    logoTint: "",
    title: "Community Manager",
    company: <>Bairro Vivo · Lisbon · In-person</>,
    companyName: "Bairro Vivo",
    meta: ["€24–28k", "Full-time"],
    stages: [
      { label: "Submitted", state: "done" },
      {
        label: "In review · 11 days",
        state: "active",
        hint: "Still with the company, but past their stated turnaround. Next: a polite follow-up is reasonable to nudge things along.",
      },
      { label: "Interview", state: "" },
      { label: "Decision", state: "" },
    ],
    accent: "overdue",
    status: (
      <>
        Submitted <b>28 May</b> · their stated turnaround was 10 days —{" "}
        <b>11 days in</b>, a nudge is more than fair.
      </>
    ),
    badge: { kind: "attention", label: "Overdue · 11 days", pulse: true },
    actions: [
      { label: "Follow up", kind: "followup", arrow: true },
      { label: "Withdraw", kind: "withdraw", muted: true },
    ],
    recruiter: {
      name: "Hiring team",
      role: "Bairro Vivo",
      initials: "BV",
      tint: "coral",
    },
  },
  {
    id: "novamente",
    category: "active",
    logo: "NV",
    logoTint: "jade",
    title: "UX Researcher (12-mo contract)",
    company: <>Novamente Saúde · Remote · Health sector</>,
    companyName: "Novamente Saúde",
    meta: ["€34–40k", "Contract"],
    stages: [
      { label: "Submitted yesterday", state: "done" },
      {
        label: "Auto-screening",
        state: "active",
        hint: "An automated first pass is checking your application against the role's basics. Next: a person reviews shortlisted candidates.",
      },
      { label: "Interview", state: "" },
      { label: "Decision", state: "" },
    ],
    status: (
      <>
        Their inbox is open and they reply quickly. Verified queer-friendly by 4
        members.
      </>
    ),
    badge: { kind: "in-review", label: "Just sent", pulse: true },
    actions: [{ label: "View details", kind: "submission", arrow: true }],
    submission: {
      date: "Submitted 25 Jun, 18:40",
      role: "UX Researcher · 12-month contract",
      coverLetter:
        "Mixed-methods researcher with a health-tech background. I care about consent-first research and have run accessible studies with trans and disabled participants.",
      attachments: ["Sofia-Marques-CV.pdf", "Research-samples.pdf"],
      answers: [
        { q: "Notice period", a: "Available immediately." },
        {
          q: "Comfortable fully remote?",
          a: "Yes — home studio set up in Lisbon.",
        },
      ],
    },
  },
  {
    id: "solar-lisboa",
    category: "closed",
    logo: "SL",
    logoTint: "",
    title: "Brand Designer",
    company: <>Solar Lisboa · Lisbon · In-person</>,
    companyName: "Solar Lisboa",
    meta: ["€30–36k"],
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      { label: "Interview", state: "done" },
      { label: "Not this time", state: "rejected" },
    ],
    status: (
      <>
        They went with someone with more motion experience.{" "}
        <b>Left a kind, specific note</b> — worth reading.
      </>
    ),
    badge: { kind: "rejected", label: "Closed · 21 May" },
    actions: [{ label: "Read their note", kind: "note", arrow: true }],
    note: {
      from: "Rui · Solar Lisboa",
      body: "Sofia — this was genuinely close. Your editorial work was the strongest in the round, and the panel kept coming back to your type choices. We chose a candidate with more motion experience because the role leans 60% into animation this year. Please apply again when we open the print-led brief in the autumn — I'll personally flag your name. Thank you for the care you put into the task.",
    },
  },
  {
    id: "vinhos-do-sul",
    category: "closed",
    logo: "VS",
    logoTint: "plum",
    title: "Marketing Coordinator",
    company: <>Vinhos do Sul · Lisbon</>,
    companyName: "Vinhos do Sul",
    meta: ["€28k"],
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Withdrew · 8 May", state: "rejected" },
      { label: "—", state: "" },
      { label: "—", state: "" },
    ],
    status: (
      <>You withdrew this one — accepted the Pixel Mode interview instead.</>
    ),
    badge: { kind: "rejected", label: "Withdrawn" },
    actions: [],
  },
  {
    id: "clube-das-letras",
    category: "draft",
    logo: "CL",
    logoTint: "draft",
    title: "Communications Manager",
    company: <>Clube das Letras · Lisbon · Hybrid</>,
    companyName: "Clube das Letras",
    meta: ["€32–38k"],
    deadline: { text: "Closes 18 Jun", urgent: true },
    stages: [],
    status: (
      <>
        Draft started <b>2 days ago</b> · 60% complete · closes <b>18 Jun</b> —
        don't forget.
      </>
    ),
    badge: { kind: "draft", label: "Draft · 60%" },
    actions: [{ label: "Resume application", kind: "resume", arrow: true }],
    draft: {
      percent: 60,
      deadline: "Closes 18 June 2026",
      done: ["CV attached", "Basic details", "Portfolio link"],
      remaining: ["Cover letter", "Availability", "Two short answers"],
    },
  },
];
