export interface Provider {
  name: string;
  practice: string;
  neighbourhood: string;
  notedFor: string;
  tags: string[];
  checked: string;
}

export const PROVIDERS: Provider[] = [
  {
    name: "Dr. Sousa",
    practice: "Clínica Arroios",
    neighbourhood: "Arroios",
    notedFor:
      "Both my kids see her, brilliant and completely matter-of-fact about two mums on the form. Talks to both parents equally, every visit.",
    tags: ["Two-parent forms", "PT · EN"],
    checked: "Checked Jun 2026",
  },
  {
    name: "Dr. Alves",
    practice: "Centro Médico Santos",
    neighbourhood: "Santos",
    notedFor:
      "A bit further out but worth it. Very good with anxious kids, and never once made our family structure a topic unless we raised it.",
    tags: ["Anxious kids", "PT"],
    checked: "Checked May 2026",
  },
  {
    name: "Dr. Marreiros",
    practice: "Hospital CUF Tejo (paediatrics)",
    neighbourhood: "Alcântara",
    notedFor:
      "Uses both parents' names everywhere in the records without being asked twice. Inclusive intake forms as standard.",
    tags: ["Inclusive records", "PT · EN"],
    checked: "Checked Apr 2026",
  },
];
