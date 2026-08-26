import { useCallback, useId, useState } from "react";
import { FiLock } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CHECKLIST_STEPS } from "./arrivingPage.data";
import { ArrivingCardLink } from "./ArrivingInfoCards";
import { MarketingSection } from "./MarketingSection";
import styles from "./ArrivingPage.module.css";

/** Versioned so the shape can change later without un-ticking silently. */
const STORAGE_KEY = "queerpulse.arriving.checklist.v1";

/**
 * Read the ticked steps back. Every access is guarded: private windows, a
 * browser set to block site data, and embedded webviews all throw on
 * `localStorage`, and a first-fortnight checklist must never be the reason a
 * marketing page fails to render.
 */
function readTicked(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeTicked(ticked: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ticked));
  } catch {
    // Storage is unavailable. The list still works for this visit.
  }
}

/**
 * The arrival checklist: the practical things worth doing in a first fortnight,
 * each pointing at a real destination.
 *
 * Ticks are kept in this browser only. Nothing is sent anywhere, there is no
 * account behind it and nothing observes what gets ticked, which is why it can
 * sit on a public page and still be useful before anyone has an invite.
 */
export function ArrivingChecklistSection() {
  const { t } = useTranslation();
  const fieldPrefix = useId();
  const [ticked, setTicked] = useState<string[]>(readTicked);

  const toggleStep = useCallback((stepId: string) => {
    setTicked((current) => {
      const next = current.includes(stepId)
        ? current.filter((value) => value !== stepId)
        : [...current, stepId];
      writeTicked(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTicked([]);
    writeTicked([]);
  }, []);

  const doneCount = CHECKLIST_STEPS.filter((step) =>
    ticked.includes(step.id),
  ).length;

  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.checklist.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.checklist.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.checklist.intro")}
    >
      <Reveal as="div" className={styles.checklist} delay={60}>
        <div className={styles.checklistHead}>
          <p className={styles.checklistProgress} aria-live="polite">
            {t("marketing:arriving.checklist.progress", {
              done: doneCount,
              total: CHECKLIST_STEPS.length,
            })}
          </p>
          {doneCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              {t("marketing:arriving.checklist.reset")}
            </Button>
          )}
        </div>

        <ul className={styles.checklistList}>
          {CHECKLIST_STEPS.map((step) => {
            const inputId = `${fieldPrefix}-${step.id}`;
            const isTicked = ticked.includes(step.id);
            return (
              <li
                className={`${styles.checkItem} ${isTicked ? styles.checkItemDone : ""}`}
                key={step.id}
              >
                <input
                  type="checkbox"
                  id={inputId}
                  className={styles.checkInput}
                  checked={isTicked}
                  onChange={() => toggleStep(step.id)}
                />
                <div className={styles.checkText}>
                  <label htmlFor={inputId} className={styles.checkTitle}>
                    {t(`marketing:arriving.checklist.steps.${step.id}.title`)}
                  </label>
                  <p className={styles.checkNote}>
                    {t(`marketing:arriving.checklist.steps.${step.id}.note`)}
                  </p>
                  {step.link && (
                    <ArrivingCardLink
                      link={step.link}
                      label={t(
                        `marketing:arriving.checklist.steps.${step.id}.linkLabel`,
                      )}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className={styles.checklistPrivacy}>
          <FiLock aria-hidden />
          {t("marketing:arriving.checklist.storedHere")}
        </p>
      </Reveal>
    </MarketingSection>
  );
}
