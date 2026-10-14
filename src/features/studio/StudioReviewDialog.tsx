import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface StudioReviewDialogRequest {
  titleKey: string;
  bodyKey: string;
  confirmKey: string;
  /** The text field's label, or null for a decision with nothing to write. */
  textLabelKey: string | null;
  textMaxLength: number;
  releaseTitle: string;
  tone: "default" | "destructive" | "positive";
}

/**
 * The confirm step of a staff decision. The panel mounts it keyed per
 * request, so the text starts empty each time; it stays open, with both
 * buttons waiting, while the decision is on its way. A required text keeps
 * Confirm disabled until it holds more than spaces.
 */
export function StudioReviewDialog({
  request,
  isPending,
  onConfirm,
  onClose,
}: {
  request: StudioReviewDialogRequest | null;
  isPending: boolean;
  onConfirm: (text: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  return (
    <ConfirmDialog
      open={request !== null}
      onClose={onClose}
      onConfirm={() => onConfirm(text.trim())}
      loading={isPending}
      tone={request?.tone ?? "default"}
      title={
        request ? t(request.titleKey, { title: request.releaseTitle }) : ""
      }
      description={request ? t(request.bodyKey) : undefined}
      confirmLabel={request ? t(request.confirmKey) : undefined}
      reason={
        request?.textLabelKey
          ? {
              value: text,
              onChange: setText,
              label: t(request.textLabelKey),
              required: true,
              maxLength: request.textMaxLength,
            }
          : undefined
      }
    />
  );
}
