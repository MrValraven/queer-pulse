import {
  FiLock,
  FiUnlock,
  FiUserCheck,
  FiKey,
  FiCompass,
  FiShield,
} from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ACCESS_OPTIONS } from "./startCommunity.data";
import type { AccessTier } from "../membership.types";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const ICONS = {
  public: FiUnlock,
  request: FiUserCheck,
  invite: FiKey,
  private: FiLock,
} as const;

/** Chapter 3 — Safety: who can find the space, and how they get in. */
export function StepSafety({ form }: { form: CommunityForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const pick = (tier: AccessTier) => set({ accessTier: tier });

  return (
    <div>
      <div className={styles.accLead}>
        <FiCompass size={22} aria-hidden />
        <p>
          <Translation
            i18nKey="communities:start.safety.lead"
            components={{ strong: <b /> }}
          />
        </p>
      </div>

      <div className={styles.accStack}>
        {ACCESS_OPTIONS.map((opt) => {
          const Icon = ICONS[opt.tier];
          const selected = draft.accessTier === opt.tier;
          return (
            <button
              key={opt.tier}
              type="button"
              className={[
                styles.accCard,
                opt.private && styles.accPrivate,
                selected && styles.accCardSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={selected}
              onClick={() => pick(opt.tier)}
            >
              <span className={styles.accIc}>
                <Icon size={21} aria-hidden />
              </span>
              <span className={styles.accBody}>
                <span className={styles.accTop}>
                  <span className={styles.accName}>{t(opt.nameKey)}</span>
                  {opt.private && (
                    <span className={styles.accFlag}>
                      {t("communities:start.safety.safestFlag")}
                    </span>
                  )}
                </span>
                <span className={styles.accLines}>
                  <span className={styles.accLine}>
                    <span className={styles.accKey}>
                      {t("communities:start.safety.findLabel")}
                    </span>
                    {t(opt.findKey)}
                  </span>
                  <span className={styles.accLine}>
                    <span className={styles.accKey}>
                      {t("communities:start.safety.joinLabel")}
                    </span>
                    {t(opt.joinKey)}
                  </span>
                </span>
                <span className={styles.accNote}>{t(opt.noteKey)}</span>
              </span>
              <span className={styles.accRadio} aria-hidden />
            </button>
          );
        })}
      </div>

      {draft.accessTier === "private" && (
        <div className={styles.privReassure}>
          <FiShield size={20} aria-hidden />
          <p>{t("communities:start.safety.privateReassure")}</p>
        </div>
      )}

      <div className={styles.groupH}>
        {t("communities:start.safety.rosterHeading")}
      </div>
      <button
        type="button"
        className={styles.toggleRow}
        onClick={() => set({ rosterVisible: !draft.rosterVisible })}
        aria-pressed={draft.rosterVisible}
        style={{ width: "100%", textAlign: "left" }}
      >
        <span className={styles.trTxt}>
          <Translation
            i18nKey="communities:start.safety.rosterToggleTitle"
            components={{ strong: <b /> }}
          />
          <span>{t("communities:start.safety.rosterToggleBody")}</span>
        </span>
        <span
          className={[styles.tg, draft.rosterVisible && styles.tgOn]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>
    </div>
  );
}
