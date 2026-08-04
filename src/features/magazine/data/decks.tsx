import type { ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";

/** A single full-screen slide. Discriminated on `layout`. */
export type Slide =
  | {
      layout: "text";
      eyebrow?: string;
      heading?: ReactNode;
      body?: ReactNode;
      pull?: string;
      align?: "left" | "center";
    }
  | {
      layout: "image";
      src: string;
      alt: string;
      caption?: string;
      overlay?: ReactNode;
      tint: AvatarTint;
    }
  | {
      layout: "stat";
      value: string;
      unit?: string;
      label: ReactNode;
      source?: string;
      tint: AvatarTint;
    }
  | {
      layout: "interactive";
      kind: "before-after";
      before: { src: string; alt: string; label: string };
      after: { src: string; alt: string; label: string };
    }
  | {
      layout: "interactive";
      kind: "reveal";
      prompt: ReactNode;
      hidden: ReactNode;
      tint?: AvatarTint;
    };

/** An interactive slide-deck article — its own content type, separate from Article. */
export interface SlideDeck {
  id: string;
  kicker: string;
  section: string;
  title: ReactNode;
  byline: string;
  role: string | null;
  date: string;
  readTime: string;
  initials: string;
  tint: AvatarTint;
  cover: string;
  coverDesc: string;
  authorBio: string;
  tags: string[];
  related: string[];
  slides: Slide[];
}

/** Narrow a slide to the interactive union member (both kinds). */
export function isInteractiveSlide(
  slide: Slide,
): slide is Extract<Slide, { layout: "interactive" }> {
  return slide.layout === "interactive";
}

/** Parse a numeric target out of a stat `value` string (e.g. "×3" → 3, "1.2k" → 1.2). */
export function statTarget(value: string): number {
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}
