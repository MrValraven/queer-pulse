import {
  FiLock,
  FiUnlock,
  FiUserCheck,
  FiKey,
  FiCompass,
  FiShield,
} from "react-icons/fi";
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
  const { draft, set } = form;
  const pick = (tier: AccessTier) => set({ accessTier: tier });

  return (
    <div>
      <div className={styles.accLead}>
        <FiCompass size={22} aria-hidden />
        <p>
          This is the one to sit with. It shapes who feels safe here.{" "}
          <b>You can change it later</b>, but it's worth getting close now.
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
                  <span className={styles.accName}>{opt.name}</span>
                  {opt.private && (
                    <span className={styles.accFlag}>Safest</span>
                  )}
                </span>
                <span className={styles.accLines}>
                  <span className={styles.accLine}>
                    <span className={styles.accKey}>Find</span>
                    {opt.find}
                  </span>
                  <span className={styles.accLine}>
                    <span className={styles.accKey}>Join</span>
                    {opt.join}
                  </span>
                </span>
                <span className={styles.accNote}>{opt.note}</span>
              </span>
              <span className={styles.accRadio} aria-hidden />
            </button>
          );
        })}
      </div>

      {draft.accessTier === "private" && (
        <div className={styles.privReassure}>
          <FiShield size={20} aria-hidden />
          <p>
            Private communities never appear in Discover, search, or member
            suggestions. Only people who are already inside can see who else is
            here.
          </p>
        </div>
      )}

      <div className={styles.groupH}>Member roster</div>
      <button
        type="button"
        className={styles.toggleRow}
        onClick={() => set({ rosterVisible: !draft.rosterVisible })}
        aria-pressed={draft.rosterVisible}
        style={{ width: "100%", textAlign: "left" }}
      >
        <span className={styles.trTxt}>
          <b>Show the member list to members</b>
          <span>
            When off, people can be here without their name appearing to others.
          </span>
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
