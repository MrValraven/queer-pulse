import { FiSend } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import { CommunityPostComposer } from "./CommunityPostComposer";
import { CommunityWelcomeCard } from "./CommunityWelcomeCard";
import type { usePulseTabActions } from "./usePulseTabActions";
import styles from "./PulseTab.module.css";

/**
 * The Pulse tab's top block: the member welcome card, then the post
 * composer, the frozen notice, or a join hint for a visitor. Extracted from
 * `PulseTab` so that component stays under the repo's 200-line limit.
 */
export function PulseComposerArea({
  communitySlug,
  name,
  isMember,
  frozen,
  canAnnounce,
  actions,
}: {
  communitySlug: string;
  name: string;
  isMember: boolean;
  /** True while the community is auto-frozen — swaps the composer for an
   *  explanation instead of leaving it open to a 403. */
  frozen: boolean;
  /** Owner, co-owner or moderator — gates the composer's announcement switch. */
  canAnnounce: boolean;
  actions: ReturnType<typeof usePulseTabActions>;
}) {
  const { t } = useTranslation();

  return (
    <>
      {isMember && (
        <CommunityWelcomeCard
          key={communitySlug}
          slug={communitySlug}
          communityName={name}
        />
      )}

      {isMember ? (
        frozen ? (
          <div style={{ marginBottom: 20 }}>
            <CommunityFrozenComposerNotice />
          </div>
        ) : (
          <CommunityPostComposer
            viewer={actions.viewer}
            className={styles.composer}
            textareaClassName={styles.composerTa}
            placeholder={t("communities:detail.pulse.composerPlaceholder", {
              name,
            })}
            value={actions.draft}
            onChange={actions.setDraft}
            onSubmit={actions.share}
            submitLabel={t(
              actions.isAnnouncementDraft
                ? "communities:detail.pulse.announcement.shareCta"
                : "communities:detail.pulse.shareCta",
            )}
            submitIcon={<FiSend aria-hidden />}
            attach={actions.imageAttach}
            {...(canAnnounce
              ? {
                  announcement: {
                    isOn: actions.isAnnouncementDraft,
                    onToggle: actions.setIsAnnouncementDraft,
                  },
                }
              : {})}
          />
        )
      ) : (
        <div className={styles.joinHint}>
          {t("communities:detail.pulse.joinHint", { name })}
        </div>
      )}
    </>
  );
}
