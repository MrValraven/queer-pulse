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
          { label: "Members", href: "QueerPulse Homepage.html#discovery" },
          {
            label: "Browse · advanced",
            href: "QueerPulse Member Directory Filter.html",
          },
          { label: "Connect", href: "QueerPulse Connect.html" },
          { label: "Your connections", href: "QueerPulse Connections.html" },
          { label: "Forum", href: "QueerPulse Forum.html" },
          { label: "Search", href: "QueerPulse Search.html" },
          { label: "Dating", href: "QueerPulse Dating.html" },
        ],
      },
      {
        head: "Gather",
        links: [
          { label: "Gatherings", href: "QueerPulse Gathering.html" },
          { label: "Host a gathering", href: "QueerPulse Host.html" },
          { label: "Reading Groups", href: "QueerPulse Reading Groups.html" },
          { label: "Family", href: "QueerPulse Family.html" },
          { label: "Volunteer", href: "QueerPulse Volunteer.html" },
          { label: "Changemakers", href: "QueerPulse Changemakers.html" },
          { label: "Communities", href: "QueerPulse Communities.html" },
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
          { label: "Queer Map", href: "QueerPulse Map.html", featured: true },
          { label: "Business Directory", href: "QueerPulse Directory.html" },
          { label: "Events Calendar", href: "QueerPulse Calendar.html" },
          { label: "Safe Spaces", href: "QueerPulse Safe Spaces.html" },
          { label: "Partners", href: "QueerPulse Partners.html" },
        ],
      },
      {
        head: "Living here",
        links: [
          { label: "Arriving in Lisbon", href: "QueerPulse Arriving.html" },
          { label: "Housing", href: "QueerPulse Housing.html" },
          { label: "Flatmates", href: "QueerPulse Flatmates.html" },
          { label: "Solidarity Pricing", href: "QueerPulse Solidarity.html" },
          { label: "Visas & Residency", href: "QueerPulse Visas.html" },
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
          { label: "Mental Health", href: "QueerPulse Mental Health.html" },
          { label: "Sexual Health", href: "QueerPulse Sexual Health.html" },
          { label: "Trans Healthcare", href: "QueerPulse Trans Healthcare.html" },
          { label: "Harm Reduction", href: "QueerPulse Harm Reduction.html" },
          { label: "Wellbeing", href: "QueerPulse Wellbeing.html" },
          { label: "Sober", href: "QueerPulse Sober.html" },
        ],
      },
      {
        head: "Legal & safety",
        links: [
          { label: "Legal Resources", href: "QueerPulse Legal.html" },
          { label: "Hate Crime Guide", href: "QueerPulse Hate Crime.html" },
          { label: "Safety Guide", href: "QueerPulse Safety.html" },
          { label: "Emergency", href: "QueerPulse Emergency.html" },
          { label: "Report", href: "QueerPulse Report.html" },
        ],
      },
      {
        head: "Library",
        links: [
          {
            label: "Resource Library",
            href: "QueerPulse Resources.html",
            featured: true,
          },
          { label: "Queer 101", href: "QueerPulse 101.html" },
          { label: "Glossary", href: "QueerPulse Glossary.html" },
          { label: "Trans Hub", href: "QueerPulse Trans Hub.html" },
          {
            label: "Trans Day of Visibility",
            href: "QueerPulse Trans Day of Visibility.html",
          },
          { label: "World AIDS Day", href: "QueerPulse World AIDS Day.html" },
          { label: "Pride Month", href: "QueerPulse Pride Month.html" },
          { label: "Micro Grants", href: "QueerPulse Micro Grants.html" },
          { label: "Barter Exchange", href: "QueerPulse Barter.html" },
          {
            label: "Intersectionality",
            href: "QueerPulse Intersectionality.html",
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
          { label: "Magazine", href: "QueerPulse Magazine.html", featured: true },
          { label: "Cinema · queer film", href: "QueerPulse Cinema.html", featured: true },
          { label: "Issues", href: "QueerPulse Issues.html" },
          { label: "Cover gallery", href: "QueerPulse Cover Gallery.html" },
          { label: "Long reads", href: "QueerPulse Tag.html" },
          {
            label: "The Back Room (podcast)",
            href: "QueerPulse Podcast Show.html",
          },
          { label: "Now playing", href: "QueerPulse Audio Player.html" },
          {
            label: "Newsletter archive",
            href: "QueerPulse Newsletter Archive.html",
          },
          { label: "Reading Groups", href: "QueerPulse Reading Groups.html" },
          { label: "Stories", href: "QueerPulse Story.html" },
        ],
      },
      {
        head: "Create & act",
        links: [
          { label: "Creatives", href: "QueerPulse Creatives.html", featured: true },
          { label: "Studio · queer music", href: "QueerPulse Studio.html", featured: true },
          { label: "Activism", href: "QueerPulse Activism.html" },
          { label: "Changemakers", href: "QueerPulse Changemakers.html" },
          { label: "Manifesto", href: "QueerPulse Manifesto.html" },
          { label: "Governance", href: "QueerPulse Governance.html" },
          { label: "Platforms", href: "QueerPulse Platforms.html" },
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
          { label: "Jobs", href: "QueerPulse Jobs.html" },
          { label: "Your applications", href: "QueerPulse Application Status.html" },
          { label: "Skills & Learning", href: "QueerPulse Skills.html" },
          { label: "Mentorship", href: "QueerPulse Mentorship.html" },
          { label: "Employer Reviews", href: "QueerPulse Employer Reviews.html" },
        ],
      },
      {
        head: "Economy",
        links: [
          {
            label: "Barter Exchange",
            href: "QueerPulse Barter.html",
            featured: true,
          },
          { label: "Solidarity Pricing", href: "QueerPulse Solidarity.html" },
          { label: "Micro Grants", href: "QueerPulse Micro Grants.html" },
          { label: "Economy", href: "QueerPulse Economy.html" },
          { label: "Offer a skill", href: "QueerPulse Offer.html" },
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
            href: "QueerPulse About.html",
            featured: true,
          },
          { label: "The Manifesto", href: "QueerPulse Manifesto.html" },
          { label: "Annual Assembly", href: "QueerPulse Annual Assembly.html" },
          { label: "Constitution", href: "QueerPulse Constitution.html" },
          { label: "Code of Conduct", href: "QueerPulse Code of Conduct.html" },
          {
            label: "Transparency report",
            href: "QueerPulse Transparency Report.html",
          },
          {
            label: "For organisations",
            href: "QueerPulse For Organisations.html",
          },
          { label: "Cities", href: "QueerPulse Cities.html" },
          { label: "Get the app", href: "QueerPulse Get the App.html" },
          { label: "Help & FAQ", href: "QueerPulse Help.html" },
          { label: "Changelog", href: "QueerPulse Changelog.html" },
          { label: "Accessibility", href: "QueerPulse Accessibility.html" },
          { label: "Newsletter", href: "QueerPulse Newsletter.html" },
        ],
      },
      {
        head: "Legal & contact",
        links: [
          { label: "Privacy Policy", href: "QueerPulse Privacy.html" },
          { label: "Data request", href: "QueerPulse DSAR.html" },
          { label: "Terms of Use", href: "QueerPulse Terms.html" },
          { label: "Press Kit", href: "QueerPulse Press Kit.html" },
          { label: "Press archive", href: "QueerPulse Press Archive.html" },
          { label: "Component library", href: "QueerPulse Component Library.html" },
          { label: "Contact", href: "QueerPulse Contact.html" },
        ],
      },
    ],
  },
]
