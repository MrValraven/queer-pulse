import { useState } from "react";
import { ApiError } from "../../shared/api/client";
import { Button, Select } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { useMyCommunityOptions } from "../communities/api/useMyCommunityOptions";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useShareToCommunity } from "./api/useShareToCommunity";
import styles from "./ApplicationModals.module.css";

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
 * Share a job to one of the communities you belong to.
 *
 * It writes a COMMUNITY POST, so the share lands in a room with a moderation
 * owner and reaches the feed through the existing read-time aggregation. There
 * is no standalone feed-post content type, and this deliberately does not
 * invent one.
 */
export function ShareToCommunityModal({
  title,
  url,
  organization,
  onClose,
}: {
  title: string;
  /** Absolute link back to what is being shared. */
  url: string;
  organization: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const communities = useMyCommunityOptions();
  const share = useShareToCommunity();

  const [communitySlug, setCommunitySlug] = useState<string | null>(
    communities[0]?.slug ?? null,
  );
  const [note, setNote] = useState(
    t("economy:shareToCommunity.defaultNote", { title, organization }),
  );
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
      ariaLabel={t("economy:shareToCommunity.ariaLabel")}
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
