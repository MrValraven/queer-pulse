import { createElement, useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiGift } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  FadeIn,
  LoadErrorState,
  Modal,
  SkeletonAvatar,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityMemberGiftDTO } from "./api/communityBadges.api";
import { useRemoveCommunityGift } from "./api/useCommunityGiftMutations";
import { useCommunityMemberGifts } from "./api/useCommunityGifts";
import { communityBadgeIcon } from "./communityBadgeIcons";
import { communityGiftNameKey } from "./communityBadgeCopy.data";
import { communityBadgeErrorText } from "./communityBadgeErrors";
import {
  communityGiftOf,
  resolveCommunityFlairTint,
} from "./communityBadges.catalog";
import styles from "./CommunityMemberGifts.module.css";

export interface CommunityMemberGiftsDialogProps {
  communitySlug: string;
  memberSlug: string;
  memberName: string;
  onClose: () => void;
}

interface GiftMarkRowProps {
  gift: CommunityMemberGiftDTO;
  onRemove: (gift: CommunityMemberGiftDTO) => void;
}

function GiftMarkRow({ gift, onRemove }: GiftMarkRowProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const nameId = useId();
  const entry = communityGiftOf(gift.giftKey);
  return (
    <div className={styles.row}>
      <span
        className={styles.giftIcon}
        data-tint={resolveCommunityFlairTint(entry?.tint)}
        aria-hidden
      >
        {createElement(entry ? communityBadgeIcon(entry.iconKey) : FiGift)}
      </span>
      <span className={styles.rowText}>
        <span id={nameId} className={styles.giftName}>
          {t(communityGiftNameKey(gift.giftKey))}
        </span>
        <span className={styles.giftDate}>
          {t("communities:badges.shelf.sentOn", {
            date: fmt.date(new Date(gift.sentAt), {
              day: "numeric",
              month: "short",
            }),
          })}
        </span>
      </span>
      {gift.canRemove && (
        <Button
          variant="ghost"
          size="sm"
          aria-describedby={nameId}
          onClick={() => onRemove(gift)}
        >
          {t("communities:badges.giftMark.remove")}
        </Button>
      )}
    </div>
  );
}

/**
 * The recent gifts on a member's name line: gift icon, gift name and the day
 * it was sent. The sender and owner-level members also get "Remove gift",
 * behind a confirmation. Only the name-line mark mounts this dialog.
 */
export function CommunityMemberGiftsDialog({
  communitySlug,
  memberSlug,
  memberName,
  onClose,
}: CommunityMemberGiftsDialogProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const giftsQuery = useCommunityMemberGifts(communitySlug, memberSlug);
  const removeGift = useRemoveCommunityGift(communitySlug);
  const [pendingRemoval, setPendingRemoval] =
    useState<CommunityMemberGiftDTO | null>(null);
  const [removedIds, setRemovedIds] = useState<readonly string[]>([]);

  const gifts = (giftsQuery.data?.gifts ?? []).filter(
    (gift) => !removedIds.includes(gift.id),
  );

  const confirmRemoval = () => {
    if (!pendingRemoval) return;
    const giftId = pendingRemoval.id;
    removeGift.mutate(
      { giftId },
      {
        onSuccess: () => {
          setRemovedIds((ids) => [...ids, giftId]);
          setPendingRemoval(null);
          showToast(t("communities:badges.giftMark.removedToast"), "success");
        },
        onError: (error) => {
          setPendingRemoval(null);
          showToast(communityBadgeErrorText(error, t, fmt), "error");
        },
      },
    );
  };

  return (
    <>
      <Modal
        title={t("communities:badges.giftMark.dialogTitle", {
          name: memberName,
        })}
        onClose={onClose}
      >
        <div className={styles.body}>
          {giftsQuery.isLoading && (
            <FadeIn>
              {[0, 1].map((index) => (
                <div key={index} className={styles.row}>
                  <SkeletonAvatar size={32} />
                  <SkeletonLine width="55%" />
                </div>
              ))}
            </FadeIn>
          )}
          {giftsQuery.isError && (
            <LoadErrorState
              compact
              onRetry={() => void giftsQuery.refetch()}
              description={communityBadgeErrorText(giftsQuery.error, t, fmt)}
            />
          )}
          {giftsQuery.isSuccess && (
            <ul className={styles.list}>
              <AnimatePresence initial={false}>
                {gifts.map((gift) => (
                  <CollapseListItem key={gift.id}>
                    <GiftMarkRow gift={gift} onRemove={setPendingRemoval} />
                  </CollapseListItem>
                ))}
              </AnimatePresence>
            </ul>
          )}
          <Collapse isOpen={giftsQuery.isSuccess && gifts.length === 0}>
            <p className={styles.empty}>
              {t("communities:badges.giftMark.empty")}
            </p>
          </Collapse>
        </div>
      </Modal>
      <AnimatePresence>
        {pendingRemoval && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t("communities:badges.giftMark.removeConfirmTitle")}
            description={t("communities:badges.giftMark.removeConfirmBody", {
              name: memberName,
            })}
            confirmLabel={t("communities:badges.giftMark.remove")}
            cancelLabel={t("communities:badges.giftMark.removeCancel")}
            loading={removeGift.isPending}
            onConfirm={confirmRemoval}
            onClose={() => setPendingRemoval(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
