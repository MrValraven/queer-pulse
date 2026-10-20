import { useId, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { ApiError } from "../../shared/api/client";
import { Button, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { StudioPostCard } from "../studio/share/StudioPostCard";
import { parseStudioLink } from "../studio/share/studioLinkTarget";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useShareToCommunity } from "./api/useShareToCommunity";
import styles from "./ApplicationModals.module.css";
import localStyles from "./ShareToCommunityModal.module.css";

/** Turns the API's refusal into the sentence that explains it. */
function refusalMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError && error.status === 403) {
    return t("economy:shareToCommunity.errorNotAllowed");
  }
  if (error instanceof ApiError && error.status === 404) {
    return t("economy:shareToCommunity.errorGone");
  }
  return t("economy:shareToCommunity.errorFailed");
}

/**
 * Share something to one of the communities you belong to: a job, a Studio
 * release or anything with a link back to it.
 *
 * It writes a COMMUNITY POST (`note`, a blank line, then `url`), so the share
 * lands in a community with a moderation owner and reaches the feed through
 * the existing read-time aggregation. There is no standalone feed-post
 * content type, and this deliberately does not invent one. A Studio link
 * previews its card under the note, as the post will show it; any other link
 * (a job) posts as plain text.
 */
export function ShareToCommunityModal({
  title,
  url,
  defaultNote,
  notice,
  onClose,
}: {
  /** The shared thing's name, for the dialog's accessible name. */
  title: string;
  /** Absolute link back to what is being shared. */
  url: string;
  /** The note the field opens with; the member can rewrite it. */
  defaultNote: string;
  /** One more line above the moderation note, e.g. Studio's owner-persona
   *  line. Omit for none. */
  notice?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const communities = useMyCommunityOptions();
  const share = useShareToCommunity();
  // The notice (who the post shows you run) is read with the button that posts.
  const noticeId = useId();
  const studioTarget = parseStudioLink(url);

  const [communitySlug, setCommunitySlug] = useState<string | null>(
    communities[0]?.slug ?? null,
  );
  const [note, setNote] = useState(defaultNote);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const chosenCommunity = communities.find(
    (community) => community.slug === communitySlug,
  );
  const canShare = Boolean(communitySlug) && note.trim().length > 0;

  async function submit() {
    if (!canShare || !communitySlug || share.isPending) return;
    setErrorMessage(null);
    try {
      await share.mutateAsync({
        communitySlug,
        body: `${note.trim()}\n\n${url}`,
      });
      // Confirmation comes from the resolved mutation, never from the click.
      setDone(true);
    } catch (error) {
      setErrorMessage(refusalMessage(error, t));
    }
  }

  if (done) {
    return (
      <ModalShell onClose={onClose} success>
        <SuccessPanel
          title={t("economy:shareToCommunity.success.title")}
          em={t("economy:shareToCommunity.success.em")}
          onClose={onClose}
          closeLabel={t("economy:shareToCommunity.success.closeLabel")}
        >
          <Translation
            i18nKey="economy:shareToCommunity.success.body"
            values={{ community: chosenCommunity?.name ?? "" }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:shareToCommunity.ariaLabelNamed", { title })}
    >
      <div className={styles.eyebrow}>
        {t("economy:shareToCommunity.eyebrow")}
      </div>
      <h2 className={styles.title}>
        <Translation
          i18nKey="economy:shareToCommunity.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("economy:shareToCommunity.sub")}</p>

      {communities.length === 0 ? (
        <p className={styles.note}>
          {t("economy:shareToCommunity.noCommunities")}
        </p>
      ) : (
        <>
          <div className={styles.field}>
            <span id="share-community-label">
              {t("economy:shareToCommunity.communityLabel")}
            </span>
            <Select
              labelledBy="share-community-label"
              placeholder={t("economy:shareToCommunity.communityPlaceholder")}
              options={communities.map((community) => ({
                value: community.slug,
                label: community.name,
              }))}
              value={communitySlug}
              onChange={setCommunitySlug}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="share-community-note">
              {t("economy:shareToCommunity.noteLabel")}
            </label>
            <textarea
              id="share-community-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("economy:shareToCommunity.notePlaceholder")}
            />
          </div>
          {studioTarget && (
            <div className={localStyles.preview}>
              <StudioPostCard target={studioTarget} isInteractive={false} />
            </div>
          )}

          {notice && (
            <p id={noticeId} className={localStyles.identityNote}>
              <FiInfo aria-hidden className={localStyles.identityIcon} />
              <span>{notice}</span>
            </p>
          )}
          <p className={styles.note}>
            {t("economy:shareToCommunity.moderationNote")}
          </p>
          {errorMessage && (
            <p className={styles.note} role="alert">
              {errorMessage}
            </p>
          )}
        </>
      )}

      <div className={`${styles.foot} ${styles.footEnd}`}>
        <button type="button" className={styles.back} onClick={onClose}>
          {t("economy:shareToCommunity.cancel")}
        </button>
        <Button
          variant="primary"
          size="lg"
          disabled={!canShare || share.isPending}
          aria-describedby={
            notice && communities.length > 0 ? noticeId : undefined
          }
          onClick={() => void submit()}
        >
          {share.isPending ? (
            <Sending label={t("economy:shareToCommunity.sending")} />
          ) : (
            t("economy:shareToCommunity.shareCta")
          )}
        </Button>
      </div>
    </ModalShell>
  );
}
