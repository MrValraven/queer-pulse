import {
  TEAM_POOL,
  type VolunteerOpportunity,
} from "./volunteerOpportunities.types";

export const VOLUNTEER_OPPORTUNITIES_B: VolunteerOpportunity[] = [
  {
    slug: "housing-advocate",
    org: "Queer Housing Justice Network",
    av: "HJ",
    bg: "rgba(122,82,184,.1)",
    color: "var(--violet)",
    role: "Community Housing Advocate",
    cause: "Housing",
    commit: "low",
    time: "2–3 hrs/week",
    location: "In-person · Mouraria",
    skills: ["Listening", "Documentation", "Organising"],
    desc: "Support queer residents navigating housing challenges — documenting situations, connecting people with legal aid, attending community meetings.",
    eyebrow: "Volunteer · Housing · Housing Justice Network",
    urgent: "Recruiting · Mouraria-based",
    titleLead: "Housing advocate · ",
    titleEm: "Mouraria.",
    sub: (
      <>
        Queer people get pushed out of housing in ways that are hard to prove
        and easy to ignore. The Network's job is to{" "}
        <b>make the pattern visible</b> — by documenting cases carefully and
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
        </b>{" "}
        — or a campaign that changes a building's behaviour.
      </>,
      <>
        You won't be doing this alone or cold.{" "}
        <em>You're paired with an experienced advocate</em> and backed by the
        Network's legal contacts. Your job is care and accuracy, not legal
        advice.
      </>,
    ],
    tasks: [
      {
        title: "Sit with residents and listen",
        desc: "Let people tell the whole story before you start writing.",
      },
      {
        title: "Document situations precisely",
        desc: "Dates, messages, who said what. Facts, not conclusions.",
      },
      {
        title: "Connect people to legal aid",
        desc: "You hand off to the Network's lawyers — you don't advise.",
      },
      {
        title: "Attend the monthly meeting",
        desc: "Where cases get reviewed and patterns get spotted.",
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
      { b: "Paired, not solo", s: "An experienced advocate has your back" },
    ],
    goodFor: [
      <>
        You need to be a <b>good listener and a careful writer</b> who can hold
        a boundary — you're documenting, not rescuing. Knowing the
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
  },

  {
    slug: "event-production",
    org: "Rainbow Arts Collective",
    av: "RA",
    bg: "rgba(232,119,90,.1)",
    color: "var(--accent-ink)",
    role: "Event Production Support",
    cause: "Arts",
    commit: "low",
    time: "Project by project",
    location: "In-person · Lisbon",
    skills: ["Event logistics", "Hospitality", "Photography"],
    desc: "Help set up and run exhibitions, crits, and group shows. Event-by-event commitment — pick the ones that work for you.",
    eyebrow: "Volunteer · Arts & Culture · Rainbow Arts Collective",
    urgent: "Recruiting · pick your shows",
    titleLead: "Production crew · ",
    titleEm: "queer arts shows.",
    sub: (
      <>
        The Collective puts on exhibitions, crits, and group shows in borrowed
        spaces — which means every show is built and struck by hand.{" "}
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
        </b>{" "}
        — and the artists feel the difference. You're the reason a space becomes
        an event.
      </>,
      <>
        This is the lowest-pressure way to be useful on the whole board.{" "}
        <em>Do one install and never come back, or become a regular</em> — both
        are genuinely welcome.
      </>,
    ],
    tasks: [
      {
        title: "Set up and strike the space",
        desc: "Hang work, build the bar, move the chairs, sweep at the end.",
      },
      {
        title: "Run the door and the room",
        desc: "Welcome people, manage the flow, keep it warm.",
      },
      {
        title: "Pour and host",
        desc: "The wine table is where half the conversations happen.",
      },
      {
        title: "Document the night (optional)",
        desc: "If you shoot, the Collective always needs photos.",
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
        No art background needed — enthusiasm and reliability for the shifts you
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
        You'll get the crew chat invite — claim whichever shifts suit you.
      </>
    ),
    partner: null,
  },

  {
    slug: "gatherings-volunteer",
    org: "QueerPulse",
    av: "QP",
    bg: "rgba(232,119,90,.12)",
    color: "var(--accent-ink)",
    role: "Events & Gatherings Volunteer",
    cause: "Arts",
    commit: "low",
    time: "Event by event",
    location: "In-person · Lisbon",
    skills: ["Organisation", "Hospitality", "People skills"],
    desc: "Help set up, run, and support QueerPulse member gatherings. Every event needs someone making it feel warm. Flexible commitment, instant community.",
    eyebrow: "Volunteer · Community · QueerPulse",
    urgent: "Recruiting · members welcome",
    titleLead: "Gatherings crew · ",
    titleEm: "QueerPulse events.",
    sub: (
      <>
        Every QueerPulse dinner, talk, and clinic night needs someone making
        sure it feels warm — greeting people at the door, watching for whoever
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
        always one person paying attention —{" "}
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
        desc: "First face people see. Names, warmth, where the loo is.",
      },
      {
        title: "Watch for whoever came alone",
        desc: "The single most useful thing — catch them, introduce them.",
      },
      {
        title: "Keep the night running",
        desc: "Refills, timing, tidy corners. Quiet logistics.",
      },
      {
        title: "Help set up and pack down",
        desc: "Arrive 30 min early, stay 15 after. Hosts love you for it.",
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
      { b: "Members welcome", s: "You don't need to be one — but most are" },
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
        get the crew calendar — shadow one event, then claim whatever fits.
      </>
    ),
    partner: null,
  },
];
