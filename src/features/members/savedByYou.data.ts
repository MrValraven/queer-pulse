import type { SavedKind } from "../../app/providers/SavedProvider";

/** Card display config for each saved-item kind. `labelKey`/`readKey` are
 *  catalog keys — a small, closed platform-defined vocabulary (chrome),
 *  resolved through `t()` by the consuming component. */
export interface KindCard {
  /** Category-pill catalog key, e.g. resolves to "Magazine". */
  labelKey: string;
  /** CSS-module variant key (drives the pill + bookmark colour). */
  variant: "magazine" | "film" | "job" | "event" | "thread" | "group";
  /** Footer call-to-action verb catalog key, e.g. resolves to "Read". */
  readKey: string;
}

export const KIND_CARD: Record<SavedKind, KindCard> = {
  article: {
    labelKey: "members:savedByYou.kind.magazine.label",
    variant: "magazine",
    readKey: "members:savedByYou.kind.magazine.cta",
  },
  film: {
    labelKey: "members:savedByYou.kind.film.label",
    variant: "film",
    readKey: "members:savedByYou.kind.film.cta",
  },
  job: {
    labelKey: "members:savedByYou.kind.job.label",
    variant: "job",
    readKey: "members:savedByYou.kind.job.cta",
  },
  event: {
    labelKey: "members:savedByYou.kind.event.label",
    variant: "event",
    readKey: "members:savedByYou.kind.event.cta",
  },
  post: {
    labelKey: "members:savedByYou.kind.post.label",
    variant: "thread",
    readKey: "members:savedByYou.kind.post.cta",
  },
  group: {
    labelKey: "members:savedByYou.kind.group.label",
    variant: "group",
    readKey: "members:savedByYou.kind.group.cta",
  },
  // Reuses the "job" colour variant — both are board-listing kinds, so this
  // doesn't need its own token in SavedByYou.module.css.
  housing: {
    labelKey: "members:savedByYou.kind.housing.label",
    variant: "job",
    readKey: "members:savedByYou.kind.housing.cta",
  },
  // Reuses the "job" colour variant, same reasoning as `housing` above.
  flatmate: {
    labelKey: "members:savedByYou.kind.flatmate.label",
    variant: "job",
    readKey: "members:savedByYou.kind.flatmate.cta",
  },
  // Reuses the "job" colour variant, same reasoning as `housing` above.
  landlord: {
    labelKey: "members:savedByYou.kind.landlord.label",
    variant: "job",
    readKey: "members:savedByYou.kind.landlord.cta",
  },
};
