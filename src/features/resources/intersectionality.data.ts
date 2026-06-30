import { routes } from "../../app/routeMap";

export const GUIDELINES = routes.guidelines;
export const COMMUNITIES = routes.communities;
export const FORUM = routes.forum;
export const SOBER = routes.sober;
export const REPORT = routes.report;
export const LEGAL = routes.legal;
export const ACCESSIBILITY = routes.accessibility;
export const GOVERNANCE = routes.governance;
export const CONTACT = routes.contact;

export interface Voice {
  initials: string;
  bg: string;
  color: string;
  name: string;
  context: string;
  quote: string;
}
export interface InfoCard {
  eyebrow: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
}

export const RACE_VOICES: Voice[] = [
  {
    initials: "AM",
    bg: "rgba(45,27,61,.12)",
    color: "var(--plum)",
    name: "Amara M.",
    context: "Black British queer woman · Mouraria · Member since 2024",
    quote:
      "\"Lisbon's queer spaces are mostly white and mostly European. That's not unusual — most cities are like this — but it's worth knowing before you arrive expecting something different. The community within QueerPulse is more mixed than the general scene, which is why I'm still here.\"",
  },
  {
    initials: "RS",
    bg: "rgba(74,140,111,.16)",
    color: "var(--jade)",
    name: "Ravi S.",
    context: "South Asian non-binary · Arroios · Member since 2023",
    quote:
      "\"Portugal has its own relationship with race that's different from the UK or the US — the coloniality is present but discussed differently. I've had to learn a new set of social codes while also not having the language to describe them yet. The forum's been useful for that.\"",
  },
  {
    initials: "DF",
    bg: "rgba(232,119,90,.16)",
    color: "var(--accent-ink)",
    name: "Diallo F.",
    context: "Afro-Portuguese queer man · Cais do Sodré · Member since 2022",
    quote:
      "\"I grew up here and the queer community felt very white to me for a long time. That's changing slowly, especially in certain spaces and with certain generations. The intersection of Afro-Portuguese identity and queerness is something I'm still figuring out how to talk about — and I appreciate that this community actually wants to have the conversation.\"",
  },
];
export const RACE_INFO: InfoCard[] = [
  {
    eyebrow: "Navigating queer spaces",
    title: "When queer isn't enough",
    body: "Queer spaces in Lisbon, like most cities, can replicate the racial dynamics of the wider world. Fetishisation, exclusion, and micro-aggressions don't disappear because a space is queer. The community's guidelines explicitly address this — and the forum has threads for discussing specific situations.",
    link: { label: "Community guidelines →", href: GUIDELINES },
  },
  {
    eyebrow: "Portugal's colonial history",
    title: "What to know arriving here",
    body: "Portugal has a specific and often unprocessed relationship with its colonial history. Afro-Portuguese, Brazilian, Cape Verdean, and Angolan communities are significant and complex. Arriving as a person of colour from outside this history means learning a new set of dynamics. This takes time and the community can help.",
  },
  {
    eyebrow: "Community groups",
    title: "Spaces for QTIPOC members",
    body: "QueerPulse has a closed community group for QTIPOC (queer, trans, and intersex people of colour) members — a space for the conversations that the broader community isn't always the right container for. Join via the Communities page.",
    link: { label: "QTIPOC community group →", href: COMMUNITIES },
  },
];

export const FAITH_VOICES: Voice[] = [
  {
    initials: "LK",
    bg: "rgba(45,27,61,.12)",
    color: "var(--plum)",
    name: "Leila K.",
    context: "Queer Muslim · Graça · Member since 2024",
    quote:
      "\"I was very nervous about being out as both Muslim and queer in Lisbon. The queer community here has been more curious than hostile, but I've also had to explain myself in ways that straight people in the same community never do. It's exhausting sometimes — but the people who get it, really get it.\"",
  },
  {
    initials: "MT",
    bg: "rgba(74,140,111,.16)",
    color: "var(--jade)",
    name: "Marco T.",
    context: "Queer Catholic · Estrela · Member since 2022",
    quote:
      "\"I went to a queer-affirming mass in Lisbon and cried for about twenty minutes. I hadn't realised how much I'd internalised the idea that my faith and my queerness were incompatible until someone held both of them for me. Those spaces exist here if you look.\"",
  },
];
export const FAITH_INFO: InfoCard[] = [
  {
    eyebrow: "Catholic context",
    title: "A changing church",
    body: "The Portuguese Catholic Church is conservative institutionally but increasingly varied in practice. Some parishes are actively welcoming; others are not. There are priests in Lisbon who are known to be affirming — the community knows who they are. Ask in the forum.",
  },
  {
    eyebrow: "Other traditions",
    title: "Islam, Judaism, evangelical, and others",
    body: "Lisbon has growing Muslim and Jewish communities, and a range of Protestant and evangelical churches. The relationship between each community and its LGBTQ+ members varies enormously. The forum has threads for navigating faith questions in each of these contexts.",
    link: { label: "Forum: faith & queerness →", href: FORUM },
  },
  {
    eyebrow: "Not religious",
    title: "Secularism is also valid",
    body: "Portugal is increasingly secular, especially among younger generations. If your relationship with religion is complicated, hostile, or nonexistent — that's also completely valid here. The community doesn't require or assume any particular relationship with faith.",
  },
];

