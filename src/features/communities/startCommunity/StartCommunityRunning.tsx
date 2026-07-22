import { useState } from "react";
import {
  FiX,
  FiCalendar,
  FiGrid,
  FiUsers,
  FiFolder,
  FiMessageCircle,
  FiPlus,
} from "react-icons/fi";
import { Avatar, Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FEATURE_OPTIONS } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";
import { AddStewardModal } from "./AddStewardModal";
import { toStewardTint } from "./stewardCandidates";
import type { CohostCandidate } from "../../gatherings/manageCohosts.data";

const FEATURE_ICON: Record<string, typeof FiCalendar> = {
  discussion: FiMessageCircle,
  events: FiCalendar,
  rooms: FiGrid,
  roster: FiUsers,
  library: FiFolder,
};

/** Chapter 4 — Running: co-stewards and what the community can do. */
export function StepRunning({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, addSteward, removeSteward, toggleFeature } = form;
  const [pickerOpen, setPickerOpen] = useState(false);

  const excludeSlugs = draft.stewards
    .map((steward) => steward.slug)
    .filter((slug): slug is string => Boolean(slug));

  const pickSteward = (candidate: CohostCandidate) => {
    addSteward({
      key: candidate.slug,
      slug: candidate.slug,
      name: candidate.name,
      initials: candidate.initials,
      tint: toStewardTint(candidate.tint),
      src: candidate.photo,
      role: "mod",
    });
    setPickerOpen(false);
  };

  return (
    <div>
      <div className={styles.groupH}>
        {t("communities:start.running.stewardsHeading")}
      </div>
      <p className={styles.groupSub}>
        {t("communities:start.running.stewardsSub")}
      </p>

      {draft.stewards.map((s) => (
        <div key={s.key} className={styles.teamRow}>
          <Avatar src={s.src} initials={s.initials} tint={s.tint} size={32} />
          <span className={styles.trName}>{s.name}</span>
          <span
            className={[
              styles.trRole,
              s.role === "owner" ? styles.roleOwner : styles.roleMod,
            ].join(" ")}
          >
            {s.role === "owner"
              ? t("communities:start.running.ownerTag")
              : t("communities:start.running.coStewardTag")}
          </span>
          {s.role !== "owner" && (
            <button
              type="button"
              className={styles.trDel}
              onClick={() => removeSteward(s.key)}
              aria-label={t("communities:start.running.removeAria", {
                name: s.name,
              })}
            >
              <FiX size={17} aria-hidden />
            </button>
          )}
        </div>
      ))}

      <div className={styles.addRow}>
        <Button variant="ghost" onClick={() => setPickerOpen(true)}>
          <FiPlus size={15} aria-hidden />{" "}
          {t("communities:start.running.addCta")}
        </Button>
      </div>

      {pickerOpen && (
        <AddStewardModal
          excludeSlugs={excludeSlugs}
          onPick={pickSteward}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div className={styles.groupH}>
        {t("communities:start.running.insideHeading")}
      </div>
      <p className={styles.groupSub}>
        {t("communities:start.running.insideSub")}
      </p>
      <div className={styles.featGrid}>
        {FEATURE_OPTIONS.map((f) => {
          const Icon = FEATURE_ICON[f.id] ?? FiGrid;
          const on = draft.features.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={[
                styles.feat,
                on && styles.featOn,
                f.locked && styles.featLocked,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={on}
              disabled={f.locked}
              onClick={() => toggleFeature(f.id, f.locked)}
            >
              <span className={styles.ftIc}>
                <Icon size={16} aria-hidden />
              </span>
              <span className={styles.ftTxt}>
                <b>{t(f.labelKey)}</b>
                <span>{t(f.descKey)}</span>
              </span>
              <span className={styles.ftState}>
                {f.locked
                  ? t("communities:start.running.alwaysOn")
                  : on
                    ? t("communities:start.running.on")
                    : t("communities:start.running.off")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
