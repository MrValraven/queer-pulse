import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../i18n/useTranslation";
import { Button } from "./Button";
import { Modal } from "./Modal";
import styles from "./FeatureHelp.module.css";

/**
 * A small always-available "About this screen" info button. Placed inline next
 * to a screen's title, it opens a short explainer modal: what the screen is,
 * how to use it, and one concrete demo-mode example.
 *
 * Content lives in the `help` i18n namespace, keyed by `id` (e.g. "members.hub"):
 *   help:<id>.title  — the screen name
 *   help:<id>.intro  — 1–2 sentences on what it is
 *   help:<id>.use    — 2–4 how-to steps, joined with "\n" (rendered as a list)
 *   help:<id>.demo   — one concrete example line
 *
 * The Modal primitive already owns all a11y (scroll-lock, focus-trap, Escape,
 * initial focus, focus-restore). The concrete `help:<id>.demo` example line is
 * only shown in demo mode — in live mode the seeded sample data it refers to
 * isn't present, so the "In the demo" aside is hidden.
 *
 * Guard: if the id has no authored content yet (the title key resolves back to
 * its raw key), the button renders nothing rather than a broken affordance.
 *
 * `variant` controls the trigger's look: `"chip"` (default) is the small round
 * chip that sits inline beside a screen title; `"icon"` is a 44px borderless
 * icon button that matches sibling icon buttons in an action cluster (e.g. the
 * conversation header's action row).
 *
 * `action` adds a "read more" button to the footer for screens that own a
 * deeper explainer of their own (the communities hub's "How communities work",
 * say). It closes this modal in the same commit that fires the callback, so
 * the two dialogs swap rather than stack.
 */
export function FeatureHelp({
  id,
  variant = "chip",
  action,
}: {
  id: string;
  variant?: "chip" | "icon";
  action?: { label: string; onClick: () => void };
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [open, setOpen] = useState(false);

  const titleKey = `help:${id}.title`;
  const title = t(titleKey);
  // A fully-missing key resolves back to itself — treat that as "not authored".
  if (title === titleKey) {
    if (import.meta.env.DEV) {
      console.warn(`[FeatureHelp] no help content for id "${id}"`);
    }
    return null;
  }

  const steps = t(`help:${id}.use`)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <button
        type="button"
        className={variant === "icon" ? styles.iconTrigger : styles.trigger}
        onClick={() => setOpen(true)}
        aria-label={t("help:trigger.label", { screen: title })}
        aria-haspopup="dialog"
      >
        <FiInfo aria-hidden />
      </button>

      {open && (
        <Modal
          title={title}
          eyebrow={t("help:eyebrow")}
          onClose={() => setOpen(false)}
          footer={
            <>
              {action && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    action.onClick();
                  }}
                >
                  {action.label}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("help:got")}
              </Button>
            </>
          }
        >
          <p className={styles.intro}>{t(`help:${id}.intro`)}</p>

          {steps.length > 0 && (
            <>
              <h4 className={styles.useHeading}>{t("help:useHeading")}</h4>
              <ul className={styles.useList}>
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </>
          )}

          {demoMode && (
            <p className={styles.demo}>
              <span className={styles.demoLabel}>{t("help:demoLabel")}</span>
              {t(`help:${id}.demo`)}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
