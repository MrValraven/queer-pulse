import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminCheckLine } from "./ui";
import { useAdminRoadmap, useAdminRoadmapMutations } from "./api/useAdminRoadmap";
import type { AdminRoadmapHeroStat } from "./adminRoadmap.data";
import styles from "./AdminRoadmapPage.module.css";

/** Controlled-form mirror of a hero-stat chip — `jade` always resolved to a
 *  boolean (the DTO's own `jade?: boolean` collapses to falsy-but-unset). */
interface HeroStatDraft {
  label: string;
  jade: boolean;
}

function toDraft(stat: AdminRoadmapHeroStat): HeroStatDraft {
  return { label: stat.label, jade: stat.jade ?? false };
}

/**
 * Editable list of the public roadmap page's hero-stat chips
 * (`/admin/roadmap`, Hero stats tab) — replaces Task 6's read-only
 * placeholder. Local draft state only; nothing is persisted until Save
 * calls `updateSettings`. The parent page only mounts this once
 * `useAdminRoadmap().loading` is false, so the draft's lazy initial state
 * (seeded once from the loaded `heroStats`) never races the fetch.
 */
export function AdminRoadmapHeroStats() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { heroStats, items } = useAdminRoadmap();
  const { updateSettings, pending } = useAdminRoadmapMutations();
  const [draft, setDraft] = useState<HeroStatDraft[]>(() => heroStats.map(toDraft));

  function updateRow(index: number, patch: Partial<HeroStatDraft>) {
    setDraft((current) =>
      current.map((stat, statIndex) =>
        statIndex === index ? { ...stat, ...patch } : stat,
      ),
    );
  }

  function removeRow(index: number) {
    setDraft((current) => current.filter((_, statIndex) => statIndex !== index));
  }

  function addRow() {
    setDraft((current) => [...current, { label: "", jade: false }]);
  }

  function moveRow(index: number, delta: 1 | -1) {
    setDraft((current) => {
      const targetIndex = index + delta;
      const moving = current[index];
      const swapping = current[targetIndex];
      if (!moving || !swapping) return current;
      const next = [...current];
      next[index] = swapping;
      next[targetIndex] = moving;
      return next;
    });
  }

  /** Convenience only — sets three labels from current item counts, then
   *  lets the admin edit/reorder/add to them like any other draft row
   *  before Save actually persists whatever ends up here. */
  function autoFillFromCounts() {
    const shippedCount = items.filter((item) => item.column === "shipped").length;
    const buildingCount = items.filter((item) => item.column === "building").length;
    const plannedCount = items.filter((item) => item.column === "planned").length;
    setDraft([
      {
        label: t("admin:roadmap.heroStats.autofill.shipped", { count: shippedCount }),
        jade: true,
      },
      {
        label: t("admin:roadmap.heroStats.autofill.building", { count: buildingCount }),
        jade: false,
      },
      {
        label: t("admin:roadmap.heroStats.autofill.planned", { count: plannedCount }),
        jade: false,
      },
    ]);
  }

  function handleSave() {
    const cleaned = draft
      .map((stat) => ({ label: stat.label.trim(), jade: stat.jade }))
      .filter((stat) => stat.label.length > 0);
    updateSettings(cleaned, {
      onSuccess: () => showToast(t("admin:roadmap.heroStats.toast.saved"), "success"),
      onError: (error) =>
        showToast(describeError("Couldn't save the hero stats", error), "error"),
    });
  }

  return (
    <div className={styles.heroStatsEditor}>
      <Button variant="ghost" size="md" onClick={autoFillFromCounts}>
        {t("admin:roadmap.heroStats.autofillCta")}
      </Button>

      {draft.length === 0 ? (
        <p className={styles.empty}>{t("admin:roadmap.heroStats.empty")}</p>
      ) : (
        <ul className={styles.heroStatsList}>
          {draft.map((stat, index) => (
            <li key={index} className={styles.heroStatsRow}>
              <div className={styles.itemReorder}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={index === 0}
                  onClick={() => moveRow(index, -1)}
                  aria-label={t("admin:roadmap.heroStats.moveUpAriaLabel")}
                >
                  <FiChevronUp size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={index === draft.length - 1}
                  onClick={() => moveRow(index, 1)}
                  aria-label={t("admin:roadmap.heroStats.moveDownAriaLabel")}
                >
                  <FiChevronDown size={16} />
                </Button>
              </div>

              <input
                className={styles.textInput}
                value={stat.label}
                onChange={(event) => updateRow(index, { label: event.target.value })}
                placeholder={t("admin:roadmap.heroStats.labelPlaceholder")}
                aria-label={t("admin:roadmap.heroStats.labelAriaLabel")}
              />

              <div className={styles.heroStatsJadeWrap}>
                <AdminCheckLine
                  checked={stat.jade}
                  onChange={(checked) => updateRow(index, { jade: checked })}
                  title={t("admin:roadmap.heroStats.jadeToggle.title")}
                />
              </div>

              <Button variant="ghost" size="md" onClick={() => removeRow(index)}>
                {t("admin:roadmap.heroStats.removeRowCta")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.heroStatsFooter}>
        <Button variant="ghost" size="md" onClick={addRow}>
          {t("admin:roadmap.heroStats.addCta")}
        </Button>
        <Button variant="primary" size="md" onClick={handleSave} disabled={pending}>
          {t("admin:common.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
