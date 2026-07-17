import { useMemo, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DECLINE_CARD } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import {
  detectBrand,
  fmtCardNumber,
  fmtExpiry,
  fmtPhone,
  validCardNumber,
  validCvc,
  validExpiry,
  validMbway,
  validName,
  validPostal,
  type CardBrand,
} from "./checkout.validation";

export interface CardFields {
  num: string;
  exp: string;
  cvc: string;
  name: string;
  saveCard: boolean;
}

type ErrorKey = "num" | "exp" | "cvc" | "name" | "postal" | "phone";

export function usePaymentForm() {
  const {
    method,
    cocAgreed,
    usingSaved,
    savedCardRemoved,
    confirmPayment,
    selectNewCard,
  } = useCheckout();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [card, setCard] = useState<CardFields>({
    num: "",
    exp: "",
    cvc: "",
    name: "",
    saveCard: false,
  });
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("PT");
  const [phone, setPhone] = useState("");
  const [vatOpen, setVatOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, boolean>>>({});
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  const brand: CardBrand = detectBrand(card.num);
  const usingNewCard = !usingSaved || savedCardRemoved;

  function setErr(key: ErrorKey, bad: boolean) {
    setErrors((e) => ({ ...e, [key]: bad }));
  }

  // Card input handlers apply formatting + switch to the "new card" path.
  const onNum = (v: string) => {
    setCard((c) => ({ ...c, num: fmtCardNumber(v) }));
    selectNewCard();
  };
  const onExp = (v: string) => {
    setCard((c) => ({ ...c, exp: fmtExpiry(v) }));
    selectNewCard();
  };
  const onCvc = (v: string) => {
    setCard((c) => ({ ...c, cvc: v.replace(/\D/g, "").slice(0, 4) }));
    selectNewCard();
  };
  const onName = (v: string) => {
    setCard((c) => ({ ...c, name: v }));
    selectNewCard();
  };
  const onPhone = (v: string) => setPhone(fmtPhone(v));

  const canPay = useMemo(() => {
    if (!cocAgreed) return false;
    if (method === "mbway") return validMbway(phone);
    if (method === "multibanco") return true;
    if (!validPostal(postal)) return false;
    if (!usingNewCard) return true;
    return (
      validCardNumber(card.num) &&
      validExpiry(card.exp) &&
      validCvc(card.cvc) &&
      validName(card.name)
    );
  }, [cocAgreed, method, phone, postal, usingNewCard, card]);

  function validate(): boolean {
    if (!cocAgreed) {
      showToast(t("gatherings:checkout.validation.cocRequired"), "error");
      return false;
    }
    if (method === "mbway") {
      const ok = validMbway(phone);
      setErr("phone", !ok);
      return ok;
    }
    if (method === "multibanco") return true;

    let ok = true;
    if (!validPostal(postal)) {
      setErr("postal", true);
      ok = false;
    } else setErr("postal", false);

    if (usingNewCard) {
      const n = validCardNumber(card.num);
      setErr("num", !n);
      const e = validExpiry(card.exp);
      setErr("exp", !e);
      const c = validCvc(card.cvc);
      setErr("cvc", !c);
      const nm = validName(card.name);
      setErr("name", !nm);
      ok = ok && n && e && c && nm;
    }
    return ok;
  }

  function run(declineCheck: string | null) {
    setPayError("");
    setProcessing(true);
    setTimeout(() => {
      const declined = declineCheck?.replace(/\s/g, "") === DECLINE_CARD;
      setProcessing(false);
      if (declined) {
        setPayError(t("gatherings:checkout.validation.declinedError"));
        showToast(
          t("gatherings:checkout.validation.paymentDeclinedToast"),
          "error",
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      confirmPayment();
    }, 1800);
  }

  function submit() {
    if (!validate()) {
      if (cocAgreed) {
        setPayError(t("gatherings:checkout.validation.fieldsError"));
      }
      return;
    }
    if (method === "mbway") return run(null);
    if (method === "multibanco") return run(null);
    run(usingNewCard ? card.num : null);
  }

  function express(label: string) {
    if (!cocAgreed) {
      showToast(t("gatherings:checkout.validation.cocRequired"), "error");
      return;
    }
    showToast(
      t("gatherings:checkout.express.confirmingToast", { label }),
      "info",
      1600,
    );
    run(null);
  }

  return {
    card,
    postal,
    country,
    phone,
    vatOpen,
    errors,
    brand,
    processing,
    payError,
    usingNewCard,
    canPay,
    setPostal,
    setCountry,
    setVatOpen,
    setSaveCard: (v: boolean) => setCard((c) => ({ ...c, saveCard: v })),
    onNum,
    onExp,
    onCvc,
    onName,
    onPhone,
    setErr,
    submit,
    express,
  };
}

export type PaymentForm = ReturnType<typeof usePaymentForm>;
