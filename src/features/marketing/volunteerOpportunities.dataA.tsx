import { TEAM_POOL, type VolunteerOpportunity } from "./volunteerOpportunities.types";

export const VOLUNTEER_OPPORTUNITIES_A: VolunteerOpportunity[] = [
  {
    slug: "community-outreach",
    org: "ILGA Portugal",
    av: "IL",
    bg: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    role: "Community Outreach Volunteer",
    cause: "Rights",
    commit: "low",
    time: "2–4 hrs/week",
    location: "In-person · Lisbon",
    skills: ["Communication", "Languages", "Event support"],
    desc: "Help ILGA reach more people through community events, tabling, and direct outreach. No experience necessary — training provided on day one.",
    eyebrow: "Volunteer · LGBTQ+ Rights · ILGA partnership",
    urgent: "Recruiting now · rolling intake",
    titleLead: "Community outreach · ",
    titleEm: "ILGA Lisboa.",
    sub: (
      <>
        ILGA does the slow, unglamorous work of being <b>present</b> — at fairs, in
        schools, at the info table nobody notices until they need it. <em>You're the
        friendly face at that table.</em> You hand out information, answer the easy
        questions, and know exactly who to point people toward for the hard ones.
      </>
    ),
    stats: [
      { value: <b>12</b>, label: "Outreach events / quarter" },
      { value: <b><em>1</em>h</b>, label: "Onboarding session" },
      { value: <b>2–4h</b>, label: "Per week, flexible" },
      { value: <b style={{ color: "var(--jade)" }}>Travel covered</b>, label: "+ materials" },
    ],
    why: [
      <>
        Most people don't find ILGA in a crisis — they find it at a stall, months
        earlier, and remember it when they need it. <b>Showing up consistently is the
        whole job.</b> A staffed table at the right event reaches more people than a
        month of social posts.
      </>,
      <>
        Outreach is also how ILGA spots what's changing on the ground — which questions
        are getting more common, which neighbourhoods are underserved. <em>You're the
        eyes and ears as much as the hands.</em>
      </>,
    ],
    tasks: [
      { title: "Staff the info table at community events", desc: "Set up, greet people, hand out materials, keep the space warm." },
      { title: "Answer the common questions", desc: "Name changes, where to get tested, how to report — the FAQs, with a script." },
      { title: "Refer the harder ones", desc: "You don't advise. You connect people to ILGA's legal and health teams." },
      { title: "Log who you reached", desc: "A quick tally at the end — anonymised counts, never names." },
    ],
    commitments: [
      { b: "One onboarding hour", s: "Online or in person · covers the scripts and the referrals" },
      { b: "2–4 hours a week", s: "You pick the events from a shared calendar" },
      { b: "No fixed term", s: "Do one event or one a week — both are useful" },
      { b: "Quarterly check-in", s: "30 min with the outreach lead, optional" },
    ],
    goodFor: [
      <>
        You don't need experience — you need to be <b>approachable and reliable</b>.
        Speaking Portuguese and English both helps; a third language helps more. If you
        can hold a friendly conversation with a stranger and not over-promise, you're
        good for this.
      </>,
    ],
    teamIntro: "18 outreach volunteers active this quarter. A few of the people you'd share a table with:",
    team: TEAM_POOL.slice(0, 5),
    applyRole: "Community Outreach · ILGA Lisboa",
    spotsFilled: "18 / 24",
    spotsPct: 75,
    spots: [
      { label: "Intake", value: <b>Rolling</b> },
      { label: "Onboarding", value: <b>~1h · online or in person</b> },
      { label: "Per week", value: <b>2–4 hours, flexible</b> },
      { label: "Compensation", value: <b style={{ color: "var(--jade)" }}>Travel + materials</b> },
    ],
    applyConfirm: (
      <>
        Application submitted for <strong>Community Outreach · ILGA Lisboa</strong>. The
        outreach lead will send you the onboarding link within a couple of days.
      </>
    ),
    partner: {
      name: "ILGA Portugal · founding partner",
      text: (
        <>
          Onboarding is run by ILGA's community team. Background checks are by QueerPulse
          moderation. <em>Your data is shared only between these two orgs, for this role.</em>
        </>
      ),
    },
  },

  {
    slug: "mental-health-peer-support",
    org: "Opus Diversus",
    av: "OD",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    role: "Mental Health Peer Support",
    cause: "Health",
    commit: "medium",
    time: "4 hrs/week",
    location: "In-person · Lisbon",
    skills: ["Active listening", "Empathy", "Confidentiality"],
    desc: "Support people through peer-led mental health conversations. Training provided — you don't need to be a professional. You need to care and to listen well.",
    eyebrow: "Volunteer · Health & Wellbeing · Opus Diversus",
    urgent: "Recruiting · next cohort starts 1 Jul",
    titleLead: "Peer support · ",
    titleEm: "mental health drop-in.",
    sub: (
      <>
        Opus Diversus runs a weekly peer-support drop-in for queer people who need to
        talk and don't want a clinic. <b>You're not a therapist</b> — you're a trained
        peer who listens well, holds confidentiality, and knows when to escalate.{" "}
        <em>The training is real and so is the support around you.</em>
      </>
    ),
    stats: [
      { value: <b><em>6</em>h</b>, label: "Initial training" },
      { value: <b>4h</b>, label: "Per week commitment" },
      { value: <b>3</b>, label: "Month minimum" },
      { value: <b style={{ color: "var(--jade)" }}>Supervised</b>, label: "+ monthly debrief" },
    ],
    why: [
      <>
        Clinical waitlists in Lisbon are long, and for a lot of queer people a clinic is
        the last place they'll go first. <b>A peer who's been there lowers the bar to
        asking for help.</b> Many people use the drop-in as the step before therapy — or
        instead of it, when therapy isn't available.
      </>,
      <>
        This is held work, not heroics. You're never alone in the room, there's always a
        clinician on call, and <em>your own wellbeing is part of the plan</em>, not an
        afterthought.
      </>,
    ],
    tasks: [
      { title: "Hold one-to-one peer conversations", desc: "Listen, reflect, don't fix. The training gives you the frame." },
      { title: "Keep confidentiality, always", desc: "What's said in the room stays there — with clear, taught exceptions." },
      { title: "Recognise when to escalate", desc: "You'll learn the signs. A clinician is on call every session." },
      { title: "Attend the monthly debrief", desc: "Supervised group reflection — for the people you saw, and for you." },
    ],
    commitments: [
      { b: "6-hour training", s: "Two evenings before you start · required" },
      { b: "4 hours a week", s: "One drop-in shift, same slot each week" },
      { b: "3-month minimum", s: "Consistency matters more than anything here" },
      { b: "Monthly supervision", s: "90 min · non-negotiable, and genuinely useful" },
    ],
    goodFor: [
      <>
        You need to be <b>steady, warm, and able to sit with discomfort</b> without
        rushing to make it better. Lived experience of mental health struggle is welcome,
        not required. If you're currently in an acute crisis yourself, this isn't the
        right moment — and that's okay.
      </>,
      <>
        Vetting includes a longer conversation with the Opus Diversus team and a
        safeguarding check. <em>This one is careful on purpose.</em>
      </>,
    ],
    teamIntro: "A small, tight cohort — 8 peers and 2 clinicians. Some of the team:",
    team: TEAM_POOL.slice(1, 5),
    applyRole: "Peer Support · Opus Diversus",
    spotsFilled: "8 / 12",
    spotsPct: 66,
    spots: [
      { label: "Next cohort", value: <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>Starts 1 Jul</span> },
      { label: "Training", value: <b>Two evenings · pre-start</b> },
      { label: "Per week", value: <b>4 hours · fixed shift</b> },
      { label: "Supervision", value: <b style={{ color: "var(--jade)" }}>Monthly · provided</b> },
    ],
    applyConfirm: (
      <>
        Application submitted for <strong>Peer Support · Opus Diversus</strong>. The team
        will reach out to arrange a longer chat and the safeguarding step.
      </>
    ),
    partner: {
      name: "Opus Diversus · health partner",
      text: (
        <>
          Training and clinical supervision are delivered by Opus Diversus.{" "}
          <em>Safeguarding records are kept by them, separately from your QueerPulse
          profile.</em>
        </>
      ),
    },
  },

  {
    slug: "youth-group-cofacilitator",
    org: "Rede ex aequo",
    av: "RA",
    bg: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    role: "Youth Group Co-facilitator",
    cause: "Youth",
    commit: "medium",
    time: "3–5 hrs/week",
    location: "Lisbon · Evenings",
    skills: ["Facilitation", "Youth work", "Care"],
    desc: "Co-facilitate weekly peer support groups for LGBTQ+ young people. Showing up consistently is the most important thing you can do.",
    eyebrow: "Volunteer · Youth · Rede ex aequo",
    urgent: "Recruiting · enhanced check required",
    titleLead: "Co-facilitator · ",
    titleEm: "LGBTQ+ youth group.",
    sub: (
      <>
        Rede ex aequo runs weekly groups for queer teenagers — a room where they can be
        ahead of where the rest of their week lets them be. <b>You co-hold that room</b>{" "}
        with an experienced facilitator. <em>The single most valuable thing you can do is
        be there, every week, the same face.</em>
      </>
    ),
    stats: [
      { value: <b><em>2</em></b>, label: "Training Saturdays" },
      { value: <b>3–5h</b>, label: "Per week" },
      { value: <b>1</b>, label: "School year commitment" },
      { value: <b style={{ color: "var(--jade)" }}>Vetted</b>, label: "+ enhanced check" },
    ],
    why: [
      <>
        For a queer 15-year-old, a weekly group can be the only place they're not
        managing how they're seen. <b>Consistency is the intervention.</b> A facilitator
        who disappears does more harm than one who was never there — which is why this
        role asks for a school year, not a season.
      </>,
      <>
        You co-facilitate, never solo, alongside someone who's done it for years. You'll
        learn the craft of holding a group: <em>making space, keeping it safe, knowing
        when to step in and when to let silence sit.</em>
      </>,
    ],
    tasks: [
      { title: "Co-run the weekly session", desc: "Same evening each week. You and the lead facilitator share it." },
      { title: "Hold the group agreement", desc: "Confidentiality, respect, no outing. You model it before you enforce it." },
      { title: "Notice the quiet ones", desc: "Half of youth work is catching who's drifting and gently including them." },
      { title: "Debrief after each session", desc: "15 minutes with your co-facilitator — what happened, what's next." },
      { title: "Flag safeguarding concerns", desc: "You'll be trained on exactly what, when, and to whom." },
    ],
    commitments: [
      { b: "Two training Saturdays", s: "Safeguarding + facilitation basics · required" },
      { b: "3–5 hours a week", s: "One evening session plus prep and debrief" },
      { b: "One school year", s: "Sept–June · the consistency is the point" },
      { b: "Enhanced check", s: "Working-with-minors vetting · takes ~3 weeks" },
    ],
    goodFor: [
      <>
        You need <b>patience, warmth, and zero need to be the cool one</b>. Prior youth
        experience helps but isn't required — the training and your co-facilitator carry
        you. If you can commit to a school year and pass the check, you're who they need.
      </>,
    ],
    teamIntro: "A team of 9 across three weekly groups. People you'd co-facilitate with:",
    team: TEAM_POOL.slice(0, 4),
    applyRole: "Youth Co-facilitator · Rede ex aequo",
    spotsFilled: "9 / 12",
    spotsPct: 75,
    spots: [
      { label: "Intake", value: <b>Before Sept term</b> },
      { label: "Training", value: <b>Two Saturdays</b> },
      { label: "Per week", value: <b>3–5 hours · evening</b> },
      { label: "Vetting", value: <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>Enhanced check</span> },
    ],
    applyConfirm: (
      <>
        Application submitted for <strong>Youth Co-facilitator · Rede ex aequo</strong>.
        Next step is the enhanced background check — they'll email you the form.
      </>
    ),
    partner: {
      name: "Rede ex aequo · youth partner",
      text: (
        <>
          Facilitation training and safeguarding are run by Rede ex aequo.{" "}
          <em>Working-with-minors checks are processed by them and retained per law.</em>
        </>
      ),
    },
  },

  {
    slug: "campaign-communications",
    org: "Panteras Rosa",
    av: "PR",
    bg: "rgba(74,140,111,.12)",
    color: "var(--jade)",
    role: "Campaign Communications",
    cause: "Rights",
    commit: "low",
    time: "2–3 hrs/week",
    location: "Remote or in-person",
    skills: ["Writing", "Graphic design", "Social media"],
    desc: "Help craft communications for trans rights campaigns. Writing, social, design — bring what you have. Fully flexible and mostly remote.",
    eyebrow: "Volunteer · LGBTQ+ Rights · Panteras Rosa",
    urgent: "Recruiting · remote-friendly",
    titleLead: "Campaign comms · ",
    titleEm: "trans rights.",
    sub: (
      <>
        Panteras Rosa moves fast and runs lean. When a bad bill drops or a moment opens,
        they need words and images out the same day. <b>You're part of the team that
        makes that happen</b> — writing, designing, or just turning a messy brief into a
        clean post. <em>Bring whatever you've got; mostly remote.</em>
      </>
    ),
    stats: [
      { value: <b style={{ color: "var(--jade)" }}>Remote</b>, label: "Mostly async" },
      { value: <b>2–3h</b>, label: "Per week" },
      { value: <b><em>0</em></b>, label: "Fixed meetings" },
      { value: <b>Flexible</b>, label: "Term · ongoing" },
    ],
    why: [
      <>
        Rights campaigns are won and lost on attention. A clear graphic shared widely the
        morning a vote is announced can shift a news cycle. <b>Panteras Rosa punches above
        its weight precisely because of volunteers like you</b> — there is no comms
        department, there's the group chat and the people in it.
      </>,
      <>
        This is the most flexible role on the board. <em>Do a poster when you have an
        hour, or take a whole campaign.</em> No standing meetings, no minimum.
      </>,
    ],
    tasks: [
      { title: "Turn briefs into posts", desc: "A one-line ask becomes a caption, a graphic, a thread." },
      { title: "Design quick assets", desc: "Stories, posters, banners — templates exist, bring taste." },
      { title: "Draft and tighten copy", desc: "Plain, sharp, on-message. Editing others counts too." },
      { title: "Move fast when it matters", desc: "Some weeks are quiet; a few are same-day. You opt into those." },
    ],
    commitments: [
      { b: "Light onboarding chat", s: "30 min to meet the team and see the toolkit" },
      { b: "2–3 hours a week", s: "Or banked — busy weeks and quiet ones average out" },
      { b: "No fixed term", s: "Contribute when you can; pause when you can't" },
      { b: "Async by default", s: "Group chat + a shared drive · meetings are rare" },
    ],
    goodFor: [
      <>
        Anyone who can <b>write clearly or make something look good</b> — and who's okay
        with the occasional fire drill. You don't need to be a designer or a journalist;
        you need taste, speed, and a feel for the cause. Fully remote works.
      </>,
    ],
    teamIntro: "A loose comms crew of about a dozen. A few of the regulars:",
    team: TEAM_POOL.slice(2, 6),
    applyRole: "Campaign Comms · Panteras Rosa",
    spotsFilled: "11 / 16",
    spotsPct: 68,
    spots: [
      { label: "Intake", value: <b>Rolling · remote</b> },
      { label: "Onboarding", value: <b>30 min chat</b> },
      { label: "Per week", value: <b>2–3 hours, flexible</b> },
      { label: "Format", value: <b style={{ color: "var(--jade)" }}>Async-first</b> },
    ],
    applyConfirm: (
      <>
        Application submitted for <strong>Campaign Comms · Panteras Rosa</strong>. Someone
        from the crew will add you to the group chat and share the toolkit.
      </>
    ),
    partner: null,
  },
];
