import type { SavedKind } from "../../app/providers/SavedProvider";

/** Card display config for each saved-item kind. */
export interface KindCard {
  /** Category-pill label, e.g. "Magazine". */
  label: string;
  /** CSS-module variant key (drives the pill + bookmark colour). */
  variant: "magazine" | "film" | "job" | "event" | "thread" | "group";
  /** Footer call-to-action verb, e.g. "Read". */
  read: string;
}

export const KIND_CARD: Record<SavedKind, KindCard> = {
  article: { label: "Magazine", variant: "magazine", read: "Read" },
  film: { label: "Cinema", variant: "film", read: "Watch" },
  job: { label: "Work", variant: "job", read: "View role" },
  event: { label: "Gathering", variant: "event", read: "View" },
  post: { label: "Thread", variant: "thread", read: "Open thread" },
  group: { label: "Community", variant: "group", read: "Open" },
};
