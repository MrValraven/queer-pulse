import { FiHome, FiLock, FiUnlock, FiUserCheck, FiKey } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ACCESS_OPTIONS,
  FEATURE_OPTIONS,
  INVITE_CANDIDATES,
  initialsOf,
  type CommunityDraft,
  type TintKey,
} from "./startCommunity.data";
import { ownerSteward } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const COVER: Record<TintKey, string> = {
  coral: styles.coverCoral!,
  jade: styles.coverJade!,
  plum: styles.coverPlum!,
};
const FACE: Record<TintKey, string> = {
  coral: styles.tintFaceCoral!,
  jade: styles.tintFaceJade!,
  plum: styles.tintFacePlum!,
};
const AV: Record<TintKey, string> = {
  coral: styles.tintFaceCoral!,
  jade: styles.tintFaceJade!,
  plum: styles.tintFacePlum!,
};
const ACCESS_ICON = {
  public: FiUnlock,
  request: FiUserCheck,
  invite: FiKey,
  private: FiLock,
} as const;

/** Sticky live community-card preview that fills in as the wizard progresses. */
export function StartCommunityPreview({ draft }: { draft: CommunityDraft }) {
  const { t } = useTranslation();
  const owner = ownerSteward();
  const invited = draft.invites
    .map((k) => INVITE_CANDIDATES.find((c) => c.key === k))
    .filter(Boolean) as (typeof INVITE_CANDIDATES)[number][];
  const roster = [owner, ...invited];
  const handle = (draft.handle || "").trim();
  const access = ACCESS_OPTIONS.find((a) => a.tier === draft.accessTier);
  const AccessIcon = draft.accessTier ? ACCESS_ICON[draft.accessTier] : null;
  const rooms = FEATURE_OPTIONS.filter(
    (f) => draft.features.includes(f.id) && f.id !== "discussion",
  );

  return (
    <aside className={styles.previewCol}>
      <div className={styles.pvHead}>
        <span className={styles.pvDot} />{" "}
        {t("communities:start.preview.liveLabel")}
      </div>

      {!draft.name.trim() ? (
        <div className={styles.cpvEmpty}>
          <div className={styles.ceDoor}>
            <FiHome size={26} aria-hidden />
          </div>
          <p>{t("communities:start.preview.emptyBody")}</p>
        </div>
      ) : (
        <div className={styles.cpvCard}>
          <div className={`${styles.cpvCover} ${COVER[draft.tint]}`} />
          <div className={styles.cpvBody}>
            <div className={`${styles.cpvAvatar} ${AV[draft.tint]}`}>
              {initialsOf(draft.name)}
            </div>
            <div className={styles.cpvName}>{draft.name}</div>
            <div className={styles.cpvHandle}>
              @{handle || t("communities:start.preview.handleFallback")}
            </div>
            {draft.purpose.trim() ? (
              <p className={styles.cpvPurpose}>{draft.purpose}</p>
            ) : (
              <p className={`${styles.cpvPurpose} ${styles.cpvPurposePh}`}>
                {t("communities:start.preview.purposePlaceholder")}
              </p>
            )}

            {access && AccessIcon && (
              <div className={styles.cpvBadges}>
                <span className={styles.cpvMinibadge}>
                  <AccessIcon size={12} aria-hidden /> {t(access.nameKey)}
                </span>
              </div>
            )}

            {draft.tagline.trim() && (
              <div className={styles.cpvTagline}>{draft.tagline}</div>
            )}

            {rooms.length > 0 && (
              <div className={styles.cpvRooms}>
                <div className={styles.cpvRoomsL}>
                  {t("communities:start.preview.insideLabel")}
                </div>
                <div className={styles.cpvRoomsList}>
                  {rooms.map((r) => (
                    <span key={r.id} className={styles.cpvRoom}>
                      {t(r.labelKey)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.cpvSub}>
              <div className={styles.cpvSubH}>
                <span>{t("communities:start.preview.foundingMembers")}</span>
                <span>{roster.length}</span>
              </div>
              <div className={styles.cpvRoster}>
                {roster.slice(0, 6).map((m) => (
                  <span
                    key={m.key}
                    className={`${styles.cpvFace} ${FACE[m.tint]}`}
                    title={m.name}
                  >
                    {m.initials}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className={styles.pvFoot}>{t("communities:start.preview.footNote")}</p>
    </aside>
  );
}
