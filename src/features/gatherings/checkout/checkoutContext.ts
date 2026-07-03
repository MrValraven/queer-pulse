import { createContext, useContext } from "react";
import type { TierId } from "./checkout.data";

export type CheckoutStep = 1 | 2 | 3;
export type StepDir = "forward" | "back";
export type Visibility = "show" | "private";
export type PayMethod = "card" | "mbway" | "multibanco";

export interface Guest {
  gift: boolean;
  name: string;
  pron: string;
  dietary: string;
  email: string;
  note: string;
}

export interface Reminders {
  email: boolean;
  sms: boolean;
}

/** Serialisable slice persisted to localStorage. */
export interface CheckoutState {
  step: CheckoutStep;
  dir: StepDir;
  tier: TierId;
  qty: number;
  isGuest: boolean;
  guestEmail: string;
  dietary: string;
  access: string;
  visibility: Visibility;
  seatPick: number[];
  method: PayMethod;
  promo: string | null;
  usingSaved: boolean;
  savedCardRemoved: boolean;
  cocAgreed: boolean;
  reminders: Reminders;
  guests: Guest[];
  reachedStep2: boolean;
  paid: boolean;
  ref: string | null;
  mbRef: string | null;
  firstTimerDismissed: boolean;
}

export interface Pricing {
  unit: number;
  subtotal: number;
  memberDisc: number;
  promoDisc: number;
  total: number;
}

export interface CheckoutContextValue extends CheckoutState {
  pricing: Pricing;
  email: string;
  patch: (partial: Partial<CheckoutState>) => void;
  setTier: (id: TierId) => void;
  changeQty: (delta: number) => void;
  toggleGuest: () => void;
  applyPromo: (code: string) => "ok" | "invalid" | "empty";
  removePromo: () => void;
  setVisibility: (v: Visibility) => void;
  pickSeat: (seatIdx: number) => void;
  setMethod: (m: PayMethod) => void;
  selectSaved: () => void;
  selectNewCard: () => void;
  removeSavedCard: () => void;
  setCoc: (agreed: boolean) => void;
  toggleReminder: (k: "email" | "sms" | "none") => void;
  updateGuest: (i: number, field: keyof Guest, value: string | boolean) => void;
  goStep: (n: CheckoutStep, dir?: StepDir) => void;
  tryGoStep2: () => boolean;
  confirmPayment: () => void;
  dismissFirstTimer: () => void;
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}
