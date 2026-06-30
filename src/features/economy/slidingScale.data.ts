/** One pay-what-fits tier on a sliding scale price card. */
export interface Tier {
  id: string;
  /** Tier name, e.g. "Supported" / "Standard" / "Solidarity". */
  name: string;
  /** Free-text price (e.g. "€60", "€90", "from €120"). */
  price: string;
  /** Who this tier is for — the honest, self-selecting guidance. */
  forWhom: string;
}

/** A full sliding-scale price card: the offering plus its tiers. */
export interface SlidingScale {
  /** The service / offering being priced. */
  service: string;
  /** A short intro line that frames the scale warmly. */
  intro: string;
  tiers: Tier[];
}

/**
 * A sensible starting point: three tiers people can self-select into without
 * having to justify themselves. The framing invites honesty, not means-testing.
 */
export const DEFAULT_SCALE: SlidingScale = {
  service: "",
  intro:
    "Pay the tier that fits your means right now — no proof, no justification. " +
    "Choosing higher keeps this work accessible to people who need the supported rate.",
  tiers: [
    {
      id: "supported",
      name: "Supported",
      price: "€60",
      forWhom:
        "If money is tight or you're under-resourced — students, between jobs, " +
        "carrying more than your share. This rate is for you, no questions asked.",
    },
    {
      id: "standard",
      name: "Standard",
      price: "€90",
      forWhom:
        "If you're financially stable and this is a fair market rate for you. " +
        "Paying here covers my time and keeps the work sustainable.",
    },
    {
      id: "solidarity",
      name: "Solidarity",
      price: "€120",
      forWhom:
        "If you have resources to spare and want to sustain access for others. " +
        "Paying here directly subsidises someone at the supported rate.",
    },
  ],
};
