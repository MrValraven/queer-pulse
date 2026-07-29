import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import {
  EVENT_ARRIVAL_DATE,
  MAX_SEATS,
  OPEN_SEAT_INDICES,
  PROMO_RATE,
  VALID_PROMOS,
  normalizeSeatPick,
  type TierId,
} from "./checkout.data";
import {
  generateRef,
  makeMultibancoRef,
  validEmail,
} from "./checkout.validation";
import type {
  CheckoutState,
  CheckoutStep,
  Guest,
  StepDir,
  Visibility,
  PayMethod,
} from "./checkoutContext";

function emptyGuest(): Guest {
  return { gift: false, name: "", pron: "", dietary: "", email: "", note: "" };
}

function syncGuests(guests: Guest[], quantity: number): Guest[] {
  const next = guests.slice(0, Math.max(0, quantity - 1));
  while (next.length < quantity - 1) next.push(emptyGuest());
  return next;
}

/**
 * Every checkout action creator, extracted from `CheckoutProvider` so the
 * provider body stays under the per-component line limit. Owns no state — it
 * drives the provider's `state`/`setState`/`patch` and its own toast/i18n deps.
 */
export function useCheckoutActions(
  state: CheckoutState,
  setState: Dispatch<SetStateAction<CheckoutState>>,
  patch: (partial: Partial<CheckoutState>) => void,
) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const fmt = useFormat();

  const setTier = useCallback((id: TierId) => patch({ tier: id }), [patch]);

  const changeQty = useCallback(
    (delta: number) => {
      setState((current) => {
        const quantity = Math.max(
          1,
          Math.min(MAX_SEATS, current.qty + delta),
        );
        return {
          ...current,
          qty: quantity,
          guests: syncGuests(current.guests, quantity),
          seatPick: normalizeSeatPick(current.seatPick, quantity),
        };
      });
    },
    [setState],
  );

  const toggleGuest = useCallback(
    () => patch({ isGuest: !state.isGuest }),
    [patch, state.isGuest],
  );

  const applyPromo = useCallback(
    (code: string): "ok" | "invalid" | "empty" => {
      const value = code.trim().toUpperCase();
      if (!value) return "empty";
      if (VALID_PROMOS.includes(value)) {
        patch({ promo: value });
        showToast(
          t("gatherings:checkout.promo.appliedToast", {
            percent: fmt.number(PROMO_RATE, { style: "percent" }),
          }),
          "success",
        );
        return "ok";
      }
      return "invalid";
    },
    [patch, showToast, t, fmt],
  );

  const removePromo = useCallback(() => patch({ promo: null }), [patch]);

  const setVisibility = useCallback(
    (visibility: Visibility) => {
      patch({ visibility });
      showToast(
        t(
          visibility === "private"
            ? "gatherings:checkout.summary.visibilityPrivateToast"
            : "gatherings:checkout.summary.visibilityPublicToast",
        ),
        "info",
      );
    },
    [patch, showToast, t],
  );

  const pickSeat = useCallback(
    (seatIndex: number) => {
      setState((current) => {
        if (!OPEN_SEAT_INDICES.includes(seatIndex)) return current;
        const seats = normalizeSeatPick(current.seatPick, current.qty);
        if (seats.includes(seatIndex)) return current; // already the party's — no-op
        // You take the chosen setting; any guest keeps their seat.
        const next = [seatIndex, ...seats.slice(1)];
        return { ...current, seatPick: next };
      });
    },
    [setState],
  );

  const setMethod = useCallback(
    (method: PayMethod) => {
      setState((current) => ({
        ...current,
        method,
        mbRef:
          method === "multibanco" && !current.mbRef
            ? makeMultibancoRef()
            : current.mbRef,
      }));
    },
    [setState],
  );

  const selectSaved = useCallback(() => {
    setState((current) =>
      current.savedCardRemoved ? current : { ...current, usingSaved: true },
    );
  }, [setState]);

  const selectNewCard = useCallback(
    () => patch({ usingSaved: false }),
    [patch],
  );

  const removeSavedCard = useCallback(() => {
    patch({ savedCardRemoved: true, usingSaved: false });
    showToast(t("gatherings:checkout.card.removedToast"), "info");
  }, [patch, showToast, t]);

  const setCoc = useCallback(
    (agreed: boolean) => patch({ cocAgreed: agreed }),
    [patch],
  );

  const toggleReminder = useCallback(
    (channel: "email" | "sms" | "none") => {
      setState((current) => {
        if (channel === "none")
          return { ...current, reminders: { email: false, sms: false } };
        return {
          ...current,
          reminders: { ...current.reminders, [channel]: !current.reminders[channel] },
        };
      });
    },
    [setState],
  );

  const updateGuest = useCallback(
    (index: number, field: keyof Guest, value: string | boolean) => {
      setState((current) => {
        const guests = current.guests.map((guest, guestIndex) =>
          guestIndex === index ? { ...guest, [field]: value } : guest,
        );
        return { ...current, guests };
      });
    },
    [setState],
  );

  const goStep = useCallback(
    (step: CheckoutStep, dir: StepDir = "forward") => {
      setState((current) =>
        step === current.step ? current : { ...current, step, dir },
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setState],
  );

  const tryGoStep2 = useCallback((): boolean => {
    if (state.isGuest && !validEmail(state.guestEmail.trim())) {
      showToast(t("gatherings:checkout.validation.guestEmailRequired"), "error");
      return false;
    }
    setState((current) => ({
      ...current,
      reachedStep2: true,
      step: 2,
      dir: "forward",
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [state.isGuest, state.guestEmail, showToast, t, setState]);

  const confirmPayment = useCallback(() => {
    setState((current) => ({
      ...current,
      paid: true,
      ref: generateRef(),
      step: 3,
      dir: "forward",
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(
      t("gatherings:checkout.payment.confirmedToast", {
        date: fmt.date(EVENT_ARRIVAL_DATE, { day: "numeric", month: "long" }),
      }),
      "success",
    );
  }, [showToast, t, fmt, setState]);

  const dismissFirstTimer = useCallback(
    () => patch({ firstTimerDismissed: true }),
    [patch],
  );

  // Each action above is already individually `useCallback`'d against stable
  // deps (`patch`/`setState` are stable; `showToast`/`t`/`fmt` come from their
  // own providers). Without this, the object literal returned here would be
  // fresh on every render regardless, defeating the provider's `value` memo
  // below it (see CheckoutProvider.tsx) and re-rendering all 24 consumers.
  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  );
}
