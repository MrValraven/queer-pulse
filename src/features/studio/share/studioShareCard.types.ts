import type { StudioLinkTarget } from "./studioLinkTarget";

/** Sizing and chrome only (contract). Every surface keeps the same height. */
export type StudioShareCardSurface = "chat" | "post" | "composer";

export interface StudioShareCardProps {
  target: StudioLinkTarget;
  surface: StudioShareCardSurface;
  /** Composer preview only: shows a remove control. */
  onRemove?: () => void;
}
