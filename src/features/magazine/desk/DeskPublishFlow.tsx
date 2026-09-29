import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece } from "../data/desk.data";
import { usePieceRecord } from "../api/usePieceRecord";
import { useRecordMutations } from "../api/useRecordMutations";
import { usePiecePublishAction } from "./usePiecePublishAction";
import { PiecePublishModal } from "./PiecePublishModal";

export interface DeskPublishFlowProps {
  /** The piece whose next action is Publish, or null for none. */
  piece: Piece | null;
  /** Called once the publish has answered, or was dropped or refused. */
  onDone: () => void;
}

/**
 * The desk's "Publish" next action, run through the SAME publish action the
 * piece record uses (`usePiecePublishAction`): the care gate, the server's
 * refusal and the toasts behave exactly as on the record page, and so does
 * the confirm dialog (`PiecePublishModal`). Keyed by piece, so every request
 * starts clean.
 */
export function DeskPublishFlow({ piece, onDone }: DeskPublishFlowProps) {
  if (!piece) return null;
  return <DeskPublishConfirm key={piece.id} piece={piece} onDone={onDone} />;
}

/**
 * The confirm opens the moment Publish is pressed, titled from the desk's own
 * piece, with its confirm button busy until the record (and so the care gate)
 * has loaded. A gate with open items then answers with the record page's own
 * "blocked" toast and the dialog closes. After a confirm the dialog stays
 * busy until the request answers, so its success or refusal toast still
 * fires.
 */
function DeskPublishConfirm({
  piece,
  onDone,
}: {
  piece: Piece;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { record, isError } = usePieceRecord(piece.id);
  const { publish, unpublish } = useRecordMutations(piece.id);
  const publishAction = usePiecePublishAction({ record, publish, unpublish });
  const hasCheckedGateRef = useRef(false);
  // Closed while the request is still out: the dialog goes, the flow stays
  // mounted until the answer so its toast still fires.
  const [isDismissed, setIsDismissed] = useState(false);
  const isGateBlocked = Boolean(record) && publishAction.hasOpenGateItems;

  // Once the record is in, a blocked gate explains itself (askToPublish
  // toasts the open items and opens nothing) and the flow ends.
  useEffect(() => {
    if (hasCheckedGateRef.current) return;
    if (isError) {
      hasCheckedGateRef.current = true;
      showToast(t("magazine:desk.peek.recordErrorTitle"), "error");
      onDone();
      return;
    }
    if (!record) return;
    hasCheckedGateRef.current = true;
    if (isGateBlocked) {
      publishAction.askToPublish();
      onDone();
    }
  }, [record, isError, isGateBlocked, publishAction, onDone, showToast, t]);

  const hasPublishSettled = publish.isSuccess || publish.isError;
  useEffect(() => {
    if (hasPublishSettled) onDone();
  }, [hasPublishSettled, onDone]);

  return (
    <PiecePublishModal
      intent={isGateBlocked || isError || isDismissed ? null : "publish"}
      title={record?.title ?? piece.title}
      isPending={!record || publishAction.isPending}
      onClose={() => {
        if (publish.isPending) setIsDismissed(true);
        else onDone();
      }}
      onConfirm={publishAction.confirmPublish}
    />
  );
}
