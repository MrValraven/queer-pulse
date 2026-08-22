import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CardPhotoStyle,
  CardProgramDTO,
  CardSkin,
} from "./api/cards.api";

export interface CardDesignerDraft {
  skin: CardSkin;
  accentToken: string;
  cardName: string;
  validityMonths: number | null;
  /**
   * What the crest field currently holds: the saved crest's resolved URL
   * until the owner picks a new one, then that upload's storage key. Compare
   * against `savedCrestKey` to know whether it changed at all — the backend
   * clears the crest on an explicit `null` and leaves it alone when the field
   * is absent, so an unchanged crest must not be sent.
   */
  crestKey: string;
  /** The baseline `crestKey` this draft started from. */
  savedCrestKey: string;
  /** Local blob/URL for a crest picked this session, for an instant preview. */
  crestPreviewUrl: string | null;
  /** A curated ground (a pride flag id), or null for none. */
  backgroundPreset: string | null;
  /** The uploaded ground, same URL-then-key shape as `crestKey`. */
  backgroundKey: string;
  savedBackgroundKey: string;
  backgroundPreviewUrl: string | null;
  /** Whether these cards carry the holder's photo. */
  allowsMemberPhoto: boolean;
  /** How those photos are printed. Kept in the draft even while photos are
   *  off, so switching them back on restores the style the owner chose
   *  rather than silently resetting it to colour. */
  photoStyle: CardPhotoStyle;
}

function draftFrom(program: CardProgramDTO | null): CardDesignerDraft {
  const savedCrestKey = program?.crestUrl ?? "";
  const savedBackgroundKey = program?.backgroundUrl ?? "";
  return {
    skin: program?.skin ?? "plum",
    accentToken: program?.accentToken ?? "accent",
    cardName: program?.cardName ?? "",
    validityMonths: program?.validityMonths ?? null,
    crestKey: savedCrestKey,
    savedCrestKey,
    crestPreviewUrl: null,
    backgroundPreset: program?.backgroundPreset ?? null,
    backgroundKey: savedBackgroundKey,
    savedBackgroundKey,
    backgroundPreviewUrl: null,
    allowsMemberPhoto: program?.allowsMemberPhoto ?? false,
    photoStyle: program?.photoStyle ?? "color",
  };
}

function isSameDraft(a: CardDesignerDraft, b: CardDesignerDraft): boolean {
  return (
    a.skin === b.skin &&
    a.accentToken === b.accentToken &&
    a.cardName === b.cardName &&
    a.validityMonths === b.validityMonths &&
    a.crestKey === b.crestKey &&
    a.backgroundPreset === b.backgroundPreset &&
    a.backgroundKey === b.backgroundKey &&
    a.allowsMemberPhoto === b.allowsMemberPhoto &&
    a.photoStyle === b.photoStyle
  );
}

/**
 * The card designer's in-progress design, plus whether it still matches what
 * is saved.
 *
 * Two things this owns that plain `useState(program?.x)` did not. First,
 * `isDirty`, so closing the dialog can ask before throwing an unsaved design
 * away. Second, a rebase: the programme arrives from a query, so a designer
 * opened before that query settles would otherwise stay stuck on the empty
 * defaults forever. An untouched draft adopts the programme when it lands; a
 * draft the owner has already edited is left alone, since silently
 * overwriting their work would be the worse failure.
 */
export function useCardDesignerDraft(program: CardProgramDTO | null): {
  draft: CardDesignerDraft;
  set: (patch: Partial<CardDesignerDraft>) => void;
  isDirty: boolean;
} {
  const [baseline, setBaseline] = useState(() => draftFrom(program));
  const [draft, setDraft] = useState(baseline);
  // Mirrors of the current values, read by the rebase effect below. Reading
  // state inside a `setState` updater would make the decision from a
  // double-invoked function; these keep the branch a plain, single read.
  // Written in an effect, never during render — and declared before the
  // rebase effect so they are already current when it runs.
  const draftRef = useRef(draft);
  const baselineRef = useRef(baseline);
  const lastProgramRef = useRef(program);
  useEffect(() => {
    draftRef.current = draft;
    baselineRef.current = baseline;
  });

  useEffect(() => {
    if (lastProgramRef.current === program) return;
    lastProgramRef.current = program;
    if (!isSameDraft(draftRef.current, baselineRef.current)) return;
    const next = draftFrom(program);
    setBaseline(next);
    setDraft(next);
  }, [program]);

  const set = useCallback((patch: Partial<CardDesignerDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  return { draft, set, isDirty: !isSameDraft(draft, baseline) };
}
