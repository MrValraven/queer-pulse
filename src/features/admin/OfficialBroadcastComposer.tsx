import { useState } from "react";
import { FiRadio } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  OFFICIAL_BROADCAST_IDEMPOTENCY_CONFLICT_CODE,
  officialMessagesErrorCode,
} from "./api/adminOfficialMessages.api";
import { useCreateOfficialBroadcast } from "./api/useAdminOfficialMessages";
import { OfficialMessageBodyField } from "./OfficialMessageBodyField";
import styles from "./AdminOfficialMessagesPage.module.css";

/**
 * "Broadcast to everyone". Sending always goes through a confirm dialog that
 * says plainly who receives it and that it cannot be unsent. One idempotency
 * key per composed broadcast: a double confirm or a retried request is the
 * same broadcast, and a fresh key is minted only once one is accepted.
 */
export function OfficialBroadcastComposer() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [body, setBody] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
  const broadcastMutation = useCreateOfficialBroadcast();
  const trimmedBody = body.trim();
  const canReview = trimmedBody.length > 0;

  const handleConfirm = () => {
    broadcastMutation.mutate(
      { body: trimmedBody, idempotencyKey },
      {
        onSuccess: () => {
          showToast(t("admin:officialMessages.broadcast.accepted"), "success");
          setBody("");
          setIdempotencyKey(crypto.randomUUID());
          setIsConfirmOpen(false);
        },
        onError: (error) => {
          const isKeyReused =
            officialMessagesErrorCode(error) ===
            OFFICIAL_BROADCAST_IDEMPOTENCY_CONFLICT_CODE;
          // A reused key means this draft changed after an earlier accepted
          // send; a new key lets the edited text go out as its own broadcast.
          if (isKeyReused) setIdempotencyKey(crypto.randomUUID());
          showToast(
            t(
              isKeyReused
                ? "admin:officialMessages.broadcast.keyReused"
                : "admin:officialMessages.broadcast.failed",
            ),
            "error",
          );
        },
      },
    );
  };

  return (
    <section
      className={styles.panel}
      aria-labelledby="official-broadcast-composer-title"
    >
      <h2 id="official-broadcast-composer-title" className={styles.panelTitle}>
        {t("admin:officialMessages.broadcast.title")}
      </h2>
      <p className={styles.panelSub}>
        {t("admin:officialMessages.broadcast.subtitle")}
      </p>
      <OfficialMessageBodyField
        label={t("admin:officialMessages.broadcast.bodyLabel")}
        placeholder={t("admin:officialMessages.broadcast.bodyPlaceholder")}
        value={body}
        onChange={setBody}
      />
      <div className={styles.panelActions}>
        <Button
          variant="primary"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!canReview}
        >
          <FiRadio aria-hidden />
          {t("admin:officialMessages.broadcast.review")}
        </Button>
      </div>
      {isConfirmOpen && (
        <ConfirmDialog
          open
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirm}
          loading={broadcastMutation.isPending}
          title={t("admin:officialMessages.broadcast.confirmTitle")}
          description={t("admin:officialMessages.broadcast.confirmScope")}
          confirmLabel={t("admin:officialMessages.broadcast.confirm")}
          cancelLabel={t("admin:officialMessages.broadcast.cancel")}
        >
          <blockquote className={styles.confirmPreview}>
            {trimmedBody}
          </blockquote>
        </ConfirmDialog>
      )}
    </section>
  );
}
