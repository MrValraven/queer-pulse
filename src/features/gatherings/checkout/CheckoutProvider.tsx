import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MEMBER_RATE,
  PROMO_RATE,
  STORE_KEY,
  TIER_MAP,
  normalizeSeatPick,
  type TierId,
} from "./checkout.data";
import {
  CheckoutContext,
  type CheckoutState,
  type Pricing,
} from "./checkoutContext";
import { useCheckoutActions } from "./useCheckoutActions";

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

/** Pure line-item math, pulled out of the component so the provider's own
 * body stays under the per-component line limit. */
function computePricing(
  tier: TierId,
  quantity: number,
  isGuest: boolean,
  promo: string | null,
): Pricing {
  const unit = TIER_MAP[tier].price;
  const subtotal = unit * quantity;
  const memberDisc = isGuest ? 0 : subtotal * MEMBER_RATE;
  const afterMember = subtotal - memberDisc;
  const promoDisc = promo ? afterMember * PROMO_RATE : 0;
  return {
    unit,
    subtotal,
    memberDisc,
    promoDisc,
    total: afterMember - promoDisc,
  };
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const patch = useCallback((partial: Partial<CheckoutState>) => {
    setState((current) => ({ ...current, ...partial }));
  }, []);

  const pricing = useMemo<Pricing>(
    () => computePricing(state.tier, state.qty, state.isGuest, state.promo),
    [state.tier, state.qty, state.isGuest, state.promo],
  );

  const email = state.isGuest ? state.guestEmail.trim() : MEMBER_EMAIL;

  const actions = useCheckoutActions(state, setState, patch);

  // Stabilize the context value so its 24 consumers only re-render when a
  // field they actually read changes, not on every provider re-render:
  // `state` changes on every real update, but `pricing`/`email`/`patch`/
  // `actions` are each already memoized/stable, so a parent-driven re-render
  // with none of these changing now produces the same `value` reference.
  const value = useMemo(
    () => ({
      ...state,
      pricing,
      email,
      patch,
      ...actions,
    }),
    [state, pricing, email, patch, actions],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}
