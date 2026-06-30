export const PRONOUN_CHIPS = [
  "she/her",
  "he/him",
  "they/them",
  "she/they",
  "he/they",
  "any/all",
];

export interface VisField {
  name: string;
  desc: string;
  locked?: boolean;
  defaultVal: string;
}

export const VIS_FIELDS: VisField[] = [
  {
    name: "Display name",
    desc: "Always public within QueerPulse",
    locked: true,
    defaultVal: "Members",
  },
  { name: "Photo", desc: "Profile picture", defaultVal: "Members" },
  {
    name: "Pronouns",
    desc: "How you'd like to be addressed",
    defaultVal: "Members",
  },
  { name: "Bio", desc: "Your introduction text", defaultVal: "Members" },
  {
    name: "Occupation",
    desc: "Job title and organisation",
    defaultVal: "Members",
  },
  { name: "Location", desc: "Neighbourhood in Lisbon", defaultVal: "Members" },
  {
    name: "Skills",
    desc: "Offered skills and interests",
    defaultVal: "Members",
  },
  { name: "Link", desc: "External URL on your profile", defaultVal: "Members" },
];
