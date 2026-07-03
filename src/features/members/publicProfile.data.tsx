import type { ReactNode } from "react";

/** An animated stat on a public profile, e.g. `{ value: "1.4k", label: "Members reached" }`. */
export interface PublicStat {
  value: string;
  em?: boolean;
  label: string;
}

/** A public writing / hosting card on a public profile. */
export interface PublicCard {
  kicker: string;
  title: ReactNode;
  meta: string;
}
