import { useState } from "react";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { RsvpDetailsVisibility } from "./api/events.api";
import { useRsvpDetails } from "./api/useRsvpDetails";
import { useRsvpInvites } from "./api/useRsvpInvites";
import type { RsvpQuestions } from "./gatheringExtras";
import { GatheringRsvpDetailsQuestions } from "./GatheringRsvpDetailsQuestions";
import { GatheringRsvpGuestCountField } from "./GatheringRsvpGuestCountField";
import { RsvpConnectionInvites } from "./RsvpConnectionInvites";
import { RsvpDetailsLoadError } from "./RsvpDetailsLoadError";
import { RsvpVisibilityField } from "./RsvpVisibilityField";
import { useHasRsvpCutoffPassed } from "./rsvpCutoff";
import { guestStepperMax } from "./rsvpGuestCap";
import {
  answersFromSaved,
  askedAnswersPayload,
  askedRsvpQuestions,
  type RsvpDetailsAnswerKey,
  type RsvpDetailsAnswers,
} from "./rsvpDetailsAnswers";
import { useRsvpInviteDraft } from "./useRsvpInviteDraft";
import { useSaveRsvpWithInvites } from "./useSaveRsvpWithInvites";
import styles from "./GatheringDetailPanels.module.css";

/** PRD-414/415: the one answer to "Who can see you're going?", the same field
 *  (`RsvpVisibilityField`) and meaning as My events. `justMe` lists the member
 *  to the hosts only, `connections` to their accepted connections too, and
 *  `everyone` to every member who can read the guest list. The host always
 *  sees the member and every note they write, whatever they pick. The default
 *  matches what the server applies to an RSVP that never chose, so the field
 *  opens on the setting that is actually in force. */
const VISIBILITY_DEFAULT: RsvpDetailsVisibility = "everyone";

/**
 * "Anything we should know?": the plus-one count, the connections the member
 * brings, and the access/dietary needs, asked on the event's OWN page
 * (PRD-187). Save is the one commit point: it writes the details, then sends
 * the picked connections' invites.
 *
 * These could previously only be entered from a My Events card, after RSVPing
 * and on a different screen. Two things followed: a host's seat count was
 * wrong until the member happened to find the modal (capacity counts declared
 * guests, so an undeclared plus-one is an unlaid place), and access needs went
 * unstated for most people, because the one moment a member is thinking about
 * whether they can get into a room is the moment they say they are coming.
 *
 * Live only: `useRsvpDetails`/`useUpdateRsvpDetails` no-op in demo, so this is
 * rendered only when there is a real RSVP behind it.
 */
