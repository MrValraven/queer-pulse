import { useCallback, useMemo, useState } from "react";
import {
  allSocialsValid,
  emailValid,
  emptyHours,
  witLine,
  DAYS,
  type DayHours,
  type ListingDraft,
  type OwnerBadge,
  type ListingPath,
  type PhotoKey,
} from "./listBusiness.data";

function blankDraft(): ListingDraft {
  return {
    path: "",
    verify: "",
    name: "",
    cats: [],
    hood: "",
    badge: "",
    evidence: "",
    price: "",
    blurb: "",
    tagline: "",
    whatItIs: [witLine(), witLine()],
    tags: [],
    goodFor: [],
    langs: [],
    address: "",
    geocoded: false,
    hours: emptyHours(),
    hoursNote: "",
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: "", d1: "", d2: "", vibe: "" },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "",
    ownerName: "",
    ownerRole: "",
    ownerBio: "",
    visibility: "public",
    linkToProfile: true,
    contactEmail: "",
    notify: ["live", "question"],
    consentOuting: false,
    consentGuide: false,
  };
}

/** All List-Your-Business wizard state + setters, shared by page and steps. */
export function useListingForm(initial?: ListingDraft) {
  const [draft, setDraft] = useState<ListingDraft>(initial ?? blankDraft());

  /** Patch one or more top-level fields. */
  const set = useCallback((patch: Partial<ListingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback((next?: ListingDraft) => {
    setDraft(next ?? blankDraft());
  }, []);

  const pickPath = useCallback((path: ListingPath) => {
    setDraft((d) => ({
      ...d,
      path,
      // sensible relationship default the member can change at step 4
      rel: d.rel || (path === "claim" ? "own" : "regular"),
      verify: path === "claim" ? d.verify || "email" : "",
    }));
  }, []);

  const toggleCat = useCallback((cat: string) => {
    setDraft((d) => {
      if (d.cats.includes(cat))
        return { ...d, cats: d.cats.filter((c) => c !== cat) };
      if (d.cats.length >= 2) return d; // cap at 2
      return { ...d, cats: [...d.cats, cat] };
    });
  }, []);

  const pickBadge = useCallback((badge: OwnerBadge) => {
    setDraft((d) => ({ ...d, badge }));
  }, []);

  const toggleIn = useCallback(
    (key: "goodFor" | "langs" | "notify", id: string) => {
      setDraft((d) => {
        const arr = d[key];
        return {
          ...d,
          [key]: arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id],
        };
      });
    },
    [],
  );

  /* what-it-is lines (2–4) */
  const setWit = useCallback((i: number, v: string) => {
    setDraft((d) => ({
      ...d,
      whatItIs: d.whatItIs.map((w, j) => (j === i ? { ...w, text: v } : w)),
    }));
  }, []);
  const addWit = useCallback(() => {
    setDraft((d) =>
      d.whatItIs.length >= 4
        ? d
        : { ...d, whatItIs: [...d.whatItIs, witLine()] },
    );
  }, []);
  const delWit = useCallback((i: number) => {
    setDraft((d) =>
      d.whatItIs.length <= 1
        ? { ...d, whatItIs: [witLine()] }
        : { ...d, whatItIs: d.whatItIs.filter((_, j) => j !== i) },
    );
  }, []);

  /* tags (≤6) */
  const addTag = useCallback((raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setDraft((d) =>
      d.tags.length >= 6 || d.tags.includes(t)
        ? d
        : { ...d, tags: [...d.tags, t] },
    );
  }, []);
  const removeTag = useCallback((t: string) => {
    setDraft((d) => ({ ...d, tags: d.tags.filter((x) => x !== t) }));
  }, []);

  /* hours */
  const setDay = useCallback((id: string, patch: Partial<DayHours>) => {
    setDraft((d) => ({
      ...d,
      hours: { ...d.hours, [id]: { ...d.hours[id]!, ...patch } },
    }));
  }, []);
  const copyMonToAll = useCallback(() => {
    setDraft((d) => {
      const mon = d.hours.Mon!;
      const hours: Record<string, DayHours> = {};
      DAYS.forEach((day) => {
        hours[day.id] = { ...mon };
      });
      return { ...d, hours };
    });
  }, []);
  const clearHours = useCallback(() => {
    setDraft((d) => {
      const hours: Record<string, DayHours> = {};
      DAYS.forEach((day) => {
        hours[day.id] = { ...d.hours[day.id]!, open: false };
      });
      return { ...d, hours };
    });
  }, []);

  const setSocial = useCallback(
    (key: keyof ListingDraft["social"], v: string) => {
      setDraft((d) => ({ ...d, social: { ...d.social, [key]: v } }));
    },
    [],
  );
  const setPhoto = useCallback((key: PhotoKey, v: string) => {
    setDraft((d) => ({ ...d, photos: { ...d.photos, [key]: v } }));
  }, []);
  const setAlt = useCallback((key: PhotoKey, v: string) => {
    setDraft((d) => ({ ...d, alt: { ...d.alt, [key]: v } }));
  }, []);

  /* ---- per-step "what's still needed" gating ---- */
  const missing = useMemo(() => {
    const s0: string[] = [];
    if (!draft.path) s0.push("how you know the place");
    if (draft.path === "claim" && !draft.verify) s0.push("a way to verify");

    const s1: string[] = [];
    if (!draft.name.trim()) s1.push("a name");
    if (!draft.cats.length) s1.push("a category");
    if (!draft.hood) s1.push("a neighbourhood");
    if (!draft.badge) s1.push("who runs it");
    if (!draft.price) s1.push("a price band");
    if (!draft.blurb.trim()) s1.push("the one-liner");

    const s2: string[] = [];
    if (!draft.tagline.trim()) s2.push("a tagline");
    if (!draft.whatItIs.some((w) => w.text.trim())) s2.push("what it is");

    const s3: string[] = [];
    if (!draft.address.trim()) s3.push("an address");
    if (!DAYS.some((d) => draft.hours[d.id]?.open)) s3.push("opening hours");
    if (!allSocialsValid(draft.social)) s3.push("valid contact links");

    const s4: string[] = [];
    if (!draft.rel) s4.push("your connection");
    if (!draft.ownerName.trim()) s4.push("your name");
    if (!draft.ownerRole.trim()) s4.push("your role");
    if (!emailValid(draft.contactEmail)) s4.push("a contact email");

    const s5: string[] = [];
    if (!draft.consentOuting || !draft.consentGuide)
      s5.push("both confirmations");

    const m: Record<number, string[]> = {
      0: s0,
      1: s1,
      2: s2,
      3: s3,
      4: s4,
      5: s5,
    };
    return m;
  }, [draft]);

  const canAdvance = useCallback(
    (step: number) => (missing[step]?.length ?? 0) === 0,
    [missing],
  );

  return {
    draft,
    set,
    reset,
    pickPath,
    toggleCat,
    pickBadge,
    toggleIn,
    setWit,
    addWit,
    delWit,
    addTag,
    removeTag,
    setDay,
    copyMonToAll,
    clearHours,
    setSocial,
    setPhoto,
    setAlt,
    missing,
    canAdvance,
  };
}

export type ListingForm = ReturnType<typeof useListingForm>;
