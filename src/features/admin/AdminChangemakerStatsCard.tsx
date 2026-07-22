import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useDirectoryStats,
  useUpdateDirectoryStats,
} from "../community/api/useAdminChangemakers";
import styles from "./AdminChangemakersPage.module.css";

/**
 * Small form for the two hero stats that aren't computed from the directory
 * itself (`peopleHelped`, `activeCampaigns`). Demo mode's mutation no-ops per
 * `useUpdateDirectoryStats`, but the toast still confirms the (illustrative)
 * save so the flow feels complete.
 *
 * Pre-fills from `useDirectoryStats()` rather than starting blank — an admin
 * who opens the page and clicks Save without retyping both numbers must not
 * silently zero out the live values. The seed-then-draft ref guard mirrors
 * `AdminSettingsAccess.tsx`: each ref remembers the value last seeded into its
 * field, and the effect only overwrites the field if it still equals that
 * last-seeded value (or hasn't been seeded yet) — so it seeds once and never
 * clobbers whatever the admin is mid-typing.
 */
export function AdminChangemakerStatsCard() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading } = useDirectoryStats();
  const updateDirectoryStats = useUpdateDirectoryStats();
  const [peopleHelped, setPeopleHelped] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);

  const serverPeopleHelped = data?.peopleHelped ?? 0;
  const serverActiveCampaigns = data?.activeCampaigns ?? 0;
  const lastSeededPeopleHelped = useRef<number | null>(null);
  const lastSeededActiveCampaigns = useRef<number | null>(null);

  useEffect(() => {
    if (data === undefined) return;
    setPeopleHelped((current) =>
      lastSeededPeopleHelped.current === null ||
      current === lastSeededPeopleHelped.current
        ? serverPeopleHelped
        : current,
    );
    lastSeededPeopleHelped.current = serverPeopleHelped;
  }, [data, serverPeopleHelped]);

  useEffect(() => {
    if (data === undefined) return;
    setActiveCampaigns((current) =>
      lastSeededActiveCampaigns.current === null ||
      current === lastSeededActiveCampaigns.current
        ? serverActiveCampaigns
        : current,
    );
    lastSeededActiveCampaigns.current = serverActiveCampaigns;
  }, [data, serverActiveCampaigns]);

  function handleSave() {
    updateDirectoryStats.mutate(
      { peopleHelped, activeCampaigns },
      {
        onSuccess: () => {
          showToast(
            t("community:changemakers.admin.statsSavedToast"),
            "success",
          );
        },
      },
    );
  }

  return (
    <section className={styles.statsCard}>
      <h2 className={styles.statsTitle}>
        {t("community:changemakers.admin.statsTitle")}
      </h2>
      <p className={styles.statsHint}>
        {t("community:changemakers.admin.statsHint")}
      </p>
      <div className={styles.statsFields}>
        <label className={styles.statsField}>
          <span className={styles.fieldLabel}>
            {t("community:changemakers.admin.peopleHelpedLabel")}
          </span>
          <input
            type="number"
            min={0}
            className={styles.numberInput}
            value={peopleHelped}
            onChange={(event) => setPeopleHelped(Number(event.target.value))}
          />
        </label>
        <label className={styles.statsField}>
          <span className={styles.fieldLabel}>
            {t("community:changemakers.admin.activeCampaignsLabel")}
          </span>
          <input
            type="number"
            min={0}
            className={styles.numberInput}
            value={activeCampaigns}
            onChange={(event) =>
              setActiveCampaigns(Number(event.target.value))
            }
          />
        </label>
      </div>
      <div className={styles.statsSaveRow}>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isLoading || updateDirectoryStats.isPending}
        >
          {t("community:changemakers.admin.statsSaveCta")}
        </Button>
      </div>
    </section>
  );
}
