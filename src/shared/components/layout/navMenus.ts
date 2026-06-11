import { routes } from '../../../app/routeMap'
export interface MegaLink {
  label: string
  href: string
  featured?: boolean
}

export interface MegaColumn {
  head: string
  links: MegaLink[]
}

export interface MegaMenu {
  key: string
  columns: MegaColumn[]
}

export const NAV_MENUS: MegaMenu[] = [
  {
    key: "Community",
    columns: [
      {
        head: "People",
        links: [
          { label: "Members", href: `${routes.homepage}#discovery` },
          {
            label: "Browse · advanced",
            href: routes.memberDirectoryFilter,
          },
          { label: "Connect", href: routes.connect },
          { label: "Your connections", href: routes.connections },
          { label: "Forum", href: routes.forum },
          { label: "Search", href: routes.search },
          { label: "Dating", href: routes.dating },
        ],
      },
      {
        head: "Gather",
        links: [
          { label: "Gatherings", href: routes.gathering },
          { label: "Host a gathering", href: routes.host },
          { label: "Reading Groups", href: routes.readingGroups },
          { label: "Family", href: routes.family },
          { label: "Volunteer", href: routes.volunteer },
          { label: "Changemakers", href: routes.changemakers },
          { label: "Communities", href: routes.communities },
        ],
      },
    ],
  },
  {
    key: "Lisbon",
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
          { label: "Solidarity Pricing", href: routes.solidarity },
          { label: "Visas & Residency", href: routes.visas },
        ],
      },
    ],
  },
  {
    key: "Resources",
    columns: [
      {
        head: "Health",
        links: [
          { label: "Mental Health", href: routes.mentalHealth },
          { label: "Sexual Health", href: routes.sexualHealth },
          { label: "Trans Healthcare", href: routes.transHealthcare },
          { label: "Harm Reduction", href: routes.harmReduction },
          { label: "Wellbeing", href: routes.wellbeing },
          { label: "Sober", href: routes.sober },
        ],
      },
      {
        head: "Legal & safety",
        links: [
          { label: "Legal Resources", href: routes.legal },
          { label: "Hate Crime Guide", href: routes.hateCrime },
          { label: "Safety Guide", href: routes.safety },
          { label: "Emergency", href: routes.emergency },
          { label: "Report", href: routes.report },
        ],
      },
      {
        head: "Library",
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
            label: "Trans Day of Visibility",
            href: routes.transDayOfVisibility,
          },
          { label: "World AIDS Day", href: routes.worldAidsDay },
          { label: "Pride Month", href: routes.prideMonth },
          { label: "Micro Grants", href: routes.microGrants },
          { label: "Barter Exchange", href: routes.barter },
          {
            label: "Intersectionality",
            href: routes.intersectionality,
          },
        ],
      },
    ],
  },
  {
    key: "Culture",
    columns: [
      {
        head: "Read & watch",
        links: [
          { label: "Magazine", href: routes.magazine, featured: true },
          { label: "Cinema · queer film", href: routes.cinema, featured: true },
          { label: "Issues", href: routes.issues },
          { label: "Cover gallery", href: routes.coverGallery },
          { label: "Long reads", href: routes.tag },
          {
            label: "The Back Room (podcast)",
            href: routes.podcastShow,
          },
          { label: "Now playing", href: routes.audioPlayer },
          {
            label: "Newsletter archive",
            href: routes.newsletterArchive,
          },
          { label: "Reading Groups", href: routes.readingGroups },
          { label: "Stories", href: routes.story },
        ],
      },
      {
        head: "Create & act",
        links: [
          { label: "Creatives", href: routes.creatives, featured: true },
          { label: "Studio · queer music", href: routes.studio, featured: true },
          { label: "Activism", href: routes.activism },
          { label: "Changemakers", href: routes.changemakers },
          { label: "Manifesto", href: routes.manifesto },
          { label: "Governance", href: routes.governance },
          { label: "Platforms", href: routes.platforms },
        ],
      },
    ],
  },
  {
    key: "Work",
    columns: [
      {
        head: "Career",
        links: [
          { label: "Jobs", href: routes.jobs },
          { label: "Your applications", href: routes.applicationStatus },
          { label: "Skills & Learning", href: routes.skills },
          { label: "Mentorship", href: routes.mentorship },
          { label: "Employer Reviews", href: routes.employerReviews },
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
          { label: "Micro Grants", href: routes.microGrants },
          { label: "Economy", href: routes.economy },
          { label: "Offer a skill", href: routes.offer },
        ],
      },
    ],
  },
  {
    key: "About",
    columns: [
      {
        head: "Platform",
        links: [
          {
            label: "About QueerPulse",
            href: routes.about,
            featured: true,
          },
          { label: "The Manifesto", href: routes.manifesto },
          { label: "Annual Assembly", href: routes.annualAssembly },
          { label: "Constitution", href: routes.constitution },
          { label: "Code of Conduct", href: routes.codeOfConduct },
          {
            label: "Transparency report",
            href: routes.transparencyReport,
          },
          {
            label: "For organisations",
            href: routes.forOrganisations,
          },
          { label: "Cities", href: routes.cities },
          { label: "Get the app", href: routes.getTheApp },
          { label: "Help & FAQ", href: routes.help },
          { label: "Changelog", href: routes.changelog },
          { label: "Accessibility", href: routes.accessibility },
          { label: "Newsletter", href: routes.newsletter },
        ],
      },
      {
        head: "Legal & contact",
        links: [
          { label: "Privacy Policy", href: routes.privacy },
          { label: "Data request", href: routes.dsar },
          { label: "Terms of Use", href: routes.terms },
          { label: "Press Kit", href: routes.pressKit },
          { label: "Press archive", href: routes.pressArchive },
          { label: "Component library", href: routes.componentLibrary },
          { label: "Contact", href: routes.contact },
        ],
      },
    ],
  },
]
