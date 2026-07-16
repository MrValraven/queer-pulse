import { FiCheck } from "react-icons/fi";
import { useCheckout } from "./checkoutContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "./cx";
import s from "./checkout.module.css";

const STEPS = [
  { n: 1, labelKey: "gatherings:checkout.progress.review" },
  { n: 2, labelKey: "gatherings:checkout.progress.payment" },
  { n: 3, labelKey: "gatherings:checkout.progress.confirm" },
] as const;

export function CheckoutProgress() {
  const { step, paid, goStep } = useCheckout();
  const { t } = useTranslation();

  return (
    <nav
      className={s["co-progress"]}
      aria-label={t("gatherings:checkout.progress.ariaLabel")}
    >
      {STEPS.map((item, idx) => {
        const status = item.n < step ? "done" : item.n === step ? "active" : "";
        const clickable = item.n < step && !paid;
        return (
          <div key={item.n} style={{ display: "contents" }}>
            {idx > 0 && (
              <div className={cx(s["cop-line"], item.n - 1 < step && s.done)} />
            )}
            <div className={s["cop-step"]}>
              <button
                className={cx(s["cop-btn"], clickable && s.clickable)}
                type="button"
                disabled={!clickable && item.n !== step}
                aria-current={item.n === step ? "step" : undefined}
                onClick={() => clickable && goStep(item.n as 1 | 2 | 3, "back")}
              >
                <span className={cx(s["cop-dot"], status && s[status])}>
                  {status === "done" ? <FiCheck /> : item.n}
                </span>
                <span className={cx(s["cop-label"], status && s[status])}>
                  {t(item.labelKey)}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
