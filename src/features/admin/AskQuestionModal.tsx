import { useState } from "react";
import { Modal, FormField, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { describeError } from "../../shared/api/errorMessage";
import { useAskListingQuestion } from "./api/useAskListingQuestion";
import type { ListingQueueRow } from "./api/adminListings.api";

const MAX_LENGTH = 2000;

export function AskQuestionModal({
  row,
  onClose,
  onAsked,
}: {
  row: ListingQueueRow;
  onClose: () => void;
  onAsked: (ref: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const askQuestion = useAskListingQuestion();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const trimmed = body.trim();
  const hasSubmitter = row.submitterSlug.length > 0;

  async function send() {
    if (trimmed.length === 0 || askQuestion.isPending) return;
    setError(null);
    try {
      await askQuestion.mutateAsync({ row, body: trimmed });
      showToast(
        t("admin:adminListings.ask.sent", { name: row.name }),
        "success",
      );
      onAsked(row.ref);
      onClose();
    } catch (caught) {
      setError(describeError(t("admin:adminListings.ask.action"), caught));
    }
  }

  return (
    <Modal
      title={t("admin:adminListings.ask.title", { name: row.name })}
      eyebrow={t("admin:adminListings.ask.eyebrow")}
      sub={t("admin:adminListings.ask.sub", {
        name: row.submitterName || t("admin:adminListings.unknownSubmitter"),
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:adminListings.ask.cancel")}
          </Button>
          <Button
            variant="jade"
            onClick={() => void send()}
            disabled={
              trimmed.length === 0 || askQuestion.isPending || !hasSubmitter
            }
          >
            {t("admin:adminListings.ask.send")}
          </Button>
        </>
      }
    >
      {hasSubmitter ? (
        <FormField
          label={t("admin:adminListings.ask.label")}
          helper={t("admin:adminListings.ask.helper")}
          error={error ?? undefined}
          labelAside={`${body.length}/${MAX_LENGTH}`}
        >
          <textarea
            value={body}
            maxLength={MAX_LENGTH}
            rows={5}
            placeholder={t("admin:adminListings.ask.placeholder")}
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
      ) : (
        <p>{t("admin:adminListings.ask.noSubmitter")}</p>
      )}
    </Modal>
  );
}