export const CLASS_INFO: InfoCard[] = [
  {
    eyebrow: "Lisbon's cost shift",
    title: "What gentrification means here",
    body: "Lisbon has become significantly more expensive in the last decade, partly driven by international migration including the queer expat community. This is worth holding honestly — the queer community is part of a pattern that has displaced local working-class residents. This tension is real and the community tries to engage with it rather than look away.",
  },
  {
    eyebrow: "Queer social life",
    title: "The cost of belonging",
    body: "Bar and club culture as the default queer social form excludes people who don't drink, can't afford cover charges, or find late-night environments difficult. QueerPulse deliberately runs social events that are free or low-cost, daytime or early evening, and alcohol-optional.",
    link: { label: "Sober community →", href: SOBER },
  },
  {
    eyebrow: "Economic support",
    title: "Community resources",
    body: "The Economy page has resources on emergency financial support, benefit navigation, and community mutual aid. The Skills Exchange is a non-monetary community tool. Both are available to all members.",
    link: { label: "Economy resources →", href: routes.economy },
  },
];
export const CLASS_VOICE: Voice = {
  initials: "JB",
  bg: "rgba(232,119,90,.16)",
  color: "var(--accent-ink)",
  name: "Joana B.",
  context: "Queer woman · Porto-born, Lisbon resident · Member since 2023",
  quote:
    "\"I grew up working class in Porto. Moving to Lisbon and entering queer expat spaces felt like moving to another country again. The cultural codes around travel, careers, aesthetics — I had to learn them from scratch and pretend I'd always known them. That's exhausting. The spaces in this community that acknowledge class exist feel like taking a breath.\"",
};

export const COMMUNITY_INFO: InfoCard[] = [
  {
    eyebrow: "Reporting & accountability",
    title: "If something happens in a community space",
    body: "QueerPulse has a report function for behaviour that violates the community guidelines — including racism, discrimination, and harassment. Reports are handled by the moderation team. If you're not sure whether something is reportable, the Contact page reaches the team directly.",
    link: { label: "Report something →", href: REPORT },
  },
  {
    eyebrow: "Community groups",
    title: "Finding your specific community",
    body: "Beyond the main community, QueerPulse has closed groups for QTIPOC members, disabled and chronically ill members, queer parents, and sober members. These exist so that people can have the conversations that the broader space isn't always suited for.",
    link: { label: "Browse community groups →", href: COMMUNITIES },
  },
  {
    eyebrow: "The forum",
    title: "Where harder conversations happen",
    body: "The forum's Intersectionality thread is one of the more active on the platform. It's where members raise specific experiences, share resources, challenge each other, and support each other. It's moderated but not sanitised.",
    link: { label: "Forum: intersectionality →", href: FORUM },
  },
];

export const COMMITMENTS = [
  {
    title: "Active moderation",
    text: "The platform is actively moderated for racism, transphobia, classism, and ableism — not just homophobia. Reports are taken seriously and followed up.",
  },
  {
    title: "Intersectional community groups",
    text: "Closed spaces for QTIPOC, disabled, sober, and other communities within the community are maintained as a genuine resource, not a token gesture.",
  },
  {
    title: "Economic accessibility",
    text: "No member is excluded from community events or resources due to cost. Sliding-scale and free options are available for everything we run.",
  },
  {
    title: "Not a monolith",
    text: "QueerPulse doesn't speak with one voice on political questions. The community contains multitudes. The forum is a place to have the arguments, not to have them resolved from above.",
  },
];

export const ORGS = [
  {
    focus: "QTIPOC",
    name: "Opus Diversidades",
    text: "Portuguese organisation working on LGBTQ+ rights with an explicit focus on the intersection of race, migration, and queerness in Portugal.",
    link: { label: "Discussion thread →", href: FORUM },
  },
  {
    focus: "Faith",
    name: "Comunidade Cristã LGBTQ+",
    text: "Queer-affirming Christian community based in Lisbon. Open to all denominations and traditions, focused on reconciling faith and queer identity.",
    link: { label: "Forum: faith thread →", href: FORUM },
  },
  {
    focus: "Race & migration",
    name: "ILGA Portugal",
    text: "Portugal's main LGBTQ+ rights organisation. Works explicitly on the intersection of LGBTQ+ rights and migration/race. Legal support and advocacy.",
    link: { label: "Legal resources →", href: LEGAL },
  },
  {
    focus: "Disability",
    name: "Accessibility resources",
    text: "See the QueerPulse Accessibility page for disability-specific resources for queer and disabled members in Lisbon.",
    link: { label: "Accessibility page →", href: ACCESSIBILITY },
  },
];

export const NAV = [
  { id: "race", label: "Race & ethnicity" },
  { id: "faith", label: "Faith & religion" },
  { id: "class", label: "Class & economics" },
  { id: "community", label: "Within the community" },
  { id: "orgs", label: "Organisations & resources" },
];
