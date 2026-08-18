import {
  TEAM_POOL,
  type VolunteerOpportunity,
} from "./volunteerOpportunities.types";

export const VOLUNTEER_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    slug: "community-outreach",
    org: "A national LGBTQ+ rights organisation",
    avatar: "LR",
    background: "rgba(74,140,111,.14)",
    color: "var(--jade)",
    role: "Community Outreach Volunteer",
    cause: "Rights",
    commit: "low",
    time: "2–4 hrs/week",
    location: "In-person · Lisbon",
    skills: ["Communication", "Languages", "Event support"],
    description: "Help a national LGBTQ+ rights organisation reach more people through community events, tabling, and direct outreach. No experience necessary: training provided on day one.",
    eyebrow: "Volunteer · LGBTQ+ Rights · rights-org partnership",
    urgent: "Recruiting now · rolling intake",
    titleLead: "Community outreach · ",
    titleEm: "a local rights association.",
    sub: (
      <>
        The organisation does the slow, unglamorous work of being{" "}
        <b>present</b>: at fairs, in schools, at the info table nobody notices
        until they need it.{" "}
        <em>You're the friendly face at that table.</em> You hand out
        information, answer the easy questions, and know exactly who to point
        people toward for the hard ones.
      </>
    ),
    stats: [
      { value: <b>12</b>, label: "Outreach events / quarter" },
      {
        value: (
          <b>
            <em>1</em>h
          </b>
        ),
        label: "Onboarding session",
      },
      { value: <b>2–4h</b>, label: "Per week, flexible" },
      {
        value: <b style={{ color: "var(--jade)" }}>Travel covered</b>,
        label: "+ materials",
      },
    ],
    why: [
      <>
        Most people don't find the organisation in a crisis. They find it at a
        stall, months earlier, and remember it when they need it.{" "}
        <b>Showing up consistently is the whole job.</b> A staffed table at the
        right event reaches more people than a month of social posts.
      </>,
      <>
        Outreach is also how the organisation spots what's changing on the
        ground: which questions are getting more common, which neighbourhoods
        are underserved.{" "}
        <em>You're the eyes and ears as much as the hands.</em>
      </>,
    ],
    tasks: [
      {
        title: "Staff the info table at community events",
        description: "Set up, greet people, hand out materials, keep the space warm.",
      },
      {
        title: "Answer the common questions",
        description: "Name changes, where to get tested, how to report: the FAQs, with a script.",
      },
      {
        title: "Refer the harder ones",
        description: "You don't advise. You connect people to the organisation's legal and health teams.",
      },
      {
        title: "Log who you reached",
        description: "A quick tally at the end: anonymised counts, never names.",
      },
    ],
    commitments: [
      {
        b: "One onboarding hour",
        s: "Online or in person · covers the scripts and the referrals",
      },
      {
        b: "2–4 hours a week",
        s: "You pick the events from a shared calendar",
      },
      { b: "No fixed term", s: "Do one event or one a week. Both are useful" },
      { b: "Quarterly check-in", s: "30 min with the outreach lead, optional" },
    ],
    goodFor: [
      <>
        You don't need experience. You need to be{" "}
        <b>approachable and reliable</b>. Speaking Portuguese and English both
        helps; a third language helps more. If you can hold a friendly
        conversation with a stranger and not over-promise, you're good for this.
      </>,
    ],
    teamIntro:
      "18 outreach volunteers active this quarter. A few of the people you'd share a table with:",
    team: TEAM_POOL.slice(0, 5),
    applyRole: "Community Outreach · a local rights association",
    spotsFilled: "18 / 24",
    spotsPct: 75,
    spots: [
      { label: "Intake", value: <b>Rolling</b> },
      { label: "Onboarding", value: <b>~1h · online or in person</b> },
      { label: "Per week", value: <b>2–4 hours, flexible</b> },
      {
        label: "Compensation",
        value: <b style={{ color: "var(--jade)" }}>Travel + materials</b>,
      },
    ],
    applyConfirm: (
      <>
        Application submitted for{" "}
        <strong>Community Outreach · a local rights association</strong>. The
        outreach lead will send you the onboarding link within a couple of days.
      </>
    ),
    partner: {
      name: "A national LGBTQ+ rights organisation · founding partner",
      text: (
        <>
          Onboarding is run by the organisation's community team. Background
          checks are by QueerPulse moderation.{" "}
          <em>
            Your data is shared only between these two orgs, for this role.
          </em>
        </>
      ),
    },
    community: null,
  },

  {
    slug: "mental-health-peer-support",
    org: "Opus Diversus",
    avatar: "OD",
    background: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    role: "Mental Health Peer Support",
    cause: "Health",
    commit: "medium",
    time: "4 hrs/week",
    location: "In-person · Lisbon",
    skills: ["Active listening", "Empathy", "Confidentiality"],
    description: "Support people through peer-led mental health conversations. Training provided. You don't need to be a professional. You need to care and to listen well.",
    eyebrow: "Volunteer · Health & Wellbeing · Opus Diversus",
    urgent: "Recruiting · next cohort starts 1 Jul",
    titleLead: "Peer support · ",
    titleEm: "mental health drop-in.",
    sub: (
      <>
        Opus Diversus runs a weekly peer-support drop-in for queer people who
        need to talk and don't want a clinic. <b>You're not a therapist</b>.
        You're a trained peer who listens well, holds confidentiality, and knows
        when to escalate.{" "}
        <em>The training is real and so is the support around you.</em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>6</em>h
          </b>
        ),
        label: "Initial training",
      },
      { value: <b>4h</b>, label: "Per week commitment" },
      { value: <b>3</b>, label: "Month minimum" },
      {
        value: <b style={{ color: "var(--jade)" }}>Supervised</b>,
        label: "+ monthly debrief",
      },
    ],
    why: [
      <>
        Clinical waitlists in Lisbon are long, and for a lot of queer people a
        clinic is the last place they'll go first.{" "}
        <b>A peer who's been there lowers the bar to asking for help.</b> Many
        people use the drop-in as the step before therapy, or instead of it,
        when therapy isn't available.
      </>,
      <>
        This is held, supported work. You're never alone in the room, there's
        always a clinician on call, and{" "}
        <em>your own wellbeing is built into the plan from the start.</em>
      </>,
    ],
    tasks: [
      {
        title: "Hold one-to-one peer conversations",
        description: "Listen, reflect, don't fix. The training gives you the frame.",
      },
      {
        title: "Keep confidentiality, always",
        description: "What's said in the room stays there, with clear, taught exceptions.",
      },
      {
        title: "Recognise when to escalate",
        description: "You'll learn the signs. A clinician is on call every session.",
      },
      {
        title: "Attend the monthly debrief",
        description: "Supervised group reflection: for the people you saw, and for you.",
      },
    ],
    commitments: [
      { b: "6-hour training", s: "Two evenings before you start · required" },
      { b: "4 hours a week", s: "One drop-in shift, same slot each week" },
      {
        b: "3-month minimum",
        s: "Consistency matters more than anything here",
      },
      {
        b: "Monthly supervision",
        s: "90 min · non-negotiable, and genuinely useful",
      },
    ],
    goodFor: [
      <>
        You need to be <b>steady, warm, and able to sit with discomfort</b>{" "}
        without rushing to make it better. Lived experience of mental health
        struggle is welcome and optional. If you're currently in an acute
        crisis yourself, this isn't the right moment, and that's okay.
      </>,
      <>
        Vetting includes a longer conversation with the Opus Diversus team and a
        safeguarding check. <em>This one is careful on purpose.</em>
      </>,
    ],
    teamIntro:
      "A small, tight cohort: 8 peers and 2 clinicians. Some of the team:",
    team: TEAM_POOL.slice(1, 5),
    applyRole: "Peer Support · Opus Diversus",
    spotsFilled: "8 / 12",
    spotsPct: 66,
    spots: [
      {
        label: "Next cohort",
        value: (
          <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>
            Starts 1 Jul
          </span>
        ),
      },
      { label: "Training", value: <b>Two evenings · pre-start</b> },
      { label: "Per week", value: <b>4 hours · fixed shift</b> },
      {
        label: "Supervision",
        value: <b style={{ color: "var(--jade)" }}>Monthly · provided</b>,
      },
    ],
    applyConfirm: (
      <>
        Application submitted for <strong>Peer Support · Opus Diversus</strong>.
        The team will reach out to arrange a longer chat and the safeguarding
        step.
      </>
    ),
    partner: {
      name: "Opus Diversus · health partner",
      text: (
        <>
          Training and clinical supervision are delivered by Opus Diversus.{" "}
          <em>
            Safeguarding records are kept by them, separately from your
            QueerPulse profile.
          </em>
        </>
      ),
    },
    community: null,
  },

  {
    slug: "youth-group-cofacilitator",
    org: "Rede ex aequo",
    avatar: "RA",
    background: "rgba(45,27,61,.1)",
    color: "var(--plum)",
    role: "Youth Group Co-facilitator",
    cause: "Youth",
    commit: "medium",
    time: "3–5 hrs/week",
    location: "Lisbon · Evenings",
    skills: ["Facilitation", "Youth work", "Care"],
    description: "Co-facilitate weekly peer support groups for LGBTQ+ young people. Showing up consistently is the most important thing you can do.",
    eyebrow: "Volunteer · Youth · Rede ex aequo",
    urgent: "Recruiting · enhanced check required",
    titleLead: "Co-facilitator · ",
    titleEm: "LGBTQ+ youth group.",
    sub: (
      <>
        Rede ex aequo runs weekly groups for queer teenagers, a room where they
        can be ahead of where the rest of their week lets them be.{" "}
        <b>You co-hold that room</b> with an experienced facilitator.{" "}
        <em>
          The single most valuable thing you can do is be there, every week, the
          same face.
        </em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>2</em>
          </b>
        ),
        label: "Training Saturdays",
      },
      { value: <b>3–5h</b>, label: "Per week" },
      { value: <b>1</b>, label: "School year commitment" },
      {
        value: <b style={{ color: "var(--jade)" }}>Vetted</b>,
        label: "+ enhanced check",
      },
    ],
    why: [
      <>
        For a queer 15-year-old, a weekly group can be the only place they're
        not managing how they're seen. <b>Consistency is the intervention.</b> A
        facilitator who disappears does more harm than one who was never there,
        which is why this role asks for a full school year.
      </>,
      <>
        You always co-facilitate alongside someone who's done it for
        years. You'll learn the craft of holding a group:{" "}
        <em>
          making space, keeping it safe, knowing when to step in and when to let
          silence sit.
        </em>
      </>,
    ],
    tasks: [
      {
        title: "Co-run the weekly session",
        description: "Same evening each week. You and the lead facilitator share it.",
      },
      {
        title: "Hold the group agreement",
        description: "Confidentiality, respect, no outing. You model it before you enforce it.",
      },
      {
        title: "Notice the quiet ones",
        description: "Half of youth work is catching who's drifting and gently including them.",
      },
      {
        title: "Debrief after each session",
        description: "15 minutes with your co-facilitator: what happened, what's next.",
      },
      {
        title: "Flag safeguarding concerns",
        description: "You'll be trained on exactly what, when, and to whom.",
      },
    ],
    commitments: [
      {
        b: "Two training Saturdays",
        s: "Safeguarding + facilitation basics · required",
      },
      { b: "3–5 hours a week", s: "One evening session plus prep and debrief" },
      { b: "One school year", s: "Sept–June · the consistency is the point" },
      {
        b: "Enhanced check",
        s: "Working-with-minors vetting · takes ~3 weeks",
      },
    ],
    goodFor: [
      <>
        You need <b>patience, warmth, and zero need to be the cool one</b>.
        Prior youth experience helps but isn't required. The training and your
        co-facilitator carry you. If you can commit to a school year and pass
        the check, you're who they need.
      </>,
    ],
    teamIntro:
      "A team of 9 across three weekly groups. People you'd co-facilitate with:",
    team: TEAM_POOL.slice(0, 4),
    applyRole: "Youth Co-facilitator · Rede ex aequo",
    spotsFilled: "9 / 12",
    spotsPct: 75,
    spots: [
      { label: "Intake", value: <b>Before Sept term</b> },
      { label: "Training", value: <b>Two Saturdays</b> },
      { label: "Per week", value: <b>3–5 hours · evening</b> },
      {
        label: "Vetting",
        value: (
          <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>
            Enhanced check
          </span>
        ),
      },
    ],
    applyConfirm: (
      <>
        Application submitted for{" "}
        <strong>Youth Co-facilitator · Rede ex aequo</strong>. Next step is the
        enhanced background check. They'll email you the form.
      </>
    ),
    partner: {
      name: "Rede ex aequo · youth partner",
      text: (
        <>
          Facilitation training and safeguarding are run by Rede ex aequo.{" "}
          <em>
            Working-with-minors checks are processed by them and retained per
            law.
          </em>
        </>
      ),
    },
    community: null,
  },
  {
    slug: "housing-advocate",
    org: "Queer Housing Justice Network",
    avatar: "HJ",
    background: "rgba(122,82,184,.1)",
    color: "var(--violet)",
    role: "Community Housing Advocate",
    cause: "Housing",
    commit: "low",
    time: "2–3 hrs/week",
    location: "In-person · Mouraria",
    skills: ["Listening", "Documentation", "Organising"],
    description: "Support queer residents navigating housing challenges: documenting situations, connecting people with legal aid, attending community meetings.",
    eyebrow: "Volunteer · Housing · Housing Justice Network",
    urgent: "Recruiting · Mouraria-based",
    titleLead: "Housing advocate · ",
    titleEm: "Mouraria.",
    sub: (
      <>
        Queer people get pushed out of housing in ways that are hard to prove
        and easy to ignore. The Network's job is to{" "}
        <b>make the pattern visible</b>, by documenting cases carefully and
        connecting people to legal aid before an eviction becomes a fact.{" "}
        <em>
          You're the person who sits down and writes it all down properly.
        </em>
      </>
    ),
    stats: [
      {
        value: (
          <b>
            <em>1</em>
          </b>
        ),
        label: "Training afternoon",
      },
      { value: <b>2–3h</b>, label: "Per week" },
      { value: <b>Monthly</b>, label: "Network meeting" },
      {
        value: <b style={{ color: "var(--jade)" }}>Mentored</b>,
        label: "Paired with a lead",
      },
    ],
    why: [
      <>
        A landlord's "the flat's no longer available" is invisible until it's
        documented ten times.{" "}
        <b>
          Patient documentation is what turns scattered injustice into a case a
          lawyer can run
        </b>,{" "}
        or a campaign that changes a building's behaviour.
      </>,
      <>
        You won't be doing this alone or cold.{" "}
        <em>You're paired with an experienced advocate</em> and backed by the
        Network's legal contacts. Your job is care and accuracy; the legal
        advice is theirs to give.
      </>,
    ],
    tasks: [
      {
        title: "Sit with residents and listen",
        description: "Let people tell the whole story before you start writing.",
      },
      {
        title: "Document situations precisely",
        description: "Dates, messages, who said what. Just the facts.",
      },
      {
        title: "Connect people to legal aid",
        description: "You hand off to the Network's lawyers. You don't advise.",
      },
      {
        title: "Attend the monthly meeting",
        description: "Where cases get reviewed and patterns get spotted.",
      },
    ],
    commitments: [
      {
        b: "One training afternoon",
        s: "Documentation + boundaries · required",
      },
      {
        b: "2–3 hours a week",
        s: "Mostly resident conversations and write-ups",
      },
      { b: "Monthly Network meeting", s: "Evening in Mouraria · case review" },
      { b: "Always paired", s: "An experienced advocate has your back" },
    ],
    goodFor: [
      <>
        You need to be a <b>good listener and a careful writer</b> who can hold
        a boundary. You're there to document. Knowing the
        Mouraria/Anjos area and speaking Portuguese both help a lot. Calm and
        meticulous beats charismatic here.
      </>,
    ],
    teamIntro:
      "A small network of 7 advocates plus legal contacts. People you'd work beside:",
    team: TEAM_POOL.slice(1, 4),
    applyRole: "Housing Advocate · Justice Network",
    spotsFilled: "7 / 10",
    spotsPct: 70,
    spots: [
      { label: "Intake", value: <b>Rolling</b> },
      { label: "Training", value: <b>One afternoon</b> },
      { label: "Per week", value: <b>2–3 hours</b> },
      {
        label: "Support",
        value: <b style={{ color: "var(--jade)" }}>Paired + legal</b>,
      },
    ],
    applyConfirm: (
      <>
        Application submitted for{" "}
        <strong>Housing Advocate · Justice Network</strong>. You'll be paired
        with a lead advocate and invited to the next training afternoon.
      </>
    ),
    partner: {
      name: "Queer Housing Justice Network",
      text: (
        <>
          Casework is overseen by the Network's legal contacts.{" "}
          <em>
            Resident information is confidential and held by the Network, not on
            the platform.
          </em>
        </>
      ),
    },
    community: null,
  },

  {
    slug: "event-production",
    org: "Rainbow Arts Collective",
    avatar: "RA",
    background: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    role: "Event Production Support",
    cause: "Arts",
    commit: "low",
    time: "Project by project",
    location: "In-person · Lisbon",
    skills: ["Event logistics", "Hospitality", "Photography"],
    description: "Help set up and run exhibitions, crits, and group shows. Event-by-event commitment: pick the ones that work for you.",
    eyebrow: "Volunteer · Arts & Culture · Rainbow Arts Collective",
    urgent: "Recruiting · pick your shows",
    titleLead: "Production crew · ",
    titleEm: "queer arts shows.",
    sub: (
      <>
        The Collective puts on exhibitions, crits, and group shows in borrowed
        spaces, which means every show is built and struck by hand.{" "}
        <b>You're part of the crew that makes it look effortless.</b> Hanging
        work, running the door, pouring the wine, shooting the night.{" "}
        <em>Pick the shows that fit your month.</em>
      </>
    ),
    stats: [
      {
        value: <b style={{ color: "var(--jade)" }}>Per show</b>,
        label: "No standing hours",
      },
      {
        value: (
          <b>
            <em>0</em>
          </b>
        ),
        label: "Minimum commitment",
      },
      { value: <b>4–8</b>, label: "Shows a year" },
      { value: <b>Social</b>, label: "+ instant crew" },
    ],
    why: [
      <>
        Independent queer art exists in Lisbon because people build the rooms
        for it for free.{" "}
        <b>
          A show with a good crew feels generous; a show without one feels like
          a struggle
        </b>,{" "}
        and the artists feel the difference. You're the reason a space becomes
        an event.
      </>,
      <>
        This is the lowest-pressure way to be useful on the whole board.{" "}
        <em>Do one install and never come back, or become a regular</em>. Both
        are genuinely welcome.
      </>,
    ],
    tasks: [
      {
        title: "Set up and strike the space",
        description: "Hang work, build the bar, move the chairs, sweep at the end.",
      },
      {
        title: "Run the door and the room",
        description: "Welcome people, manage the flow, keep it warm.",
      },
      {
        title: "Pour and host",
        description: "The wine table is where half the conversations happen.",
      },
      {
        title: "Document the night (optional)",
        description: "If you shoot, the Collective always needs photos.",
      },
    ],
    commitments: [
      { b: "No minimum", s: "Sign up for the shows that suit you" },
      {
        b: "A show = ~5 hours",
        s: "Install afternoon or event evening, your pick",
      },
      { b: "Zero ongoing obligation", s: "Come back when you want, or don't" },
      { b: "Crew chat", s: "Where shows get posted and shifts get claimed" },
    ],
    goodFor: [
      <>
        Anyone who likes{" "}
        <b>making a room feel good and isn't precious about lifting things</b>.
        Logistics brains, hospitality people, and photographers are all useful.
        No art background needed: enthusiasm and reliability for the shifts you
        claim is the whole ask.
      </>,
    ],
    teamIntro:
      "A rotating crew of ~20. Some of the people you'd build a show with:",
    team: TEAM_POOL.slice(0, 6),
    applyRole: "Production Crew · Rainbow Arts",
    spotsFilled: "20 / 30",
    spotsPct: 66,
    spots: [
      { label: "Intake", value: <b>Rolling · per show</b> },
      { label: "Onboarding", value: <b>None · just turn up</b> },
      {
        label: "Commitment",
        value: <b style={{ color: "var(--jade)" }}>Pick your shows</b>,
      },
      { label: "Next show", value: <b>Group show · 28 Jun</b> },
    ],
    applyConfirm: (
      <>
        You're on the crew list for <strong>Rainbow Arts Collective</strong>.
        You'll get the crew chat invite. Claim whichever shifts suit you.
      </>
    ),
    partner: null,
    community: null,
  },

  {
    slug: "gatherings-volunteer",
    org: "QueerPulse",
    avatar: "QP",
    background: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    role: "Events & Gatherings Volunteer",
    cause: "Arts",
    commit: "low",
    time: "Event by event",
    location: "In-person · Lisbon",
    skills: ["Organisation", "Hospitality", "People skills"],
    description: "Help set up, run, and support QueerPulse member gatherings. Every event needs someone making it feel warm. Flexible commitment, instant community.",
    eyebrow: "Volunteer · Community · QueerPulse",
    urgent: "Recruiting · members welcome",
    titleLead: "Gatherings crew · ",
    titleEm: "QueerPulse events.",
    sub: (
      <>
        Every QueerPulse dinner, talk, and clinic night needs someone making
        sure it feels warm: greeting people at the door, watching for whoever
        came alone, keeping the night running.{" "}
        <b>You're the reason a room of strangers relaxes.</b>{" "}
        <em>It's also the fastest way to know everyone.</em>
      </>
    ),
    stats: [
      {
        value: <b style={{ color: "var(--jade)" }}>Per event</b>,
        label: "No fixed hours",
      },
      {
        value: (
          <b>
            <em>0</em>
          </b>
        ),
        label: "Minimum events",
      },
      { value: <b>~23</b>, label: "Gatherings a month" },
      { value: <b>Instant</b>, label: "Community" },
    ],
    why: [
      <>
        The difference between a good gathering and an awkward one is almost
        always one person paying attention:{" "}
        <b>
          noticing who's standing alone, making the introduction, refilling the
          water.
        </b>{" "}
        Hosts can't do that and run the night. That's you.
      </>,
      <>
        It's also, frankly, the best deal on this page:{" "}
        <em>
          you help for a few hours and you walk out knowing half the room.
        </em>{" "}
        Most of our most-connected members started by volunteering at
        gatherings.
      </>,
    ],
    tasks: [
      {
        title: "Greet at the door",
        description: "First face people see. Names, warmth, where the loo is.",
      },
      {
        title: "Watch for whoever came alone",
        description: "The single most useful thing: catch them, introduce them.",
      },
      {
        title: "Keep the night running",
        description: "Refills, timing, tidy corners. Quiet logistics.",
      },
      {
        title: "Help set up and pack down",
        description: "Arrive 30 min early, stay 15 after. Hosts love you for it.",
      },
    ],
    commitments: [
      { b: "No minimum", s: "Pick gatherings from the calendar that suit you" },
      {
        b: "An event = ~3 hours",
        s: "Including the early arrival and the tidy-up",
      },
      {
        b: "Zero ongoing obligation",
        s: "One a month or one a week, both great",
      },
      { b: "Members welcome", s: "You don't need to be one, but most are" },
    ],
    goodFor: [
      <>
        Anyone who's{" "}
        <b>warm, observant, and likes making people feel at home</b>. If you're
        new to QueerPulse and want to know people fast, this is the door in. No
        skills required beyond noticing and caring.
      </>,
    ],
    teamIntro:
      "A friendly crew across the city's gatherings. A few familiar faces:",
    team: TEAM_POOL.slice(0, 5),
    applyRole: "Gatherings Crew · QueerPulse",
    spotsFilled: "31 / 45",
    spotsPct: 68,
    spots: [
      { label: "Intake", value: <b>Rolling · per event</b> },
      { label: "Onboarding", value: <b>None · shadow one first</b> },
      {
        label: "Commitment",
        value: <b style={{ color: "var(--jade)" }}>Pick your events</b>,
      },
      { label: "Next gathering", value: <b>Welcome dinner · 14 Jun</b> },
    ],
    applyConfirm: (
      <>
        You're on the gatherings crew for <strong>QueerPulse</strong>. You'll
        get the crew calendar. Shadow one event, then claim whatever fits.
      </>
    ),
    partner: null,
    community: null,
  },
];
