/** Crisis lines surfaced in the prominent strip at the top of Wellbeing. */
export interface CrisisLine {
  name: string;
  /** Human-readable number, easy to scan. */
  display: string;
  /** Digits only for the tel: href (no spaces). */
  tel: string;
  hours: string;
}

export const CRISIS_LINES: CrisisLine[] = [
  {
    name: "Emergency (police · ambulance)",
    display: "112",
    tel: "112",
    hours: "Always · free",
  },
  {
    name: "SOS Voz Amiga",
    display: "213 544 545",
    tel: "213544545",
    hours: "Daily 16h–24h",
  },
  {
    name: "ILGA Portugal — LGBTQ+ line",
    display: "218 873 918",
    tel: "218873918",
    hours: "Weekdays 10h–18h",
  },
];
