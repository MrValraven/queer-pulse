import { useState } from "react";
import { Button, Modal, SegmentedControl } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type {
  RsvpDetailsVisibility,
  UpdateRsvpDetailsDto,
} from "./api/events.api";
import { useRsvpDetails } from "./api/useRsvpDetails";
import { useUpdateRsvpDetails } from "./api/useEventMutations";
import type { RsvpQuestions } from "./gatheringExtras";
import { GatheringRsvpDetailsQuestions } from "./GatheringRsvpDetailsQuestions";
import { GatheringRsvpGuestCountField } from "./GatheringRsvpGuestCountField";
import { RsvpDetailsLoadError } from "./RsvpDetailsLoadError";
import { useHasRsvpCutoffPassed } from "./rsvpCutoff";
import { rsvpDetailsSaveErrorMessage } from "./rsvpErrors";
import {
  answersFromSaved,
  askedAnswersPayload,
  askedRsvpQuestions,
  type RsvpDetailsAnswerKey,
  type RsvpDetailsAnswers,
} from "./rsvpDetailsAnswers";
import styles from "./GatheringDetailPanels.module.css";

/** Stable canonical ids — never the translated label. `SegmentedControl` only
 *  knows display strings, so the state stores the id and maps to/from the
 *  current-language label at the edges. Matches the backend's
 *  `RsvpDetailsVisibility` one-to-one, so no translation layer on save. */
const VISIBILITY_IDS: RsvpDetailsVisibility[] = [
  "everyone",
  "connections",
  "justMe",
];
const VISIBILITY_DEFAULT: RsvpDetailsVisibility = "connections";

/** How many extra people a member may declare from this sheet. Capacity is
 *  measured in seats, so every number here is a seat the host has to lay. */
const MAX_GUESTS = 3;

/**
 * "Anything we should know?" — the plus-one count and the access/dietary
 * needs, asked on the gathering's OWN page (PRD-187).
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
  onClose,
}: {
  slug: string;
  /** Which optional questions this gathering asks. A detail from before the
   *  field existed carries none, and asks what this form always asked
   *  (ruling R8). */
  rsvpQuestions?: RsvpQuestions;
  /** The host's own question in their own words, or null/absent for none. */
  customRsvpQuestion?: string | null;
  /** When RSVPs close for members, or null when they stay open until the
   *  gathering ends. Past it a member may lower their guest count only. */
  rsvpClosesAt: Date | null;
  /** The host or a co-host, whom the server lets add guests after the
   *  cutoff. */
  isOrganizer: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const {
    data: saved,
    isError: hasSavedDetailsError,
    isFetching: isFetchingSavedDetails,
    refetch: refetchSavedDetails,
  } = useRsvpDetails(slug);
  const update = useUpdateRsvpDetails(slug);
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

  const visibilityLabel: Record<RsvpDetailsVisibility, string> = {
    everyone: t("gatherings:rsvpDetails.visibility.everyone"),
    connections: t("gatherings:rsvpDetails.visibility.connections"),
    justMe: t("gatherings:rsvpDetails.visibility.justMe"),
  };
  // Past the host's cutoff the server refuses a member's raise and lets an
  // organiser through, so a member's options stop at the count they saved.
  // Until that count lands the options stay open and the server answers.
  const hasCutoffPassed = useHasRsvpCutoffPassed(rsvpClosesAt);
  const isGuestRaiseClosed =
    !demoMode && hasCutoffPassed && !isOrganizer && saved != null;
  const maxGuestCount =
    isGuestRaiseClosed && saved
      ? saved.guestCount
      : Math.max(MAX_GUESTS, saved?.guestCount ?? 0);
  // A cutoff that passes while the sheet is open shrinks the options under a
  // higher pick, so the shown value and the payload both hold to the ceiling.
  const clampedGuestCount = Math.min(guestCount, maxGuestCount);
  // Live saves wait for the saved details: a save sent before they land would
  // write a zero guest count and blank answers over what is stored.
  const isAwaitingSavedDetails = !demoMode && saved === undefined;
  // A failed load leaves nothing to seed the form from, so the fields give way
  // to a retry and Save stays held by `isAwaitingSavedDetails`. A background
  // refetch that fails after a load keeps the loaded form.
  const isSavedDetailsLoadError =
    isAwaitingSavedDetails && hasSavedDetailsError;

  const save = () => {
    if (demoMode) {
      onClose();
      showToast(t("gatherings:rsvpDetails.savedToast"), "success");
      return;
    }
    const details: UpdateRsvpDetailsDto = {
      guestCount: clampedGuestCount,
      visibility,
      ...askedAnswersPayload(answers, asked),
    };
    update.mutate(details, {
      onSuccess: () => {
        onClose();
        showToast(t("gatherings:rsvpDetails.savedToast"), "success");
      },
      onError: (error) =>
        showToast(rsvpDetailsSaveErrorMessage(error, t), "error"),
    });
  };

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
          <div className={styles.detailsPrivacyNote}>
            {t("gatherings:rsvpDetails.privacyNote")}
          </div>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:rsvpDetails.cancelCta")}
          </Button>
          <Button
            variant="jade"
            onClick={save}
            disabled={update.isPending || isAwaitingSavedDetails}
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
            onGuestCountChange={setGuestCount}
          />

          <GatheringRsvpDetailsQuestions
            asked={asked}
            answers={answers}
            onAnswerChange={updateAnswer}
          />

          <div className={styles.detailsField}>
            <div className={styles.detailsLabel}>
              {t("gatherings:rsvpDetails.whoSeesLabel")}
            </div>
            <SegmentedControl
              fullWidth
              label={t("gatherings:rsvpDetails.whoSeesLabel")}
              options={VISIBILITY_IDS.map((id) => visibilityLabel[id])}
              value={visibilityLabel[visibility]}
              onChange={(label) =>
                setVisibility(
                  VISIBILITY_IDS.find((id) => visibilityLabel[id] === label) ??
                    VISIBILITY_DEFAULT,
                )
              }
            />
          </div>
        </>
      )}
    </Modal>
  );
}
