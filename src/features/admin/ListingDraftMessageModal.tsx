import { useState } from "react";
import { Modal, FormField, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefToPerson } from "../../shared/api/refs";
import { describeError } from "../../shared/api/errorMessage";
import { useSendOfficialMessage } from "./api/useAdminOfficialMessages";
import {
  OFFICIAL_MESSAGE_MAX_LENGTH,
  type OfficialRecipientDTO,
} from "./api/adminOfficialMessages.api";
import type {
  AdminListingDraftDTO,
  ListingDraftOwnerDTO,
} from "./api/adminListingDrafts.api";

/** The official-messages recipient for a draft's owner. `status` is only read
 *  by the recipient picker, which this modal skips. */
function ownerToRecipient(owner: ListingDraftOwnerDTO): OfficialRecipientDTO {
  const person = memberRefToPerson(owner);
  return {
    userId: owner.userId,
    slug: owner.slug,
    name: person?.name ?? owner.firstName,
    initials: person?.initials ?? "",
    avatarUrl: owner.avatarUrl ?? null,
    status: "active",
  };
}

/**
 * "Offer a hand" for one stalled draft. Sends through the member's official
 * QueerPulse thread (pinned in their inbox, never pushed to their phone), the
 * same channel as `OfficialMessageMemberComposer`, with a warm starter message
 * the admin can rewrite before sending.
 */
export function ListingDraftMessageModal({
  draft,
  owner,
  onClose,
}: {
  draft: AdminListingDraftDTO;
  owner: ListingDraftOwnerDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const sendMutation = useSendOfficialMessage();
  const placeName = draft.name.trim();
  const [body, setBody] = useState(() =>
    placeName
      ? t("admin:listingDrafts.message.template", {
          firstName: owner.firstName,
          name: placeName,
        })
      : t("admin:listingDrafts.message.templateUntitled", {
          firstName: owner.firstName,
        }),
  );
  const [error, setError] = useState<string | null>(null);
  const trimmed = body.trim();
  const recipient = ownerToRecipient(owner);

  async function send() {
    if (trimmed.length === 0 || sendMutation.isPending) return;
    setError(null);
    try {
      await sendMutation.mutateAsync({ recipient, body: trimmed });
      showToast(
        t("admin:listingDrafts.message.sent", { name: recipient.name }),
        "success",
      );
      onClose();
    } catch (caught) {
      setError(describeError(t("admin:listingDrafts.message.action"), caught));
    }
  }

  return (
    <Modal
      eyebrow={t("admin:listingDrafts.message.eyebrow")}
      title={t("admin:listingDrafts.message.title", {
        name: recipient.name,
      })}
      sub={t("admin:listingDrafts.message.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:listingDrafts.message.cancel")}
          </Button>
          <Button
            variant="jade"
            onClick={() => void send()}
            disabled={trimmed.length === 0 || sendMutation.isPending}
          >
            {sendMutation.isPending
              ? t("admin:listingDrafts.message.sending")
              : t("admin:listingDrafts.message.send")}
          </Button>
        </>
      }
    >
      <FormField
        label={t("admin:listingDrafts.message.label")}
        helper={t("admin:listingDrafts.message.helper")}
        error={error ?? undefined}
        labelAside={`${body.length}/${OFFICIAL_MESSAGE_MAX_LENGTH}`}
      >
        <textarea
          value={body}
          maxLength={OFFICIAL_MESSAGE_MAX_LENGTH}
          rows={7}
          onChange={(event) => setBody(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}
