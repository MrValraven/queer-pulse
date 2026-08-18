import { useCallback, useMemo, useState } from "react";
import { useStepGate } from "../../../shared/hooks/useWizardForm";
import {
  allSocialsValid,
  anyDayOpen,
  defaultInterval,
  emailValid,
  emptyHours,
  hoursValid,
  witLine,
  ANCHOR,
  DAYS,
  PHOTO_KEYS,
  type DayHours,
  type HoursInterval,
  type ListingDraft,
  type MissingField,
  type OwnerBadge,
  type ListingPath,
  type PhotoKey,
} from "./listBusiness.data";

/** Fields we can safely pre-fill from the signed-in member's profile (item #3).
 *  Only applied when building a BLANK draft — never over an edit/resumed one. */
export interface ListingSeed {
  ownerName?: string;
  contactEmail?: string;
  ownerBio?: string;
}

function blankDraft(seed?: ListingSeed): ListingDraft {
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
    whatItIs: [witLine()],
    tags: [],
    goodFor: [],
    langs: [],
    online: false,
    address: "",
    geocoded: false,
    latitude: null,
    longitude: null,
    hours: emptyHours(),
    hoursNote: "",
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: "", d1: "", d2: "", vibe: "" },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "",
    ownerName: seed?.ownerName ?? "",
    ownerRole: "",
    ownerBio: seed?.ownerBio ?? "",
    visibility: "public",
    linkToProfile: true,
    contactEmail: seed?.contactEmail ?? "",
    notify: ["live", "question"],
    consentOuting: false,
    consentGuide: false,
  };
}

