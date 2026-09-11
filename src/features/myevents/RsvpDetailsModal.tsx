import { useState } from "react";
import {
  Button,
  Modal,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useRsvpDetails,
  useRsvpDetailsQuestions,
} from "../gatherings/api/useRsvpDetails";
import { useUpdateRsvpDetails } from "../gatherings/api/useEventMutations";
import {
  answersFromSaved,
  askedAnswersPayload,
  askedRsvpQuestions,
  type RsvpDetailsAnswerKey,
  type RsvpDetailsAnswers,
} from "../gatherings/rsvpDetailsAnswers";
import { useHasRsvpCutoffPassed } from "../gatherings/rsvpCutoff";
import { isRsvpsClosedError } from "../gatherings/rsvpErrors";
import { RsvpDetailsLoadError } from "../gatherings/RsvpDetailsLoadError";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import {
  RsvpContributionField,
  RsvpDetailsQuestionFields,
  RsvpGuestField,
} from "./RsvpDetailsFields";

/** Stable canonical ids — never the translated label itself (i18n sweep
 * §5.1). `SegmentedControl` only knows display strings, so `vis` state stores
 * the id and is mapped to/from the current-language label at the edges.
 * Matches the backend's `RsvpDetailsVisibility` one-to-one (see
 * `events.api.ts`), so no translation layer is needed on save. */
type Visibility = "everyone" | "connections" | "justMe";
const VIS_IDS: Visibility[] = ["everyone", "connections", "justMe"];
const VIS_DEFAULT: Visibility = "connections";

/**
 * "Anything we should know?" RSVP details editor. Mounted only while open.
 * Live mode loads the caller's real saved values on open (`useRsvpDetails`)
 * and persists guest/access/dietary/visibility for real on save
 * (`useUpdateRsvpDetails`, `PATCH /events/:slug/rsvp/details`) — demo mode
 * keeps the prior local-only starting state, since there's nothing real to
 * load or save there. The sliding-scale contribution picker below stays
 * decorative in both modes: gatherings have no payment/ticketing concept on
 * the backend at all (see `PricingStep`'s removal from the create wizard),
 * so there is nothing real to persist it against yet.
 */
