import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ApiError } from "../../shared/api/client";
import { describeError } from "../../shared/api/errorMessage";
import {
  MAX_SUPPORT_OFFER_NOTE_LENGTH,
  type CommunitySupportOption,
} from "../communities/api/communitySupportOffers.api";
import { useOfferCommunitySupport } from "./api/useOfferCommunitySupport";
import { AdminModal, AdminCheckLine } from "./ui";
import { firstName, type Community } from "./adminCommunities.data";
import { SUPPORT_MODAL_OPTIONS } from "./adminSupportModal.data";
import styles from "./AdminCommunitiesPage.module.css";

/**
 * Offer a struggling community a hand.
 *
 * Until OPS-05 this modal wrote nothing at all. It closed itself, showed
 * "Support sent to <name>'s moderators" with an Undo that showed a second
 * toast and withdrew nothing, and made no network call in demo or live. The
 * community never heard from anyone.
 *
 * Now it records a real offer, which the community's own owner, co-owners and
 * moderators read and answer in their mod-tools console, and which reaches
 * their notification bell the moment it lands.
 *
 * There is no Undo, deliberately. The moment an offer is written its
 * recipients hold a notification about it and nothing can un-ring that, so a
 * withdraw control would be a second thing on this screen that does not do
 * what it says. Offering help is also not the kind of act that needs taking
 * back: the community declines it in one click if it is not what they need.
 */
export function AdminSupportModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const offerSupport = useOfferCommunitySupport();
  const [selected, setSelected] = useState<Set<CommunitySupportOption>>(
    () =>
      new Set<CommunitySupportOption>(["message_moderators", "staff_buddy"]),
  );
  const [note, setNote] = useState("");

  const firstWord = community.name.split(/\s+/)[0];
  const modFirsts = community.moderators
    .map((moderator) => firstName(moderator.name))
    .join(" & ");

  const subFor = (option: CommunitySupportOption): string => {
    if (option === "message_moderators") {
      return community.moderators.length > 0
        ? t("admin:communities.support.option.message.sub", {
            names: modFirsts,
          })
        : t("admin:communities.support.option.message.subNoMods");
    }
    return t(SUPPORT_MODAL_OPTIONS[option].subKey);
  };

  const toggle = (option: CommunitySupportOption) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  };

  const send = () => {
    const options = (
      Object.keys(SUPPORT_MODAL_OPTIONS) as CommunitySupportOption[]
    ).filter((option) => selected.has(option));
    if (options.length === 0) return;
    offerSupport.mutate(
      { slug: community.slug, options, note: note.trim() || undefined },
      {
        // The toast waits for the server, so it only ever reports something
        // that actually happened.
        onSuccess: () => {
          onClose();
          showToast(
            t("admin:communities.support.sentToast", { name: firstWord }),
            "success",
          );
        },
        onError: (error) => {
          const isAlreadyWaiting =
            error instanceof ApiError && error.status === 409;
          showToast(
            isAlreadyWaiting
              ? t("community:supportOffer.admin.conflictToast", {
                  name: firstWord ?? "",
                })
              : describeError(
                  t("admin:errors.saveChanges"),
                  error,
                  t("shared:apiError.tryAgainTail"),
                ),
            "error",
          );
        },
      },
    );
  };

  const footer = (
    <>
      <Button
        variant="ghost"
        size="md"
        onClick={onClose}
        disabled={offerSupport.isPending}
      >
        {t("admin:communities.support.cancelCta")}
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={send}
        disabled={selected.size === 0 || offerSupport.isPending}
        aria-busy={offerSupport.isPending}
      >
        {offerSupport.isPending
          ? t("community:supportOffer.admin.sendingCta")
          : t("admin:communities.support.sendCta")}
      </Button>
    </>
  );

  return (
    <AdminModal
      title={
        <Translation
          i18nKey="admin:communities.support.modalTitle"
          values={{ name: firstWord ?? "" }}
          components={{ em: <em /> }}
        />
      }
      onClose={onClose}
      footer={footer}
    >
      <p className={styles.modalIntro}>
        {t("admin:communities.support.intro")}
      </p>
      <div className={styles.checkList}>
        {(Object.keys(SUPPORT_MODAL_OPTIONS) as CommunitySupportOption[]).map(
          (option) => (
            <AdminCheckLine
              key={option}
              checked={selected.has(option)}
              onChange={() => toggle(option)}
              title={t(SUPPORT_MODAL_OPTIONS[option].titleKey)}
              sub={subFor(option)}
            />
          ),
        )}
      </div>
      <label className={styles.noteLabel}>
        <span className={styles.noteLabelTx}>
          {t("admin:communities.support.noteLabel")}
        </span>
        <textarea
          className={styles.noteArea}
          rows={3}
          value={note}
          maxLength={MAX_SUPPORT_OFFER_NOTE_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("admin:communities.support.notePlaceholder")}
        />
      </label>
    </AdminModal>
  );
}