/** All List-Your-Business wizard state + setters, shared by page and steps. */
export function useListingForm(initial?: ListingDraft, seed?: ListingSeed) {
  const [draft, setDraft] = useState<ListingDraft>(
    () => initial ?? blankDraft(seed),
  );

  // Display-only preview values (blob for uploads, URL for pastes). Kept OUT of
  // `draft`/`ListingDraft` on purpose: `CreateListingDto = ListingDraft` and the
  // whole draft is POSTed, so anything in it would leak to the API. Every
  // display site renders `photoPreviews[key] || draft.photos[key]`.
  const [photoPreviews, setPhotoPreviews] = useState<Record<PhotoKey, string>>({
    wide: "",
    d1: "",
    d2: "",
    vibe: "",
  });

  const setPhotoPreview = useCallback((key: PhotoKey, value: string) => {
    setPhotoPreviews((previews) => ({ ...previews, [key]: value }));
  }, []);

  /** Patch one or more top-level fields. */
  const set = useCallback((patch: Partial<ListingDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const reset = useCallback(
    (next?: ListingDraft) => {
      setDraft(next ?? blankDraft(seed));
      setPhotoPreviews({ wide: "", d1: "", d2: "", vibe: "" });
    },
    [seed],
  );

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

  /* what-it-is lines (1–4) */
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

  /* hours — a day is closed, or open across one or two intervals (item #6) */
  const patchDay = (
    hours: Record<string, DayHours>,
    dayId: string,
    patch: Partial<DayHours>,
  ): Record<string, DayHours> => ({
    ...hours,
    [dayId]: { ...hours[dayId]!, ...patch },
  });

  /** Toggle a day open/closed. Opening a day with no intervals seeds one. */
  const setDayOpen = useCallback((dayId: string, open: boolean) => {
    setDraft((d) => {
      const current = d.hours[dayId]!;
      const intervals = current.intervals.length
        ? current.intervals
        : [defaultInterval()];
      return { ...d, hours: patchDay(d.hours, dayId, { open, intervals }) };
    });
  }, []);

  /** Patch one interval's `from`/`to` on a day. */
  const setInterval = useCallback(
    (dayId: string, index: number, patch: Partial<HoursInterval>) => {
      setDraft((d) => {
        const current = d.hours[dayId]!;
        const intervals = current.intervals.map((interval, position) =>
          position === index ? { ...interval, ...patch } : interval,
        );
        return { ...d, hours: patchDay(d.hours, dayId, { intervals }) };
      });
    },
    [],
  );

  /** Add a second interval to a day (max 2 — e.g. a lunch-break closure). */
  const addInterval = useCallback((dayId: string) => {
    setDraft((d) => {
      const current = d.hours[dayId]!;
      if (current.intervals.length >= 2) return d;
      const previous = current.intervals[current.intervals.length - 1];
      // Seed the second window to start where the first ended, so the common
      // "morning · evening" split needs minimal editing.
      const next: HoursInterval = { from: previous?.to ?? "19:00", to: "23:00" };
      return {
        ...d,
        hours: patchDay(d.hours, dayId, {
          open: true,
          intervals: [...current.intervals, next],
        }),
      };
    });
  }, []);

  /** Remove an interval from a day; a day always keeps at least one. */
  const removeInterval = useCallback((dayId: string, index: number) => {
    setDraft((d) => {
      const current = d.hours[dayId]!;
      if (current.intervals.length <= 1) return d;
      const intervals = current.intervals.filter(
        (_, position) => position !== index,
      );
      return { ...d, hours: patchDay(d.hours, dayId, { intervals }) };
    });
  }, []);

  const copyMonToAll = useCallback(() => {
    setDraft((d) => {
      const monday = d.hours.Mon!;
      const hours: Record<string, DayHours> = {};
      DAYS.forEach((day) => {
        // Deep-copy intervals so later edits to one day don't mutate another.
        hours[day.id] = {
          open: monday.open,
          intervals: monday.intervals.map((interval) => ({ ...interval })),
        };
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

  /* ---- per-step "what's still needed" gating ----
     Requirements branch on the chosen path (item #2). A CLAIM (you own/run the
     place) is held to the full bar. A SUGGEST (a regular recommending a place
     they don't run) only has to give what a stranger can honestly know — name,
     category, neighbourhood, where it is, and a one-line why — so the owner
     detail, hours, price, tagline and photos never block the submit. The
     outing/guide consents gate both paths regardless. */
  const missing = useMemo(() => {
    const isClaim = draft.path === "claim";

    /** A still-missing item + the DOM anchor its chip jumps to. Holds the
     * catalog key, not the resolved string, so the chip label follows the
     * active language without this hook needing `t`. */
    const add = (list: MissingField[], labelKey: string, anchor: string) =>
      list.push({ labelKey, anchor });

    const s0: MissingField[] = [];
    if (!draft.path)
      add(s0, "marketing:listBusiness.missing.path", ANCHOR.path);
    if (isClaim && !draft.verify)
      add(s0, "marketing:listBusiness.missing.verify", ANCHOR.verify);

    const s1: MissingField[] = [];
    if (!draft.name.trim())
      add(s1, "marketing:listBusiness.missing.name", ANCHOR.name);
    if (!draft.cats.length)
      add(s1, "marketing:listBusiness.missing.cats", ANCHOR.cats);
    // Neighbourhood is optional for an online-only business (no physical area).
    if (!draft.online && !draft.hood)
      add(s1, "marketing:listBusiness.missing.hood", ANCHOR.hood);
    if (isClaim && !draft.badge)
      add(s1, "marketing:listBusiness.missing.badge", ANCHOR.badge);
    if (isClaim && !draft.price)
      add(s1, "marketing:listBusiness.missing.price", ANCHOR.price);
    if (!draft.blurb.trim())
      add(s1, "marketing:listBusiness.missing.blurb", ANCHOR.blurb);

    const s2: MissingField[] = [];
    if (isClaim && !draft.tagline.trim())
      add(s2, "marketing:listBusiness.missing.tagline", ANCHOR.tagline);
    if (!draft.whatItIs.some((line) => line.text.trim()))
      add(s2, "marketing:listBusiness.missing.whatItIs", ANCHOR.whatItIs);

    const s3: MissingField[] = [];
    // An online-only business has no physical location, so neither an address
    // nor a resolved pin is required. Both paths still need them otherwise.
    if (!draft.online && !draft.address.trim())
      add(s3, "marketing:listBusiness.missing.address", ANCHOR.address);
    if (!draft.online && (draft.latitude === null || draft.longitude === null))
      add(s3, "marketing:listBusiness.missing.pin", ANCHOR.address);
    // An online-only business has no hours editor to fill in, so neither an
    // open day nor a well-formed interval is required.
    if (!draft.online && isClaim && !anyDayOpen(draft.hours))
      add(s3, "marketing:listBusiness.missing.hours", ANCHOR.hours);
    if (!draft.online && !hoursValid(draft.hours))
      add(s3, "marketing:listBusiness.missing.hoursInvalid", ANCHOR.hours);
    // Socials are optional; this only fires when a filled one is malformed, so
    // the chip reads "fix the format", not "add socials" (item #10).
    if (!allSocialsValid(draft.social))
      add(s3, "marketing:listBusiness.missing.socialFormat", ANCHOR.social);

    const s4: MissingField[] = [];
    if (isClaim && !draft.rel)
      add(s4, "marketing:listBusiness.missing.rel", ANCHOR.rel);
    if (isClaim && !draft.ownerName.trim())
      add(s4, "marketing:listBusiness.missing.ownerName", ANCHOR.ownerName);
    if (isClaim && !draft.ownerRole.trim())
      add(s4, "marketing:listBusiness.missing.ownerRole", ANCHOR.ownerRole);
    if (isClaim && !emailValid(draft.contactEmail))
      add(
        s4,
        "marketing:listBusiness.missing.contactEmail",
        ANCHOR.contactEmail,
      );
    // Accessibility: any photo that's present needs alt text, on both paths
    // (item #8). An empty slot never blocks.
    const photoNeedsAlt = PHOTO_KEYS.some(
      (key) => draft.photos[key].trim() && !draft.alt[key].trim(),
    );
    if (photoNeedsAlt)
      add(s4, "marketing:listBusiness.missing.alt", ANCHOR.photos);

    const s5: MissingField[] = [];
    if (!draft.consentOuting || !draft.consentGuide)
      add(s5, "marketing:listBusiness.missing.consent", ANCHOR.consent);

    const perStep: Record<number, MissingField[]> = {
      0: s0,
      1: s1,
      2: s2,
      3: s3,
      4: s4,
      5: s5,
    };
    return perStep;
  }, [draft]);

  const canAdvance = useStepGate(missing);

  return {
    draft,
    photoPreviews,
    setPhotoPreview,
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
    setDayOpen,
    setInterval,
    addInterval,
    removeInterval,
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
