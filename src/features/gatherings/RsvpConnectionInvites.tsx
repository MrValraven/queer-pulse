import { useId, useState } from "react";
import { FiInfo, FiUserPlus, FiX } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWithdrawRsvpInvite } from "./api/useMemberInviteMutations";
import { MAX_RSVP_GUESTS } from "./rsvpGuestCap";
import { RsvpInvitedList } from "./RsvpInvitedList";
import { RsvpInvitePicker } from "./RsvpInvitePicker";
import type { RsvpInviteDraft } from "./useRsvpInviteDraft";
import detailStyles from "./GatheringDetailPanels.module.css";
import styles from "./RsvpConnectionInvites.module.css";

/**
 * "Bring people from QueerPulse": the member invites their own connections
 * from inside the RSVP, and each invitee answers for themselves. Every open
 * invite takes a seat from the same cap as the guests counted in "Who's
 * coming", so the hint counts the seats left and the picker stops there.
 * The picks belong to the modal's draft and go out with its Save.
 */
export function RsvpConnectionInvites({
  slug,
  draft,
  isInviteClosed,
}: {
  slug: string;
  /** Seats, picks and the invite list, owned by the modal. */
  draft: RsvpInviteDraft;
  /** Past the RSVP cutoff for a member who is not an organiser. */
  isInviteClosed: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const labelId = useId();
  const { invites, remainingSlots } = draft;
  const withdraw = useWithdrawRsvpInvite(slug);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // At the cap a picker holds no picks, so it folds away, as it does when
  // inviting stops altogether. Adjusted during render, React's pattern for
  // state that follows a derived value.
  const canPick = remainingSlots > 0;
  if (isPickerOpen && !canPick) setIsPickerOpen(false);
  const isPickerShown = isPickerOpen && canPick;
  // Closing the list drops its picks, so Save never sends a pick nobody can
  // see.
  const togglePicker = () => {
    if (isPickerShown) draft.clearPicks();
    setIsPickerOpen(!isPickerShown);
  };
  const withdrawingId = withdraw.isPending
    ? (withdraw.variables ?? null)
    : null;

  const withdrawInvite = (inviteId: string) =>
    withdraw.mutate(inviteId, {
      onSuccess: () =>
        showToast(t("gatherings:rsvpInvites.withdrawnToast"), "success"),
      onError: () =>
        showToast(t("gatherings:rsvpInvites.withdrawErrorToast"), "error"),
    });

  return (
    // The space below lives in padding on this wrapper, inside the modal's
    // Collapse, so the gap to the next field folds with the section.
    <div className={styles.section}>
      <div
        role="group"
        aria-labelledby={labelId}
        className={detailStyles.detailsField}
      >
        <div id={labelId} className={detailStyles.detailsLabel}>
          {t("gatherings:rsvpInvites.label")}
        </div>
        <RsvpInvitesHint draft={draft} isInviteClosed={isInviteClosed} />
        <Button
          variant="ghost"
          size="sm"
          className={styles.toggle}
          aria-expanded={isPickerShown}
          // An open picker can always be closed, even with no seat left.
          disabled={!isPickerShown && !canPick}
          onClick={togglePicker}
        >
          {isPickerShown ? <FiX aria-hidden /> : <FiUserPlus aria-hidden />}
          {isPickerShown
            ? t("gatherings:rsvpInvites.closePickerCta")
            : t("gatherings:rsvpInvites.openPickerCta")}
        </Button>
        {/* Outside the picker, so it still says what was unpicked once the
            cap folds the picker away. */}
        <PicksTrimmedLine count={draft.trimmedCount} />
        <Collapse isOpen={isPickerShown}>
          <RsvpInvitePicker
            remainingSlots={remainingSlots}
            excludeSlugs={draft.excludeSlugs}
            selected={draft.selected}
            activePicks={draft.activePicks}
            onToggle={draft.togglePick}
          />
        </Collapse>
        <RsvpInvitedList
          invites={invites}
          onWithdraw={withdrawInvite}
          withdrawingId={withdrawingId}
        />
      </div>
    </div>
  );
}

/** The line under the label: the seats left, the cap, the cutoff, or a list
 *  that never loaded with a retry beside it. A failed background refetch
 *  keeps the loaded list and its seats, so it never lands here. */
function RsvpInvitesHint({
  draft,
  isInviteClosed,
}: {
  draft: RsvpInviteDraft;
  isInviteClosed: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { remainingSlots, isLoadError, isRetrying, isInvitesPending } = draft;

  if (isInviteClosed) {
    return (
      <p className={styles.hint}>{t("gatherings:rsvpInvites.closedHint")}</p>
    );
  }
  if (isLoadError) {
    return (
      <div className={styles.loadError}>
        <p className={styles.hint}>
          {t("gatherings:rsvpInvites.listLoadError")}
        </p>
        {/* `aria-disabled` keeps the focused button in place while the
            retry runs, so focus never drops to the page. */}
        <Button
          variant="ghost"
          size="sm"
          className={styles.retry}
          aria-disabled={isRetrying}
          onClick={() => {
            if (!isRetrying) draft.retry();
          }}
        >
          {t("common:error.retry")}
        </Button>
      </div>
    );
  }
  if (isInvitesPending) return <p className={styles.hint} />;
  return (
    <p className={styles.hint}>
      {remainingSlots > 0 ? (
        <Translation
          i18nKey="gatherings:rsvpInvites.hint"
          values={{ count: remainingSlots }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(remainingSlots)}
                numericValue={remainingSlots}
              />
            ),
          }}
        />
      ) : (
        t("gatherings:rsvpInvites.capReachedHint", { max: MAX_RSVP_GUESTS })
      )}
    </p>
  );
}

/** Says how many picks a raised guest count unpicked, as a notice with its
 *  icon. The live region stays mounted, so the line is announced as it
 *  folds in. */
function PicksTrimmedLine({ count }: { count: number }) {
  const { t } = useTranslation();
  // The last count shown stays while the line folds away, so it never reads
  // "0 people" on its way out.
  const [shownCount, setShownCount] = useState(count);
  if (count > 0 && count !== shownCount) setShownCount(count);
  return (
    <div aria-live="polite">
      <Collapse isOpen={count > 0}>
        <p className={styles.trimmedHint}>
          <FiInfo aria-hidden className={styles.trimmedIcon} />
          {t("gatherings:rsvpInvites.picksTrimmedHint", { count: shownCount })}
        </p>
      </Collapse>
    </div>
  );
}
