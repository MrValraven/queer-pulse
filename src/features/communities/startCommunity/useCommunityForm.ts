import { useCallback, useMemo, useState } from "react";
import { currentUser } from "../../members/data/members";
import {
  INVITE_CANDIDATES,
  RULE_PRESETS,
  type CommunityDraft,
  type Steward,
  type TintKey,
} from "./startCommunity.data";

/** The founder, always the first (locked) steward. */
export function ownerSteward(): Steward {
  return {
    key: "owner",
    name: `${currentUser.first} ${currentUser.last}`,
    initials: currentUser.initials,
    tint: (currentUser.tint as TintKey) ?? "plum",
    role: "owner",
  };
}

export function emptyDraft(): CommunityDraft {
  return {
    name: "",
    purpose: "",
    type: "",
    whoFor: "",
    accessTier: "",
    rosterVisible: true,
    stewards: [ownerSteward()],
    features: ["discussion"],
    rules: [...RULE_PRESETS],
    tint: "coral",
    tagline: "",
    invites: [],
    handle: "",
    consent: false,
  };
}

/** All Start-a-Community wizard state + setters, shared by page and panels. */
export function useCommunityForm(initial?: CommunityDraft) {
  const [draft, setDraft] = useState<CommunityDraft>(initial ?? emptyDraft());

  const set = useCallback((patch: Partial<CommunityDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback((next?: CommunityDraft) => {
    setDraft(next ?? emptyDraft());
  }, []);

  /* stewards (owner is locked) */
  const addSteward = useCallback((s: Steward) => {
    setDraft((d) =>
      d.stewards.some((x) => x.key === s.key)
        ? d
        : { ...d, stewards: [...d.stewards, s] },
    );
  }, []);
  const removeSteward = useCallback((key: string) => {
    setDraft((d) =>
      key === "owner"
        ? d
        : { ...d, stewards: d.stewards.filter((s) => s.key !== key) },
    );
  }, []);
  /* features (locked ones can't toggle off) */
  const toggleFeature = useCallback((id: string, locked?: boolean) => {
    if (locked) return;
    setDraft((d) => ({
      ...d,
      features: d.features.includes(id)
        ? d.features.filter((f) => f !== id)
        : [...d.features, id],
    }));
  }, []);

  /* covenant rules */
  const toggleRule = useCallback((rule: string) => {
    setDraft((d) => ({
      ...d,
      rules: d.rules.includes(rule)
        ? d.rules.filter((r) => r !== rule)
        : [...d.rules, rule],
    }));
  }, []);
  const addRule = useCallback((raw: string) => {
    const r = raw.trim();
    if (!r) return;
    setDraft((d) =>
      d.rules.includes(r) ? d : { ...d, rules: [...d.rules, r] },
    );
  }, []);

  /* invite seeds */
  const toggleInvite = useCallback((key: string) => {
    setDraft((d) => ({
      ...d,
      invites: d.invites.includes(key)
        ? d.invites.filter((i) => i !== key)
        : [...d.invites, key],
    }));
  }, []);

  const setTint = useCallback((tint: TintKey) => {
    setDraft((d) => ({ ...d, tint }));
  }, []);

  /* ---- per-step "what's still needed" gating ---- */
  const missing = useMemo(() => {
    const s: Record<number, string[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
    };
    // 1 · why
    if (!draft.name.trim()) s[1]!.push("a name");
    if (!draft.purpose.trim()) s[1]!.push("what it's for");
    if (!draft.type) s[1]!.push("a category");
    // 2 · who
    if (!draft.whoFor.trim()) s[2]!.push("who it's for");
    // 3 · safety
    if (!draft.accessTier) s[3]!.push("who can find it");
    // 5 · tone
    if (!draft.rules.length) s[5]!.push("at least one shared value");
    // 6 · feeling
    if (!draft.tagline.trim()) s[6]!.push("a tagline");
    // 8 · confirm
    if (!draft.handle.trim()) s[8]!.push("a handle");
    if (!draft.consent) s[8]!.push("your confirmation");
    return s;
  }, [draft]);

  const canAdvance = useCallback(
    (step: number) => (missing[step]?.length ?? 0) === 0,
    [missing],
  );

  return {
    draft,
    set,
    reset,
    addSteward,
    removeSteward,
    toggleFeature,
    toggleRule,
    addRule,
    toggleInvite,
    setTint,
    candidates: INVITE_CANDIDATES,
    missing,
    canAdvance,
  };
}

export type CommunityForm = ReturnType<typeof useCommunityForm>;
