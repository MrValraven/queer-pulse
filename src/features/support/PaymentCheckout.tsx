import { useState } from "react";
import { FiChevronDown, FiLock, FiStar } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FREQS, TIER_LABEL_KEYS } from "./sustainer.pricing";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

type Method = "card" | "apple" | "paypal" | "sepa";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** The checkout half of the payment modal: order summary, payment method, and
 * a validated (simulated) submit that resolves to the success view. */
export function PaymentCheckout({
  store,
  onComplete,
}: {
  store: SustainerStore;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [method, setMethod] = useState<Method>("card");
  const [moreOpen, setMoreOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    num: "",
    exp: "",
    cvc: "",
    name: "",
    iban: "",
    acc: "",
    gift: "",
  });
  const [errs, setErrs] = useState<Set<string>>(new Set());

  const f = FREQS[store.freq];
  const total = store.baseAmount + (store.solid ? store.solidAmount : 0);
  const short = store.freq === "once" ? "" : (f.short ?? t(f.shortKey!));
  const set = (k: keyof typeof fields, v: string) =>
    setFields((prev) => ({ ...prev, [k]: v }));

  function validate(): boolean {
    const bad = new Set<string>();
    if (store.gift && !EMAIL_RE.test(fields.gift.trim())) bad.add("gift");
    if (method === "card") {
      if (fields.num.replace(/\s/g, "").length < 16) bad.add("num");
      if (!/^\d{2}\s\/\s\d{2}$/.test(fields.exp)) bad.add("exp");
      if (fields.cvc.length < 3) bad.add("cvc");
      if (!fields.name.trim()) bad.add("name");
    } else if (method === "sepa") {
      if (fields.iban.replace(/\s/g, "").length < 15) bad.add("iban");
      if (!fields.acc.trim()) bad.add("acc");
    }
    setErrs(bad);
    return bad.size === 0;
  }

  function submit() {
    if ((method === "card" || method === "sepa" || store.gift) && !validate()) {
      showToast(t("support:checkout.validationToast"), "error");
      return;
    }
    const delay = method === "card" || method === "sepa" ? 1300 : 700;
    setLoading(true);
    window.setTimeout(() => onComplete(), delay);
  }

  const err = (k: string) =>
    `${styles.payField} ${errs.has(k) ? styles.error : ""}`;
  const inv = (k: string) => (errs.has(k) ? (styles.invalid ?? "") : "");

  const tierNameLabel =
    store.selectedName === "Custom"
      ? t("support:recap.customName")
      : t(TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS]);

  return (
    <>
      <div className={styles.pcTier}>
        <div className={styles.pcTierMain}>
          <div>
            <div className={styles.pcTierName}>
              {store.gift
                ? store.selectedName === "Custom"
                  ? t("support:checkout.giftMembership")
                  : `${t(TIER_LABEL_KEYS[store.selectedName as keyof typeof TIER_LABEL_KEYS])}${t("support:modal.receipt.giftSuffix")}`
                : tierNameLabel}
            </div>
            <div className={styles.pcTierSub}>{t(f.subKey)}</div>
          </div>
          <div className={styles.pcTierPrice}>
            {store.money(store.baseAmount)}
            <small>{t(f.perKey)}</small>
          </div>
        </div>
        {store.solid && (
          <>
            <div className={styles.pcLine}>
              <span>{t("support:checkout.solidLine")}</span>
              <span>+ {store.money(store.solidAmount)}</span>
            </div>
            <div className={`${styles.pcLine} ${styles.total}`}>
              <span>{t("support:checkout.totalToday")}</span>
              <span>
                {store.money(total)}
                {short}
              </span>
            </div>
          </>
        )}
      </div>

      <div className={styles.pcImpact}>
        <FiStar size={15} aria-hidden />
        <span>{store.impactText()}</span>
      </div>

      {store.gift && (
        <div className={err("gift")}>
          <label htmlFor="giftEmail">
            {t("support:checkout.recipientEmailLabel")}
          </label>
          <input
            id="giftEmail"
            type="email"
            autoComplete="email"
            placeholder="them@example.com"
            className={inv("gift")}
            value={fields.gift}
            onChange={(e) => set("gift", e.target.value)}
          />
          <div className={styles.fieldErr}>
            {t("support:checkout.emailErr")}
          </div>
        </div>
      )}

      {method === "card" && (
        <CardFields fields={fields} set={set} err={err} inv={inv} />
      )}
      {method === "sepa" && (
        <div className={styles.pmPanel}>
          <div className={err("iban")}>
            <label htmlFor="iban">{t("support:checkout.ibanLabel")}</label>
            <input
              id="iban"
              placeholder="PT50 0002 0123 1234 5678 9015 4"
              className={inv("iban")}
              value={fields.iban}
              onChange={(e) => set("iban", e.target.value.toUpperCase())}
            />
            <div className={styles.fieldErr}>
              {t("support:checkout.ibanErr")}
            </div>
          </div>
          <div className={err("acc")}>
            <label htmlFor="acc">
              {t("support:checkout.accountHolderLabel")}
            </label>
            <input
              id="acc"
              placeholder="Sofia Rodrigues"
              className={inv("acc")}
              value={fields.acc}
              onChange={(e) => set("acc", e.target.value)}
            />
            <div className={styles.fieldErr}>
              {t("support:checkout.accountHolderErr")}
            </div>
          </div>
        </div>
      )}
      {method === "apple" && (
        <div className={styles.pmPanel}>
          <p className={styles.walletNote}>
            {t("support:checkout.applePayNote")}
          </p>
          <button
            type="button"
            className={`${styles.walletBtn} ${styles.walletApple}`}
            onClick={submit}
          >
            {t("support:checkout.applePayCta")}
          </button>
        </div>
      )}
      {method === "paypal" && (
        <div className={styles.pmPanel}>
          <p className={styles.walletNote}>
            {t("support:checkout.paypalNote")}
          </p>
          <button
            type="button"
            className={`${styles.walletBtn} ${styles.walletPaypal}`}
            onClick={submit}
          >
            {t("support:checkout.paypalCta")}
          </button>
        </div>
      )}

      <MethodSwitcher
        method={method}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((o) => !o)}
        onPick={(m) => {
          setMethod(m);
          setMoreOpen(false);
          setErrs(new Set());
        }}
      />

      {(method === "card" || method === "sepa") && (
        <Button
          variant="primary"
          className={styles.paySubmit}
          onClick={submit}
          disabled={loading}
        >
          {loading && <span className={styles.spinner} aria-hidden />}
          {t("support:checkout.startCta", {
            amount: store.money(total) + short,
          })}
        </Button>
      )}
      <div className={styles.payStripe}>
        <FiLock size={12} aria-hidden /> {t("support:checkout.stripeNote")}
      </div>
      <p className={styles.payFineprint}>{t("support:checkout.fineprint")}</p>
    </>
  );
}

