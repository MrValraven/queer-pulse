/**
 * Crisis lines surfaced in the prominent strip at the top of Wellbeing.
 *
 * i18n Pattern A — `nameKey`/`hoursKey` are resolved by the sole consumer,
 * CrisisStrip.tsx. The organisation/helpline names (SOS Voz Amiga, ILGA
 * Portugal) are real-world proper nouns and read identically in both
 * catalogs; only the descriptive wording and the hours are translated.
 * `display`/`tel` are literal phone numbers — language-agnostic, untouched.
 */
export interface CrisisLine {
  nameKey: string;
  /** Human-readable number, easy to scan. */
  display: string;
  /** Digits only for the tel: href (no spaces). */
  tel: string;
  hoursKey: string;
}

export const CRISIS_LINES: CrisisLine[] = [
  {
    nameKey: "resources:crisis.line.emergency.name",
    display: "112",
    tel: "112",
    hoursKey: "resources:crisis.line.emergency.hours",
  },
  {
    nameKey: "resources:crisis.line.sosVozAmiga.name",
    display: "213 544 545",
    tel: "213544545",
    hoursKey: "resources:crisis.line.sosVozAmiga.hours",
  },
  {
    nameKey: "resources:crisis.line.ilga.name",
    display: "218 873 922",
    tel: "218873922",
    hoursKey: "resources:crisis.line.ilga.hours",
  },
];
