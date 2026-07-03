import { useMemo, useState } from "react";
import { useLocalStorage } from "../../shared/hooks";
import {
  amountFor,
  CURRENCIES,
  eurMonthlyEquiv,
  FREQS,
  impactMsg,
  money,
  solidAdd,
  TIER_NAMES,
  type CurrencyCode,
  type FreqKey,
  type TierIndex,
} from "./sustainer.pricing";

export type SelType = "tier" | "custom";

/** The persisted supporter record that drives the member banner + recap. */
export interface Supporter {
  tier: string;
  price: string;
  per: string;
  billing: string;
}

const BASE_COUNT = 84;
export const SUPPORT_GOAL = 140;

function isSupporter(v: unknown): v is Supporter | null {
  return (
    v === null ||
    (typeof v === "object" && v !== null && "tier" in v && "billing" in v)
  );
}

/** The full interactive model for the Sustainer page, shared across its sections. */
export interface SustainerStore {
  cur: CurrencyCode;
  freq: FreqKey;
  selType: SelType;
  tier: TierIndex;
  custom: number | null;
  gift: boolean;
  solid: boolean;
  supporter: Supporter | null;
  count: number;
  goal: number;
  /** Selected base amount (before add-ons), in the active currency. */
  baseAmount: number;
  /** Display name of the current selection. */
  selectedName: string;
  /** The solidarity add-on amount in the active currency + frequency. */
  solidAmount: number;
  setFreq: (f: FreqKey) => void;
  setCurrency: (c: CurrencyCode) => void;
  selectTier: (i: TierIndex) => void;
  setCustom: (v: number | null) => void;
  toggleGift: () => void;
  toggleSolid: () => void;
  becomeSupporter: (s: Supporter) => void;
  cancelMembership: () => void;
  money: (v: number) => string;
  /** Impact framing string for the current selection. */
  impactText: () => string;
}

export function useSustainer(): SustainerStore {
  const [cur, setCur] = useState<CurrencyCode>("EUR");
  const [freq, setFreqState] = useState<FreqKey>("monthly");
  const [selType, setSelType] = useState<SelType>("tier");
  const [tier, setTier] = useState<TierIndex>(1);
  const [custom, setCustomState] = useState<number | null>(null);
  const [gift, setGift] = useState(false);
  const [solid, setSolid] = useState(false);
  const [supporter, setSupporter] = useLocalStorage<Supporter | null>(
    "qp_supporter",
    null,
    isSupporter,
  );

  const fmt = useMemo(() => (v: number) => money(cur, v), [cur]);

  const baseAmount =
    selType === "custom" && custom != null
      ? custom
      : amountFor(tier, cur, freq);
  const selectedName = selType === "custom" ? "Custom" : TIER_NAMES[tier];
  const solidAmount = solidAdd(cur, freq);
  const count = BASE_COUNT + (supporter ? 1 : 0);

  return {
    cur,
    freq,
    selType,
    tier,
    custom,
    gift,
    solid,
    supporter,
    count,
    goal: SUPPORT_GOAL,
    baseAmount,
    selectedName,
    solidAmount,
    money: fmt,
    setFreq: setFreqState,
    setCurrency: setCur,
    selectTier: (i) => {
      setSelType("tier");
      setTier(i);
      setCustomState(null);
    },
    setCustom: (v) => {
      if (v != null && v > 0) {
        setSelType("custom");
        setCustomState(Math.round(v));
      } else {
        setCustomState(null);
        setSelType("tier");
      }
    },
    toggleGift: () => setGift((g) => !g),
    toggleSolid: () => setSolid((s) => !s),
    becomeSupporter: (s) => setSupporter(s),
    cancelMembership: () => setSupporter(null),
    impactText: () => {
      const equiv = eurMonthlyEquiv(baseAmount, cur, freq);
      const short = FREQS[freq].short;
      const priceLabel = fmt(baseAmount) + short;
      return `${priceLabel} ${impactMsg(equiv)}`;
    },
  };
}

/** Convenience: currency symbol for the active currency. */
export function currencySymbol(cur: CurrencyCode): string {
  return CURRENCIES[cur].sym;
}