export function RsvpDetailsModal() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { details, closeDetails, byId, toast } = useMyEvents();
  const ev = details.eventId ? byId(details.eventId) : undefined;
  const {
    data: savedDetails,
    isError: hasSavedDetailsError,
    isFetching: isFetchingSavedDetails,
    refetch: refetchSavedDetails,
  } = useRsvpDetails(ev?.slug);
  // The same detail fetch carries the gathering's questions, so R8 holds here
  // exactly as on the gathering page. Demo has no fetch, and a query still
  // loading has no answer yet: both ask what this form always asked.
  const { data: eventQuestions } = useRsvpDetailsQuestions(ev?.slug);
  const asked = askedRsvpQuestions(
    eventQuestions?.rsvpQuestions,
    eventQuestions?.customRsvpQuestion,
  );
  const updateRsvpDetails = useUpdateRsvpDetails(ev?.slug);

  const [guest, setGuest] = useState(false);
  const [vis, setVis] = useState<Visibility>(VIS_DEFAULT);
  const [quiet, setQuiet] = useState(false);
  const [answers, setAnswers] = useState<RsvpDetailsAnswers>(() =>
    answersFromSaved(null),
  );

  // Seed the editable fields from the caller's real saved values once they
  // load — never fires in demo mode (`savedDetails` stays undefined there),
  // so the modal keeps its prior all-local starting state. Adjusted during
  // render (React's documented pattern for resetting state when a loaded
  // value changes) rather than an effect, keyed on the query result's own
  // identity so it only re-seeds when a genuinely new value lands.
  const [previousSavedDetails, setPreviousSavedDetails] =
    useState(savedDetails);
  if (savedDetails !== previousSavedDetails) {
    setPreviousSavedDetails(savedDetails);
    if (savedDetails) {
      setGuest(savedDetails.guestCount > 0);
      setAnswers(answersFromSaved(savedDetails));
      if (savedDetails.visibility) setVis(savedDetails.visibility);
    }
  }

  const updateAnswer = (key: RsvpDetailsAnswerKey, value: string) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  // Past the cutoff the server refuses a member's guest raise. A member who
  // already saved a guest may switch the plus-one off and back on, since that
  // sends no raise. While the detail loads the plus-one stays open and the
  // server answers.
  const hasCutoffPassed = useHasRsvpCutoffPassed(eventQuestions?.rsvpClosesAt);
  const hasSavedGuest = (savedDetails?.guestCount ?? 0) > 0;
  const isAddingGuestLocked =
    !demoMode &&
    eventQuestions != null &&
    !eventQuestions.isOrganizer &&
    hasCutoffPassed &&
    !hasSavedGuest;
  // Live saves wait for the saved details: a save sent before they land would
  // write blank answers over what is stored. Without a slug the save only
  // closes the sheet, so it stays open.
  const isAwaitingSavedDetails =
    !demoMode && Boolean(ev?.slug) && savedDetails === undefined;
  // A failed load leaves nothing to seed the form from, so the fields give way
  // to a retry and Save stays held by `isAwaitingSavedDetails`.
  const isSavedDetailsLoadError =
    isAwaitingSavedDetails && hasSavedDetailsError;

  const visLabel: Record<Visibility, string> = {
    everyone: t("myevents:rsvpModal.visibility.everyone"),
    connections: t("myevents:rsvpModal.visibility.connections"),
    justMe: t("myevents:rsvpModal.visibility.justMe"),
  };
  const visOptions = VIS_IDS.map((id) => visLabel[id]);
  const labelToVisId = (label: string): Visibility =>
    VIS_IDS.find((id) => visLabel[id] === label) ?? VIS_DEFAULT;

  const save = () => {
    if (demoMode || !ev?.slug) {
      closeDetails();
      toast(t("myevents:rsvpModal.savedToast"), "success");
      return;
    }
    // The checkbox says only "has guests", so the count goes out only when the
    // member switched it. A saved count of 2 to 10 stays as it is.
    const guestCountChange =
      guest === hasSavedGuest ? {} : { guestCount: guest ? 1 : 0 };
    updateRsvpDetails.mutate(
      {
        ...guestCountChange,
        visibility: vis,
        ...askedAnswersPayload(answers, asked),
      },
      {
        onSuccess: () => {
          closeDetails();
          toast(t("myevents:rsvpModal.savedToast"), "success");
        },
        onError: (error) =>
          toast(
            isRsvpsClosedError(error)
              ? t("myevents:rsvpModal.closedToast")
              : t("myevents:rsvpModal.saveErrorToast"),
            "info",
          ),
      },
    );
  };

  return (
    <Modal
      onClose={closeDetails}
      eyebrow={t("myevents:rsvpModal.eyebrow")}
      title={
        <Translation
          i18nKey="myevents:rsvpModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={ev?.title}
      footer={
        <>
          <div className={sx("modal-privacy")}>
            {t("myevents:rsvpModal.privacyNote")}
          </div>
          <Button variant="ghost" onClick={closeDetails}>
            {t("myevents:rsvpModal.cancelCta")}
          </Button>
          <Button
            variant="jade"
            onClick={save}
            disabled={updateRsvpDetails.isPending || isAwaitingSavedDetails}
          >
            {t("myevents:rsvpModal.saveCta")}
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
          <RsvpGuestField
            isBringingGuest={guest}
            isAddingGuestLocked={isAddingGuestLocked}
            onToggleGuest={() => setGuest((g) => !g)}
          />

          {ev?.sliding && <RsvpContributionField />}

          <RsvpDetailsQuestionFields
            asked={asked}
            answers={answers}
            onAnswerChange={updateAnswer}
          />
          <div className={sx("field")}>
            <label className={sx("field-label")}>
              {t("myevents:rsvpModal.whoSees")}
            </label>
            <SegmentedControl
              fullWidth
              options={visOptions}
              value={visLabel[vis]}
              onChange={(label) => setVis(labelToVisId(label))}
            />
          </div>
          <div className={sx("field")}>
            <div className={sx("set-row flush")}>
              <div className={sx("set-info")}>
                <div className={sx("set-t")}>
                  {t("myevents:rsvpModal.attendQuietly")}
                </div>
                <div className={sx("set-d")}>
                  {t("myevents:rsvpModal.attendQuietlyDesc")}
                </div>
              </div>
              <Toggle
                checked={quiet}
                onChange={setQuiet}
                label={t("myevents:rsvpModal.attendQuietly")}
              />
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
