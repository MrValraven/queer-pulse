import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import type { AuthUser } from "../../auth/api/auth.api";
import {
  RULE_PRESET_KEYS,
  type CommunityDraft,
  type Steward,
  type TintKey,
} from "./startCommunity.data";

/**
 * The founder, always the first (locked) steward — derived from the signed-in
 * member (demo mode → mock session, live mode → GET /auth/me), never a hardcoded
 * mock persona, so the roster shows whoever is actually creating the community.
 */
export function ownerStewardFrom(user: AuthUser | null): Steward {
  const firstName = user?.profile.firstName ?? "";
  const lastName = user?.profile.lastName ?? "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  return {
    key: "owner",
    name: `${firstName} ${lastName}`.trim(),
    initials,
    tint: "plum",
    role: "owner",
  };
}

export function emptyDraft(owner: Steward): CommunityDraft {
  return {
    name: "",
    purpose: "",
    type: "",
    whoFor: "",
    accessTier: "",
    rosterVisible: true,
    stewards: [owner],
    features: ["discussion"],
    rules: [...RULE_PRESET_KEYS],
    tint: "coral",
    tagline: "",
    invites: [],
    handle: "",
    consent: false,
  };
}

/** All Start-a-Community wizard state + setters, shared by page and panels. */
export function useCommunityForm(initial?: CommunityDraft) {
  const { user } = useAuth();
  const owner = useMemo(() => ownerStewardFrom(user), [user]);
  const [draft, setDraft] = useState<CommunityDraft>(
    initial ?? emptyDraft(owner),
  );

  // In live mode `user` resolves after GET /auth/me settles, so the owner
  // steward seeded at init may start as a placeholder; keep the locked owner
  // entry in sync once the real session (or a demo→live switch) lands.
  useEffect(() => {
    setDraft((d) => {
      const current = d.stewards.find((s) => s.key === "owner");
      if (
        current &&
        current.name === owner.name &&
        current.initials === owner.initials
      ) {
        return d;
      }
      return {
        ...d,
        stewards: d.stewards.map((s) => (s.key === "owner" ? owner : s)),
      };
    });
  }, [owner]);

  const set = useCallback((patch: Partial<CommunityDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback(
    (next?: CommunityDraft) => {
      setDraft(next ?? emptyDraft(owner));
    },
    [owner],
  );

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

  /* ---- per-step "what's still needed" gating ----
     Each entry is a catalog key (chrome, resolved by `t()` where the chips
     render — see `PanelActions` in `StartCommunityChrome.tsx`), not raw text,
     so a language switch never leaves stale English baked into form state. */
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
    if (!draft.name.trim()) s[1]!.push("communities:start.missing.name");
    if (!draft.purpose.trim()) s[1]!.push("communities:start.missing.purpose");
    if (!draft.type) s[1]!.push("communities:start.missing.category");
    // 2 · who
    if (!draft.whoFor.trim()) s[2]!.push("communities:start.missing.whoFor");
    // 3 · safety
    if (!draft.accessTier) s[3]!.push("communities:start.missing.access");
    // 5 · tone
    if (!draft.rules.length) s[5]!.push("communities:start.missing.rules");
    // 6 · feeling
    if (!draft.tagline.trim()) s[6]!.push("communities:start.missing.tagline");
    // 8 · confirm
    if (!draft.handle.trim()) s[8]!.push("communities:start.missing.handle");
    if (!draft.consent) s[8]!.push("communities:start.missing.consent");
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
    missing,
    canAdvance,
  };
}

export type CommunityForm = ReturnType<typeof useCommunityForm>;
