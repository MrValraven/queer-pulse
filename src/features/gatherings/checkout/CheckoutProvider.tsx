import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  MAX_SEATS,
  MEMBER_RATE,
  OPEN_SEAT_INDICES,
  PROMO_RATE,
  STORE_KEY,
  TIER_MAP,
  VALID_PROMOS,
  normalizeSeatPick,
  type TierId,
} from "./checkout.data";
import {
  generateRef,
  makeMultibancoRef,
  validEmail,
} from "./checkout.validation";
import {
  CheckoutContext,
  type CheckoutState,
  type CheckoutStep,
  type Guest,
  type Pricing,
  type StepDir,
  type Visibility,
  type PayMethod,
} from "./checkoutContext";

const MEMBER_EMAIL = "alex.rivera@example.com";

const INITIAL: CheckoutState = {
  step: 1,
  dir: "forward",
  tier: "standard",
  qty: 1,
  isGuest: false,
  guestEmail: "",
  dietary: "",
  access: "",
  visibility: "show",
  seatPick: [],
  method: "card",
  promo: null,
  usingSaved: true,
  savedCardRemoved: false,
  cocAgreed: false,
  reminders: { email: true, sms: false },
  guests: [],
  reachedStep2: false,
  paid: false,
  ref: null,
  mbRef: null,
  firstTimerDismissed: false,
};

function emptyGuest(): Guest {
  return { gift: false, name: "", pron: "", dietary: "", email: "", note: "" };
}

function syncGuests(guests: Guest[], qty: number): Guest[] {
  const next = guests.slice(0, Math.max(0, qty - 1));
  while (next.length < qty - 1) next.push(emptyGuest());
  return next;
}

function loadState(): CheckoutState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<CheckoutState>;
      // Never restore a completed purchase — start fresh after confirmation.
      if (saved && !saved.paid) {
        const merged = { ...INITIAL, ...saved };
        return {
          ...merged,
          seatPick: normalizeSeatPick(merged.seatPick, merged.qty),
        };
      }
    }
  } catch {
    /* ignore malformed/unavailable storage */
  }
  return { ...INITIAL, seatPick: normalizeSeatPick([], INITIAL.qty) };
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [state, setState] = useState<CheckoutState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const patch = useCallback((partial: Partial<CheckoutState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  const pricing = useMemo<Pricing>(() => {
    const unit = TIER_MAP[state.tier].price;
    const subtotal = unit * state.qty;
    const memberDisc = state.isGuest ? 0 : subtotal * MEMBER_RATE;
    const afterMember = subtotal - memberDisc;
    const promoDisc = state.promo ? afterMember * PROMO_RATE : 0;
    return {
      unit,
      subtotal,
      memberDisc,
      promoDisc,
      total: afterMember - promoDisc,
    };
  }, [state.tier, state.qty, state.isGuest, state.promo]);

  const email = state.isGuest ? state.guestEmail.trim() : MEMBER_EMAIL;

  const setTier = useCallback((id: TierId) => patch({ tier: id }), [patch]);

  const changeQty = useCallback((delta: number) => {
    setState((s) => {
      const qty = Math.max(1, Math.min(MAX_SEATS, s.qty + delta));
      return {
        ...s,
        qty,
        guests: syncGuests(s.guests, qty),
        seatPick: normalizeSeatPick(s.seatPick, qty),
      };
    });
  }, []);

  const toggleGuest = useCallback(
    () => patch({ isGuest: !state.isGuest }),
    [patch, state.isGuest],
  );

  const applyPromo = useCallback(
    (code: string): "ok" | "invalid" | "empty" => {
      const val = code.trim().toUpperCase();
      if (!val) return "empty";
      if (VALID_PROMOS.includes(val)) {
        patch({ promo: val });
        showToast("Code applied — extra 5% off.", "success");
        return "ok";
      }
      return "invalid";
    },
    [patch, showToast],
  );

  const removePromo = useCallback(() => patch({ promo: null }), [patch]);

  const setVisibility = useCallback(
    (v: Visibility) => {
      patch({ visibility: v });
      showToast(
        v === "private"
          ? "You'll attend privately — hidden from the guest list."
          : "You'll appear on the guest list.",
        "info",
      );
    },
    [patch, showToast],
  );

  const pickSeat = useCallback((seatIdx: number) => {
    setState((s) => {
      if (!OPEN_SEAT_INDICES.includes(seatIdx)) return s;
      const cur = normalizeSeatPick(s.seatPick, s.qty);
      if (cur.includes(seatIdx)) return s; // already the party's — no-op
      // You take the chosen setting; any guest keeps their seat.
      const next = [seatIdx, ...cur.slice(1)];
      return { ...s, seatPick: next };
    });
  }, []);

  const setMethod = useCallback((m: PayMethod) => {
    setState((s) => ({
      ...s,
      method: m,
      mbRef: m === "multibanco" && !s.mbRef ? makeMultibancoRef() : s.mbRef,
    }));
  }, []);

  const selectSaved = useCallback(() => {
    setState((s) => (s.savedCardRemoved ? s : { ...s, usingSaved: true }));
  }, []);
  const selectNewCard = useCallback(
    () => patch({ usingSaved: false }),
    [patch],
  );
  const removeSavedCard = useCallback(() => {
    patch({ savedCardRemoved: true, usingSaved: false });
    showToast("Saved card removed.", "info");
  }, [patch, showToast]);

  const setCoc = useCallback(
    (agreed: boolean) => patch({ cocAgreed: agreed }),
    [patch],
  );

  const toggleReminder = useCallback((k: "email" | "sms" | "none") => {
    setState((s) => {
      if (k === "none")
        return { ...s, reminders: { email: false, sms: false } };
      return { ...s, reminders: { ...s.reminders, [k]: !s.reminders[k] } };
    });
  }, []);

  const updateGuest = useCallback(
    (i: number, field: keyof Guest, value: string | boolean) => {
      setState((s) => {
        const guests = s.guests.map((g, idx) =>
          idx === i ? { ...g, [field]: value } : g,
        );
        return { ...s, guests };
      });
    },
    [],
  );

  const goStep = useCallback((n: CheckoutStep, dir: StepDir = "forward") => {
    setState((s) => (n === s.step ? s : { ...s, step: n, dir }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const tryGoStep2 = useCallback((): boolean => {
    if (state.isGuest && !validEmail(state.guestEmail.trim())) {
      showToast("Add an email so we can send your ticket.", "error");
      return false;
    }
    setState((s) => ({ ...s, reachedStep2: true, step: 2, dir: "forward" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [state.isGuest, state.guestEmail, showToast]);

  const confirmPayment = useCallback(() => {
    setState((s) => ({
      ...s,
      paid: true,
      ref: generateRef(),
      step: 3,
      dir: "forward",
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Payment confirmed — see you on the 28th!", "success");
  }, [showToast]);

  const dismissFirstTimer = useCallback(
    () => patch({ firstTimerDismissed: true }),
    [patch],
  );

  const value = {
    ...state,
    pricing,
    email,
    patch,
    setTier,
    changeQty,
    toggleGuest,
    applyPromo,
    removePromo,
    setVisibility,
    pickSeat,
    setMethod,
    selectSaved,
    selectNewCard,
    removeSavedCard,
    setCoc,
    toggleReminder,
    updateGuest,
    goStep,
    tryGoStep2,
    confirmPayment,
    dismissFirstTimer,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
