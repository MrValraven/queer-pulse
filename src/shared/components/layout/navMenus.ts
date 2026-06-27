import { routes } from "../../../app/routeMap";
export interface MegaLink {
  label: string;
  href: string;
  featured?: boolean;
}

export interface MegaColumn {
  head: string;
  links: MegaLink[];
}

/** Promo cell shown on the left of each mega panel, foregrounding the menu's hero destination. */
export interface MegaFeature {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

export interface MegaMenu {
  key: string;
  feature?: MegaFeature;
  columns: MegaColumn[];
}

export const NAV_MENUS: MegaMenu[] = [
  {
    key: "Community",
    feature: {
      eyebrow: "Community",
      title: "Find your people.",
      body: "A member directory, forums, and gatherings — the everyday connective tissue of the network.",
      href: routes.members,
      cta: "Browse members",
    },
    columns: [
      {
        head: "People",
        links: [
          { label: "Members directory", href: routes.members },
          { label: "Forum", href: routes.forum },
          { label: "Dating", href: routes.dating },
        ],
      },
      {
        head: "Gather",
        links: [
          { label: "Events", href: routes.events },
          { label: "Host a gathering", href: routes.host },
          { label: "Communities", href: routes.communities },
        ],
      },
      {
        head: "Organise",
        links: [
          { label: "Volunteer", href: routes.volunteer },
          { label: "Activism", href: routes.activism },
          { label: "Changemakers", href: routes.changemakers },
        ],
      },
    ],
  },
  {
    key: "Lisbon",
    feature: {
      eyebrow: "Lisbon",
      title: "Queer Lisbon, mapped.",
      body: "Spaces, businesses, and the practical know-how for arriving and living here.",
      href: routes.map,
      cta: "Open the Queer Map",
    },
    columns: [
      {
        head: "Discover",
        links: [
          { label: "Queer Map", href: routes.map, featured: true },
          { label: "Business Directory", href: routes.directory },
          { label: "Events Calendar", href: routes.calendar },
          { label: "Safe Spaces", href: routes.safeSpaces },
          { label: "Partners", href: routes.partners },
        ],
      },
      {
        head: "Living here",
        links: [
          { label: "Arriving in Lisbon", href: routes.arriving },
          { label: "Housing", href: routes.housing },
          { label: "Flatmates", href: routes.flatmates },
          { label: "Visas & Residency", href: routes.visas },
        ],
      },
    ],
  },
  {
    key: "Resources",
    feature: {
      eyebrow: "Support",
      title: "Help when you need it.",
      body: "Health, safety, and rights — plus a library to learn at your own pace.",
      href: routes.resources,
      cta: "Open the library",
    },
    columns: [
      {
        head: "Health & wellbeing",
        links: [
          { label: "Mental Health", href: routes.mentalHealth },
          { label: "Sexual Health", href: routes.sexualHealth },
          { label: "Trans Healthcare", href: routes.transHealthcare },
          { label: "Harm Reduction", href: routes.harmReduction },
          { label: "Sober", href: routes.sober },
          { label: "Wellbeing", href: routes.wellbeing },
        ],
      },
      {
        head: "Safety & rights",
        links: [
          { label: "Emergency", href: routes.emergency, featured: true },
          { label: "Report", href: routes.report },
          { label: "Hate Crime Guide", href: routes.hateCrime },
          { label: "Safety Guide", href: routes.safety },
          { label: "Legal Resources", href: routes.legal },
        ],
      },
      {
        head: "Learn & belong",
        links: [
          {
            label: "Resource Library",
            href: routes.resources,
            featured: true,
          },
          { label: "Queer 101", href: routes.queer101 },
          { label: "Glossary", href: routes.glossary },
          { label: "Trans Hub", href: routes.transHub },
          {
            label: "Intersectionality",
            href: routes.intersectionality,
          },
          { label: "Coming Out", href: routes.comingOut },
          { label: "Family & parenting", href: routes.family },
        ],
      },
    ],
  },
  {
    key: "Culture",
    feature: {
      eyebrow: "The Magazine",
      title: "Read the new issue.",
      body: "Essays, interviews, reviews and reportage from the community — published the first of every month.",
      href: routes.magazine,
      cta: "Open Issue 18",
    },
    columns: [
      {
        head: "The Magazine",
        links: [
          { label: "Current issue", href: routes.magazine, featured: true },
          { label: "All issues", href: routes.issues },
          { label: "Cover gallery", href: routes.coverGallery },
          { label: "Long reads", href: routes.tag },
          { label: "Stories", href: routes.story },
          { label: "Newsletter", href: routes.newsletterArchive },
          { label: "Write for us", href: routes.submitStory },
        ],
      },
      {
        head: "Screen & Sound",
        links: [
          { label: "Cinema · queer film", href: routes.cinema, featured: true },
          { label: "The Back Room (podcast)", href: routes.podcastShow },
          { label: "Radio · Now playing", href: routes.audioPlayer },
        ],
      },
      {
        head: "Makers & Scene",
        links: [
          { label: "Studio · queer music", href: routes.studio, featured: true },
          { label: "Creatives", href: routes.creatives },
          { label: "Platforms", href: routes.platforms },
          { label: "Reading Groups", href: routes.readingGroups },
          { label: "Lisbon scene & radio", href: routes.culture },
        ],
      },
      {
        head: "Mark the Year",
        links: [
          { label: "Pride Month", href: routes.prideMonth },
          { label: "Trans Day of Visibility", href: routes.transDayOfVisibility },
          { label: "World AIDS Day", href: routes.worldAidsDay },
        ],
      },
    ],
  },
  {
    key: "Work",
    feature: {
      eyebrow: "Your workspace",
      title: "Your Work, in one place.",
      body: "Track applications, mentors, and grants — and show up to work exactly as yourself.",
      href: routes.work,
      cta: "Open your workspace",
    },
    columns: [
      {
        head: "Career",
        links: [
          { label: "Your Work", href: routes.work, featured: true },
          { label: "Jobs", href: routes.jobs },
          { label: "Skills & Learning", href: routes.skills },
          { label: "Mentorship", href: routes.mentorship },
          { label: "Employer Reviews", href: routes.employerReviews },
          { label: "Work profile", href: routes.workProfile },
        ],
      },
      {
        head: "Economy",
        links: [
          {
            label: "Barter Exchange",
            href: routes.barter,
            featured: true,
          },
          { label: "Solidarity Pricing", href: routes.solidarity },
          { label: "Grants", href: routes.grants },
          { label: "Micro Grants", href: routes.microGrants },
          { label: "How our economy works", href: routes.economy },
          { label: "Offer a skill", href: routes.offer },
        ],
      },
    ],
  },
  {
    key: "About",
    feature: {
      eyebrow: "About",
      title: "What QueerPulse is.",
      body: "Our mission, how we're governed, and the legal small print.",
      href: routes.about,
      cta: "About QueerPulse",
    },
    columns: [
      {
        head: "Mission & governance",
        links: [
          {
            label: "About QueerPulse",
            href: routes.about,
            featured: true,
          },
          { label: "The Manifesto", href: routes.manifesto },
          { label: "Governance", href: routes.governance },
          { label: "Constitution", href: routes.constitution },
          { label: "Code of Conduct", href: routes.codeOfConduct },
          { label: "Annual Assembly", href: routes.annualAssembly },
          {
            label: "Transparency report",
            href: routes.transparencyReport,
          },
          { label: "Cities", href: routes.cities },
        ],
      },
      {
        head: "Using QueerPulse",
        links: [
          { label: "Help & FAQ", href: routes.help },
          { label: "Get the app", href: routes.getTheApp },
          { label: "Accessibility", href: routes.accessibility },
          { label: "Changelog", href: routes.changelog },
          {
            label: "For organisations",
            href: routes.forOrganisations,
          },
        ],
      },
      {
        head: "Legal & press",
        links: [
          { label: "Privacy Policy", href: routes.privacy },
          { label: "Terms of Use", href: routes.terms },
          { label: "Data request", href: routes.dsar },
          { label: "Contact", href: routes.contact },
          { label: "Press Kit", href: routes.pressKit },
          { label: "Press archive", href: routes.pressArchive },
        ],
      },
    ],
  },
];
