export interface Signer {
  initials: string;
  bg?: string;
  color?: string;
  name: string;
}

export const SIGNERS: Signer[] = [
  { initials: "MR", name: "Marta Reis" },
  {
    initials: "AB",
    bg: "rgba(var(--jade-rgb),.16)",
    color: "var(--jade)",
    name: "André Bento",
  },
  {
    initials: "CV",
    bg: "rgba(45,27,61,.10)",
    color: "var(--plum)",
    name: "Catarina Vaz",
  },
  { initials: "JF", name: "Jonas Ferreira" },
  {
    initials: "LG",
    bg: "rgba(var(--accent-rgb),.16)",
    color: "var(--accent-ink)",
    name: "Luísa Gomes",
  },
  {
    initials: "NA",
    bg: "rgba(var(--jade-rgb),.16)",
    color: "var(--jade)",
    name: "Nuno Alves",
  },
  {
    initials: "SP",
    bg: "rgba(45,27,61,.10)",
    color: "var(--plum)",
    name: "Sara Pinheiro",
  },
  { initials: "RV", name: "Rita Vasquez" },
  {
    initials: "TM",
    bg: "rgba(var(--accent-rgb),.16)",
    color: "var(--accent-ink)",
    name: "Tomás Mendes",
  },
  {
    initials: "SC",
    bg: "rgba(var(--jade-rgb),.16)",
    color: "var(--jade)",
    name: "Sofia Castaño",
  },
  {
    initials: "AK",
    bg: "rgba(45,27,61,.10)",
    color: "var(--plum)",
    name: "Anika Kovač",
  },
];