/** Card number / expiry / CVC / name, with light input formatting. */
function CardFields({
  fields,
  set,
  err,
  inv,
}: {
  fields: { num: string; exp: string; cvc: string; name: string };
  set: (k: "num" | "exp" | "cvc" | "name", v: string) => void;
  err: (k: string) => string;
  inv: (k: string) => string;
}) {
  const { t } = useTranslation();
  const fmtCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };
  return (
    <div className={styles.pmPanel}>
      <div className={err("num")}>
        <label htmlFor="cardNum">{t("support:checkout.cardNumberLabel")}</label>
        <input
          id="cardNum"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          className={inv("num")}
          value={fields.num}
          onChange={(e) => set("num", fmtCard(e.target.value))}
        />
        <div className={styles.fieldErr}>
          {t("support:checkout.cardNumberErr")}
        </div>
      </div>
      <div className={styles.payGrid}>
        <div className={err("exp")}>
          <label htmlFor="cardExp">{t("support:checkout.expiryLabel")}</label>
          <input
            id="cardExp"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            className={inv("exp")}
            value={fields.exp}
            onChange={(e) => set("exp", fmtExp(e.target.value))}
          />
          <div className={styles.fieldErr}>MM / YY</div>
        </div>
        <div className={err("cvc")}>
          <label htmlFor="cardCvc">{t("support:checkout.cvcLabel")}</label>
          <input
            id="cardCvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="···"
            className={inv("cvc")}
            value={fields.cvc}
            onChange={(e) =>
              set("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
          <div className={styles.fieldErr}>{t("support:checkout.cvcErr")}</div>
        </div>
      </div>
      <div className={err("name")}>
        <label htmlFor="cardName">
          {t("support:checkout.nameOnCardLabel")}
        </label>
        <input
          id="cardName"
          autoComplete="cc-name"
          placeholder="Sofia Rodrigues"
          className={inv("name")}
          value={fields.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <div className={styles.fieldErr}>
          {t("support:checkout.nameOnCardErr")}
        </div>
      </div>
    </div>
  );
}

/** "More ways to pay" expander + the card/apple/paypal/sepa tab row. */
function MethodSwitcher({
  method,
  moreOpen,
  onToggleMore,
  onPick,
}: {
  method: Method;
  moreOpen: boolean;
  onToggleMore: () => void;
  onPick: (m: Method) => void;
}) {
  const { t } = useTranslation();
  const alts: { key: Method; labelKey: string }[] = [
    { key: "apple", labelKey: "support:checkout.method.applePay" },
    { key: "paypal", labelKey: "support:checkout.method.paypal" },
    { key: "sepa", labelKey: "support:checkout.method.sepa" },
  ];
  if (method !== "card") {
    return (
      <button
        type="button"
        className={styles.pmBack}
        onClick={() => onPick("card")}
      >
        {t("support:checkout.backToCard")}
      </button>
    );
  }
  return (
    <>
      <button
        type="button"
        className={`${styles.pmMoreToggle} ${moreOpen ? styles.open : ""}`}
        onClick={onToggleMore}
      >
        {t("support:checkout.moreWaysToPay")}{" "}
        <span className={styles.chev}>
          <FiChevronDown aria-hidden />
        </span>
      </button>
      {moreOpen && (
        <div className={styles.pmAlts}>
          {alts.map((a) => (
            <button
              key={a.key}
              type="button"
              className={styles.pmTab}
              onClick={() => onPick(a.key)}
            >
              {t(a.labelKey)}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
