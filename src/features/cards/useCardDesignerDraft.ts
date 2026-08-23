import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CardPhotoStyle,
  CardProgramDTO,
  CardSkin,
  CardTextBackdrop,
  UpsertCardProgramBody,
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
  /** Whether staff may print physical copies of these cards. */
  allowsPrint: boolean;
  /** Whether these cards carry the holder's photo. */
  allowsMemberPhoto: boolean;
  /** How those photos are printed. Kept in the draft even while photos are
   *  off, so switching them back on restores the style the owner chose
   *  rather than silently resetting it to colour. */
  photoStyle: CardPhotoStyle;
  /** Whether these cards print each holder's pronouns beside their name. */
  allowsPronouns: boolean;
  /** Which legibility treatment the ground carries. Kept in the draft even
   *  while the card is on a flat skin, so an owner who tries a flag, switches
   *  back to a colour and returns to the flag finds their choice intact. */
  textBackdrop: CardTextBackdrop;
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
    allowsPrint: program?.allowsPrint ?? false,
    allowsMemberPhoto: program?.allowsMemberPhoto ?? false,
    photoStyle: program?.photoStyle ?? "color",
    allowsPronouns: program?.allowsPronouns ?? false,
    textBackdrop: program?.textBackdrop ?? "shade",
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
    a.allowsPrint === b.allowsPrint &&
    a.allowsMemberPhoto === b.allowsMemberPhoto &&
    a.photoStyle === b.photoStyle &&
    a.allowsPronouns === b.allowsPronouns &&
    a.textBackdrop === b.textBackdrop
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

/**
 * The draft, shaped into the body the upsert endpoint takes.
 *
 * Pure, and out of `CardDesignerModal` so that component stays under the
 * repo's 200-line limit. It is also the one place the backend's
 * absent-versus-null contract is expressed: an ABSENT field leaves the stored
 * value alone and an explicit null clears it, so a field sent unconditionally
 * would wipe a crest or a ground set from somewhere else.
 */
export function cardProgramUpsertBody(
  draft: CardDesignerDraft,
  program: CardProgramDTO | null,
  cardName: string,
): UpsertCardProgramBody {
  return {
    // Editing must not silently flip a paused programme back on. A programme
    // that does not exist yet defaults to enabled (there is nothing to
    // pause); an existing one keeps whatever state it had, and only
    // ModToolsCardSection's dedicated pause/resume toggle changes that.
    isEnabled: program?.isEnabled ?? true,
    skin: draft.skin,
    accentToken: draft.accentToken,
    cardName,
    validityMonths: draft.validityMonths,
    ...(draft.crestKey !== draft.savedCrestKey
      ? { crestMediaKey: draft.crestKey || null }
      : {}),
    // The ground, on the same contract. The backend clears whichever of the
    // two is not written, so a card always has exactly one ground.
    ...(draft.backgroundPreset !== (program?.backgroundPreset ?? null)
      ? { backgroundPreset: draft.backgroundPreset }
      : {}),
    ...(draft.backgroundKey !== draft.savedBackgroundKey
      ? { backgroundMediaKey: draft.backgroundKey || null }
      : {}),
    // Phase 1 has no profile badge to gate (spec §J is Phase 3); the DTO still
    // requires the field, so this keeps sending the value the backend already
    // stores rather than exposing a control for a feature that does not exist.
    allowsPublicBadge: program?.allowsPublicBadge ?? true,
    allowsPrint: draft.allowsPrint,
    allowsMemberPhoto: draft.allowsMemberPhoto,
    photoStyle: draft.photoStyle,
    allowsPronouns: draft.allowsPronouns,
    textBackdrop: draft.textBackdrop,
  };
}
