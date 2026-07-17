export interface Skill {
  type: "offering" | "looking";
  member: string;
  skill: string;
  desc: string;
  tags: string[];
  cat: string;
}

export const SKILLS: Skill[] = [
  {
    type: "offering",
    member: "ines",
    skill: "Visual identity & branding",
    desc: "How to build a brand identity that lasts — from strategy to type to colour. One-to-one, monthly, in the studio.",
    tags: ["Branding", "Typography", "Strategy"],
    cat: "design",
  },
  {
    type: "offering",
    member: "ines",
    skill: "Portfolio review — designers",
    desc: "Works in progress, honest feedback. Junior and mid-level designers welcome. One Friday a month in Príncipe Real.",
    tags: ["Portfolio", "Feedback", "Editorial"],
    cat: "design",
  },
  {
    type: "offering",
    member: "rui",
    skill: "Backend engineering mentoring",
    desc: "One hour a month, no structure. Career, architecture, surviving a bad sprint. Backend-focused but open.",
    tags: ["Rust", "Backend", "Career"],
    cat: "tech",
  },
  {
    type: "offering",
    member: "beatriz",
    skill: "Wheel-throwing basics",
    desc: "Monthly workshop in the Graça studio. Beginners welcome. You'll make something, you'll get it wrong, you'll learn.",
    tags: ["Ceramics", "Making", "Hands-on"],
    cat: "craft",
  },
  {
    type: "offering",
    member: "andre",
    skill: "Film photography — getting started",
    desc: "Practical session: choosing a camera, loading film, developing your first roll. In the darkroom in Cais do Sodré.",
    tags: ["Analog", "Darkroom", "Photography"],
    cat: "creative",
  },
  {
    type: "offering",
    member: "diogo",
    skill: "Music production — starting out",
    desc: "Introduction to production: what DAW, what workflow, how to finish a track. For complete beginners.",
    tags: ["Ableton", "Production", "Electronic"],
    cat: "creative",
  },
  {
    type: "looking",
    member: "carla",
    skill: "Fundraising for community projects",
    desc: "Looking to understand how to secure funding for a community-focused initiative — grants, community shares, sponsorship.",
    tags: ["Fundraising", "Community", "Finance"],
    cat: "business",
  },
  {
    type: "looking",
    member: "sofia",
    skill: "Music composition for film",
    desc: "Specifically: how to brief a composer, how to communicate emotional intent, how to work with music you didn't make.",
    tags: ["Film", "Composition", "Collaboration"],
    cat: "creative",
  },
  {
    type: "looking",
    member: "tomas",
    skill: "Food cost & menu pricing",
    desc: "I cook well but I price badly. Looking for someone with hospitality business experience to help me work it out.",
    tags: ["Hospitality", "Finance", "Pricing"],
    cat: "business",
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
