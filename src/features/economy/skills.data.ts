export interface Skill {
  type: "offering" | "looking";
  member: string;
  skill: string;
  description: string;
  tags: string[];
  category: string;
}

export const SKILLS: Skill[] = [
  {
    type: "offering",
    member: "ines",
    skill: "Visual identity & branding",
    description: "How to build a brand identity that lasts: from strategy to type to colour. One-to-one, monthly, in the studio.",
    tags: ["Branding", "Typography", "Strategy"],
    category: "design",
  },
  {
    type: "offering",
    member: "ines",
    skill: "Portfolio review: designers",
    description: "Works in progress, honest feedback. Junior and mid-level designers welcome. One Friday a month in Príncipe Real.",
    tags: ["Portfolio", "Feedback", "Editorial"],
    category: "design",
  },
  {
    type: "offering",
    member: "rui",
    skill: "Backend engineering mentoring",
    description: "One hour a month, no structure. Career, architecture, surviving a bad sprint. Backend-focused but open.",
    tags: ["Rust", "Backend", "Career"],
    category: "tech",
  },
  {
    type: "offering",
    member: "beatriz",
    skill: "Wheel-throwing basics",
    description: "Monthly workshop in the Graça studio. Beginners welcome. You'll make something, you'll get it wrong, you'll learn.",
    tags: ["Ceramics", "Making", "Hands-on"],
    category: "craft",
  },
  {
    type: "offering",
    member: "andre",
    skill: "Film photography: getting started",
    description: "Practical session: choosing a camera, loading film, developing your first roll. In the studio in Cais do Sodré.",
    tags: ["Analog", "Film", "Photography"],
    category: "creative",
  },
  {
    type: "offering",
    member: "diogo",
    skill: "Music production: starting out",
    description: "Introduction to production: what DAW, what workflow, how to finish a track. For complete beginners.",
    tags: ["Ableton", "Production", "Electronic"],
    category: "creative",
  },
  {
    type: "looking",
    member: "carla",
    skill: "Fundraising for community projects",
    description: "Looking to understand how to secure funding for a community-focused initiative: grants, community shares, sponsorship.",
    tags: ["Fundraising", "Community", "Finance"],
    category: "business",
  },
  {
    type: "looking",
    member: "sofia",
    skill: "Music composition for film",
    description: "Specifically: how to brief a composer, how to communicate emotional intent, how to work with music you didn't make.",
    tags: ["Film", "Composition", "Collaboration"],
    category: "creative",
  },
  {
    type: "looking",
    member: "tomas",
    skill: "Food cost & menu pricing",
    description: "I cook well but I price badly. Looking for someone with hospitality business experience to help me work it out.",
    tags: ["Hospitality", "Finance", "Pricing"],
    category: "business",
  },
];

export const SKILL_FILTERS = [
  { value: "all", labelKey: "economy:skills.filter.all" },
  { value: "design", labelKey: "economy:skills.filter.design" },
  { value: "tech", labelKey: "economy:skills.filter.tech" },
  { value: "business", labelKey: "economy:skills.filter.business" },
  { value: "craft", labelKey: "economy:skills.filter.craft" },
  { value: "care", labelKey: "economy:skills.filter.care" },
  { value: "creative", labelKey: "economy:skills.filter.creative" },
];