export function GatheringRsvpDetailsModal({
  slug,
  rsvpQuestions,
  customRsvpQuestion,
  rsvpClosesAt,
  isOrganizer,
  canInviteConnections,
  onClose,
}: {
  slug: string;
  /** Which optional questions this event asks. A detail from before the
   *  field existed carries none, and asks what this form always asked
   *  (ruling R8). */
  rsvpQuestions?: RsvpQuestions;
  /** The host's own question in their own words, or null/absent for none. */
  customRsvpQuestion?: string | null;
  /** When RSVPs close for members, or null when they stay open until the
   *  event ends. Past it a member may lower their guest count only. */
  rsvpClosesAt: Date | null;
  /** The host or a co-host, whom the server lets add guests after the
   *  cutoff. */
  isOrganizer: boolean;
  /** Going or maybe: the member may invite their connections. */
  canInviteConnections: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const {
    data: saved,
    isError: hasSavedDetailsError,
    isFetching: isFetchingSavedDetails,
    refetch: refetchSavedDetails,
  } = useRsvpDetails(slug);
  const { save: saveWithInvites, isSaving } = useSaveRsvpWithInvites(
    slug,
    onClose,
  );
  // Open member invites take seats from the same cap as the stepper.
  const invitesQuery = useRsvpInvites(slug);
  const { openInviteCount, isPending: isInvitesPending } = invitesQuery;
  const asked = askedRsvpQuestions(rsvpQuestions, customRsvpQuestion);

  const [guestCount, setGuestCount] = useState(0);
  const [answers, setAnswers] = useState<RsvpDetailsAnswers>(() =>
    answersFromSaved(null),
  );
  const [visibility, setVisibility] =
    useState<RsvpDetailsVisibility>(VISIBILITY_DEFAULT);

  // Seed from the member's real saved answers once they land. Adjusted during
  // render (React's documented pattern for resetting state when a loaded value
  // changes), keyed on the query result's own identity so it only re-seeds
  // when genuinely new data arrives.
  const [previousSaved, setPreviousSaved] = useState(saved);
  if (saved !== previousSaved) {
    setPreviousSaved(saved);
    if (saved) {
      setGuestCount(saved.guestCount);
      setAnswers(answersFromSaved(saved));
      if (saved.visibility) setVisibility(saved.visibility);
    }
  }

  const updateAnswer = (key: RsvpDetailsAnswerKey, value: string) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  // Past the host's cutoff the server refuses a member's raise and lets an
  // organiser through, so a member's options stop at the count they saved.
  // Until that count lands the options stay open and the server answers.
  const hasCutoffPassed = useHasRsvpCutoffPassed(rsvpClosesAt);
  const isGuestRaiseClosed =
    !demoMode && hasCutoffPassed && !isOrganizer && saved != null;
  // Until the open invites land the ceiling holds at the saved count, so the
  // stepper never offers a seat an invite already holds.
  const maxGuestCount = guestStepperMax({
    savedGuestCount: saved?.guestCount ?? 0,
    openInviteCount,
    isRaiseClosed: isGuestRaiseClosed || isInvitesPending,
  });
  const isInviteClosed = !demoMode && hasCutoffPassed && !isOrganizer;
  // A cutoff that passes while the sheet is open shrinks the options under a
  // higher pick, so the shown value and the payload both hold to the ceiling.
  const clampedGuestCount = Math.min(guestCount, maxGuestCount);
  // Plus is held by the cap itself (guests and invites fill every seat), so
  // the stepper says why. A closed cutoff has its own hint.
  const isAtGuestCap =
    !isGuestRaiseClosed &&
    !isInvitesPending &&
    clampedGuestCount >= maxGuestCount;
  const inviteDraft = useRsvpInviteDraft({
    slug,
    invitesQuery,
    savedGuestCount: saved?.guestCount ?? 0,
    currentGuestCount: clampedGuestCount,
    isInviteClosed,
    canInviteConnections,
  });
  // Live saves wait for the saved details: a save sent before they land would
  // write a zero guest count and blank answers over what is stored.
  const isAwaitingSavedDetails = !demoMode && saved === undefined;
  // A failed load leaves nothing to seed the form from, so the fields give way
  // to a retry and Save stays held by `isAwaitingSavedDetails`. A background
  // refetch that fails after a load keeps the loaded form.
  const isSavedDetailsLoadError =
    isAwaitingSavedDetails && hasSavedDetailsError;

  // The one commit point: the details, then the picked connections' invites.
  const save = () =>
    saveWithInvites(
      {
        guestCount: clampedGuestCount,
        visibility,
        ...askedAnswersPayload(answers, asked),
      },
      inviteDraft.activePicks,
    );

  return (
    <Modal
      onClose={onClose}
      eyebrow={t("gatherings:rsvpDetails.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:rsvpDetails.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:rsvpDetails.sub")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:rsvpDetails.cancelCta")}
          </Button>
          <Button
            variant="jade"
            onClick={save}
            disabled={isSaving || isAwaitingSavedDetails}
          >
            {t("gatherings:rsvpDetails.saveCta")}
          </Button>
        </>
      }
    >
      {isSavedDetailsLoadError ? (
        <RsvpDetailsLoadError
          isRetrying={isFetchingSavedDetails}
          onRetry={() => void refetchSavedDetails()}
        />
      ) : (
        <>
          <GatheringRsvpGuestCountField
            guestCount={clampedGuestCount}
            maxGuestCount={maxGuestCount}
            isGuestRaiseClosed={isGuestRaiseClosed}
            isAtGuestCap={isAtGuestCap}
            inviteSeatCount={openInviteCount + inviteDraft.activePicks.length}
            onGuestCountChange={setGuestCount}
          />

          <Collapse isOpen={canInviteConnections}>
            <RsvpConnectionInvites
              slug={slug}
              draft={inviteDraft}
              isInviteClosed={isInviteClosed}
            />
          </Collapse>

          <GatheringRsvpDetailsQuestions
            asked={asked}
            answers={answers}
            onAnswerChange={updateAnswer}
          />

          <RsvpVisibilityField
            value={visibility}
            onChange={setVisibility}
            note={t("gatherings:rsvpDetails.privacyNote")}
            labelClassName={styles.detailsLabel}
          />
        </>
      )}
    </Modal>
  );
}
