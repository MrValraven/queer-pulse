import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FadeIn } from "../../../shared/components/ui/FadeIn";
import { FormField } from "../../../shared/components/ui/FormField";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { communityBadgeKeys } from "./api/communityBadgeKeys";
import { useCommunityGiftAllowance } from "./api/useCommunityGifts";
import { useSendCommunityGift } from "./api/useCommunityGiftMutations";
import {
  GIFT_RESET_FORMAT,
  communityBadgeErrorText,
} from "./communityBadgeErrors";
import {
  COMMUNITY_GIFT_NOTE_MAX_LENGTH,
  type CommunityGiftKey,
} from "./communityBadges.catalog";
import {
  canSubmitGift,
  giftNoteLength,
  giftSendBody,
  isWeeklyLimitRefusal,
} from "./sendCommunityGift.model";
import {
  SendCommunityGiftCapNotice,
  SendCommunityGiftPicker,
} from "./SendCommunityGiftPicker";
import styles from "./SendCommunityGiftDialog.module.css";

interface SendCommunityGiftDialogProps {
  slug: string;
  recipient: { slug: string; name: string };
  onClose: () => void;
}

/** Pick a gift, add an optional note, send. A refusal keeps the dialog open
 *  and names its reason in the alert line above the footer. The body is keyed
 *  on the recipient, so a dialog reopened for another member (even during an
 *  exit animation) starts clean: gift unpicked, note empty, refusal cleared. */
export function SendCommunityGiftDialog(props: SendCommunityGiftDialogProps) {
  return <GiftDialogBody key={props.recipient.slug} {...props} />;
}

function GiftDialogBody({
  slug,
  recipient,
  onClose,
}: SendCommunityGiftDialogProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isSendingRef = useRef(false);
  const allowanceQuery = useCommunityGiftAllowance(slug);
  const sendGift = useSendCommunityGift(slug);
  const [giftKey, setGiftKey] = useState<CommunityGiftKey | null>(null);
  const [note, setNote] = useState("");

  const allowance = allowanceQuery.data;
  const remaining = allowance?.remaining ?? null;
  const noteLength = giftNoteLength(note);
  const isNoteTooLong = noteLength > COMMUNITY_GIFT_NOTE_MAX_LENGTH;
  const resetsAt = allowance?.resetsAt ?? null;
  const isAllowanceUsed = remaining === 0 && resetsAt !== null;
  const canSend = canSubmitGift({
    giftKey,
    note,
    remaining,
    isPending: sendGift.isPending,
  });
  const refusalText =
    sendGift.isError && !isAllowanceUsed
      ? communityBadgeErrorText(sendGift.error, t, fmt)
      : "";
  const capText = isAllowanceUsed
    ? t("communities:badges.giftDialog.allowanceUsed", {
        limit: allowance?.limit ?? 0,
        date: fmt.date(new Date(resetsAt ?? 0), GIFT_RESET_FORMAT),
      })
    : "";
  const allowanceText = t("communities:badges.giftDialog.allowance", {
    count: remaining ?? 0,
  });
  const noteCounterClass = isNoteTooLong
    ? `${styles.counter} ${styles.counterOver}`
    : styles.counter;

  const submit = () => {
    if (!canSend || giftKey === null || isSendingRef.current) return;
    isSendingRef.current = true;
    sendGift.mutate(giftSendBody(recipient.slug, giftKey, note), {
      onSettled: () => {
        isSendingRef.current = false;
      },
      onSuccess: () => {
        const sentText = t("communities:badges.giftDialog.sentToast", {
          name: recipient.name,
        });
        showToast(sentText, "success");
        onClose();
      },
      // The cap was reached since the allowance was read: re-read it, so the
      // line and the held Send follow.
      onError: (error) => {
        if (!isWeeklyLimitRefusal(error)) return;
        void queryClient.invalidateQueries({
          queryKey: [...communityBadgeKeys.all(slug), "allowance"],
        });
      },
    });
  };
  // A reset mid-send would drop the callbacks of the send in flight.
  const clearRefusal = () => {
    if (!sendGift.isPending) sendGift.reset();
  };
  // Leaving mid-send would drop the success toast with the dialog, so Escape,
  // the scrim, the close button and Cancel all wait for the send to settle.
  const closeUnlessSending = sendGift.isPending ? () => {} : onClose;

  return (
    <Modal
      title={t("communities:badges.giftDialog.title", { name: recipient.name })}
      sub={t("communities:badges.giftDialog.lead", { name: recipient.name })}
      onClose={closeUnlessSending}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={closeUnlessSending}
            disabled={sendGift.isPending}
          >
            {t("communities:badges.giftDialog.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={submit}
            disabled={!canSend}
          >
            {t("communities:badges.giftDialog.send")}
          </Button>
        </>
      }
    >
      <SendCommunityGiftCapNotice isCapped={isAllowanceUsed} text={capText} />

      <Collapse isOpen={!isAllowanceUsed}>
        <SendCommunityGiftPicker
          value={giftKey}
          onChange={(nextKey) => {
            setGiftKey(nextKey);
            clearRefusal();
          }}
        />

        <FormField
          label={t("communities:badges.giftDialog.note")}
          labelAside={
            <span className={noteCounterClass}>
              {t("communities:badges.counter", {
                count: noteLength,
                max: COMMUNITY_GIFT_NOTE_MAX_LENGTH,
              })}
            </span>
          }
          error={
            isNoteTooLong
              ? t("communities:badges.error.gift_note_too_long", {
                  maxLength: COMMUNITY_GIFT_NOTE_MAX_LENGTH,
                })
              : undefined
          }
        >
          <textarea
            rows={3}
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              clearRefusal();
            }}
            placeholder={t("communities:badges.giftDialog.notePlaceholder")}
          />
        </FormField>
      </Collapse>

      <Collapse isOpen={remaining !== null && !isAllowanceUsed}>
        <FadeIn>
          <p className={styles.allowance}>{allowanceText}</p>
        </FadeIn>
      </Collapse>

      <Collapse isOpen={refusalText !== ""}>
        <p className={styles.refusal} role="alert">
          {refusalText}
        </p>
      </Collapse>
    </Modal>
  );
}
