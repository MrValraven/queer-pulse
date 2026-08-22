import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  SegmentedControl,
  Toggle,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useRsvpDetails } from "../gatherings/api/useRsvpDetails";
import { useUpdateRsvpDetails } from "../gatherings/api/useEventMutations";
import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { RsvpContributionField, RsvpGuestField } from "./RsvpDetailsFields";

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
  const { data: savedDetails } = useRsvpDetails(ev?.slug);
  const updateRsvpDetails = useUpdateRsvpDetails(ev?.slug);

  const [guest, setGuest] = useState(false);
  const [vis, setVis] = useState<Visibility>(VIS_DEFAULT);
  const [quiet, setQuiet] = useState(false);
  const [accessNeeds, setAccessNeeds] = useState("");
  const [dietaryNeeds, setDietaryNeeds] = useState("");

  // Seed the editable fields from the caller's real saved values once they
  // load — never fires in demo mode (`savedDetails` stays undefined there),
  // so the modal keeps its prior all-local starting state.
  useEffect(() => {
    if (!savedDetails) return;
    setGuest(savedDetails.guestCount > 0);
    setAccessNeeds(savedDetails.accessNeeds ?? "");
    setDietaryNeeds(savedDetails.dietaryNeeds ?? "");
    if (savedDetails.visibility) setVis(savedDetails.visibility);
  }, [savedDetails]);

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
    updateRsvpDetails.mutate(
      {
        guestCount: guest ? 1 : 0,
        accessNeeds,
        dietaryNeeds,
        visibility: vis,
      },
      {
        onSuccess: () => {
          closeDetails();
          toast(t("myevents:rsvpModal.savedToast"), "success");
        },
        onError: () => toast(t("myevents:rsvpModal.saveErrorToast"), "info"),
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
            disabled={updateRsvpDetails.isPending}
          >
            {t("myevents:rsvpModal.saveCta")}
          </Button>
        </>
      }
    >
      <RsvpGuestField
        isBringingGuest={guest}
        onToggleGuest={() => setGuest((g) => !g)}
      />

      {ev?.sliding && <RsvpContributionField />}

      <div className={sx("field")}>
        <label className={sx("field-label")} htmlFor="rsvp-access">
          {t("myevents:rsvpModal.accessNeeds")}
        </label>
        <textarea
          id="rsvp-access"
          value={accessNeeds}
          onChange={(event) => setAccessNeeds(event.target.value)}
          placeholder={t("myevents:rsvpModal.accessPlaceholder")}
        />
      </div>
      <div className={sx("field")}>
        <label className={sx("field-label")} htmlFor="rsvp-dietary">
          {t("myevents:rsvpModal.dietaryNeeds")}
        </label>
        <textarea
          id="rsvp-dietary"
          value={dietaryNeeds}
          onChange={(event) => setDietaryNeeds(event.target.value)}
          placeholder={t("myevents:rsvpModal.dietaryPlaceholder")}
        />
      </div>
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
    </Modal>
  );
}
