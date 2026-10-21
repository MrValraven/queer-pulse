import type { Sub } from "./studioTriage.data";

// The demo triage's per-submission detail: who answers, the length, and the
// claim and curator notes where a submission has them. Names, places and
// lengths stay literal; the claim line and curator quotes resolve through
// `studioShowcase:triage.detail.*`.

export interface TriageFlaggedComment {
  curator: string;
  quoteKey: string;
}

export interface TriageSubmissionDetail {
  /** Who the pass sentence goes to. */
  artistName: string;
  /** "Renato V. · Porto · single · 4:40": the line under the title. */
  artistLine: string;
  durationLabel: string;
  /** Bars of the mini waveform that read as heard, out of `WF`. */
  playedBars: number;
  /** The full file sheet (`buildFile`) exists for this one; the others show
   *  their submission meta lines instead. */
  hasFileSheet: boolean;
  claim: {
    initials: string;
    claimantName: string;
    secondReaderName: string;
  } | null;
  flagged: TriageFlaggedComment[];
}

/** A submission's stable key: its title, which never repeats in the demo. */
export function triageSubmissionKeyOf(submission: Sub): string {
  return `${submission.titlePre}${submission.titleEm ?? ""}`;
}

const DETAIL_BY_KEY: Record<string, TriageSubmissionDetail> = {
  "The piano I waited for": {
    artistName: "Renato",
    artistLine: "Renato V. · Porto · single · 4:40",
    durationLabel: "4:40",
    playedBars: 6,
    hasFileSheet: true,
    claim: {
      initials: "SM",
      claimantName: "Sara M.",
      secondReaderName: "D. Okoye",
    },
    flagged: [
      {
        curator: "D. Okoye",
        quoteKey: "studioShowcase:triage.detail.flagged.bridge",
      },
      {
        curator: "João R.",
        quoteKey: "studioShowcase:triage.detail.flagged.regional",
      },
      {
        curator: "Yara R.",
        quoteKey: "studioShowcase:triage.detail.flagged.standards",
      },
    ],
  },
  "Coro de Porto": {
    artistName: "Coro de Porto",
    artistLine: "Coro de Porto · Porto · EP · 18:12",
    durationLabel: "18:12",
    playedBars: 0,
    hasFileSheet: false,
    claim: null,
    flagged: [],
  },
  "Tomboy · Outubro": {
    artistName: "Tomboy",
    artistLine: "Tomboy · São Paulo · DJ set · 38:00",
    durationLabel: "38:00",
    playedBars: 0,
    hasFileSheet: false,
    claim: null,
    flagged: [],
  },
  Ainda: {
    artistName: "Helena",
    artistLine: "Helena P. · Aveiro · single · 3:52",
    durationLabel: "3:52",
    playedBars: 0,
    hasFileSheet: false,
    claim: null,
    flagged: [],
  },
};

const FALLBACK_DETAIL: TriageSubmissionDetail = {
  artistName: "",
  artistLine: "",
  durationLabel: "",
  playedBars: 0,
  hasFileSheet: false,
  claim: null,
  flagged: [],
};

export function triageDetailOf(submission: Sub): TriageSubmissionDetail {
  return DETAIL_BY_KEY[triageSubmissionKeyOf(submission)] ?? FALLBACK_DETAIL;
}
