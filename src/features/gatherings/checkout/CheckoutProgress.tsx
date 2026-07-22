import { useCheckout } from "./checkoutContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Stepper, type StepperStep } from "../../../shared/components/ui";
import s from "./checkout.module.css";

const STEPS = [
  { n: 1, labelKey: "gatherings:checkout.progress.review" },
  { n: 2, labelKey: "gatherings:checkout.progress.payment" },
  { n: 3, labelKey: "gatherings:checkout.progress.confirm" },
] as const;

export function CheckoutProgress() {
  const { step, paid, goStep } = useCheckout();
  const { t } = useTranslation();

  const currentIndex = step - 1;
  const stepperSteps: StepperStep[] = STEPS.map((item) => ({
    key: item.labelKey,
    label: t(item.labelKey),
  }));

  return (
    <div className={s["co-progress"]}>
      <Stepper
        steps={stepperSteps}
        current={currentIndex}
        size="lg"
        marker="number"
        ariaLabel={t("gatherings:checkout.progress.ariaLabel")}
        className={s["cop-stepper"]}
        onStepClick={
          paid
            ? undefined
            : (index) => goStep((index + 1) as 1 | 2 | 3, "back")
        }
      />
    </div>
  );
}
