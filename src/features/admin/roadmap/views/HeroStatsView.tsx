import { useEffect, useRef, useState } from "react";
import { FiShield } from "react-icons/fi";
import { FormField } from "../../../../shared/components/ui";
import { describeError } from "../../../../shared/api/errorMessage";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { RoadmapAdminHeroStatDTO } from "../../api/roadmapAdmin.types";
import styles from "./HeroStatsView.module.css";

/**
 * The public roadmap's hero-stat tiles (`/roadmap`), editable here: the
 * `value` and `note` of each stat save independently on blur via
 * `updateSettings`. `label` is fixed — it also doubles as each value
 * field's visible label, so there's no separate "what is this called"
 * control (plan Task C8: "edit 4 tiles (value + note)").
 *
 * `value` and `note` are two separate inputs in the same tile, each
 * committing on its own blur — so a fast value-then-note edit can fire two
 * `updateSettings` calls before the first one's refetch has updated the
 * `heroStats` prop. Building each call's next array from `heroStats`
 * directly would make the second call clobber the first (it'd still be
 * looking at the pre-edit array). `pendingStatsRef` is a synchronously
 * updated working copy every commit reads from *and* writes to, so
 * sequential edits compose regardless of how fast the network answers; the
 * effect below re-seeds it whenever a fresh `heroStats` arrives from the
 * server (a real refetch), so it never drifts once the round trip lands.
 */
export function HeroStatsView({
  heroStats,
}: {
  heroStats: RoadmapAdminHeroStatDTO[];
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateSettings } = useAdminRoadmapMutations();
  const pendingStatsRef = useRef(heroStats);

  useEffect(() => {
    pendingStatsRef.current = heroStats;
  }, [heroStats]);

  function commitTile(index: number, nextStat: RoadmapAdminHeroStatDTO) {
    const nextHeroStats = pendingStatsRef.current.map((stat, statIndex) =>
      statIndex === index ? nextStat : stat,
    );
    pendingStatsRef.current = nextHeroStats;
    updateSettings(nextHeroStats, {
      onSuccess: () => showToast(t("admin:roadmap.toasts.saved"), "success"),
      onError: (error) =>
        showToast(describeError("Couldn't save that stat", error), "error"),
    });
  }

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="admin:roadmap.heroStatsView.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.subtitle}>
            {t("admin:roadmap.heroStatsView.subtitle")}
          </p>
        </div>
        {/* Informational only — the tab switch itself lives in
            AdminRoadmapPage, which this task does not own, so this cannot
            actually jump to the Public preview tab. Styled as a plain note,
            not a control, so it doesn't read as a dead link. */}
        <span className={styles.previewHint}>
          {t("admin:roadmap.heroStatsView.previewLinkCta")}
        </span>
      </header>

      <div className={styles.grid}>
        {heroStats.map((stat, index) => (
          <HeroStatTile
            key={stat.label}
            stat={stat}
            onCommit={(nextStat) => commitTile(index, nextStat)}
          />
        ))}
      </div>

      <p className={styles.noGrowthTheatre}>
        <FiShield aria-hidden />
        {t("admin:roadmap.heroStatsView.noGrowthTheatre")}
      </p>
    </div>
  );
}

function HeroStatTile({
  stat,
  onCommit,
}: {
  stat: RoadmapAdminHeroStatDTO;
  onCommit: (nextStat: RoadmapAdminHeroStatDTO) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(stat.value ?? "");
  const [note, setNote] = useState(stat.note ?? "");

  function commitValue() {
    const trimmed = value.trim();
    if (trimmed === (stat.value ?? "")) return;
    onCommit({ ...stat, value: trimmed || undefined });
  }

  function commitNote() {
    const trimmed = note.trim();
    if (trimmed === (stat.note ?? "")) return;
    onCommit({ ...stat, note: trimmed || undefined });
  }

  return (
    <article className={styles.tile}>
      <FormField label={stat.label} className={styles.valueField}>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commitValue}
          className={styles.valueInput}
        />
      </FormField>
      <FormField label={t("admin:roadmap.heroStatsView.captionPlaceholder")}>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={commitNote}
        />
      </FormField>
    </article>
  );
}
