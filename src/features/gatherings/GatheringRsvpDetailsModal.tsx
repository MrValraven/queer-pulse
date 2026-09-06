import { useState } from "react";
import { Button, Modal, SegmentedControl } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { RsvpDetailsVisibility } from "./api/events.api";
import { useRsvpDetails } from "./api/useRsvpDetails";
import { useUpdateRsvpDetails } from "./api/useEventMutations";
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
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { data: saved } = useRsvpDetails(slug);
  const update = useUpdateRsvpDetails(slug);

  const [guestCount, setGuestCount] = useState(0);
  const [accessNeeds, setAccessNeeds] = useState("");
  const [dietaryNeeds, setDietaryNeeds] = useState("");
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
      setAccessNeeds(saved.accessNeeds ?? "");
      setDietaryNeeds(saved.dietaryNeeds ?? "");
      if (saved.visibility) setVisibility(saved.visibility);
    }
  }

  const visibilityLabel: Record<RsvpDetailsVisibility, string> = {
    everyone: t("gatherings:rsvpDetails.visibility.everyone"),
    connections: t("gatherings:rsvpDetails.visibility.connections"),
    justMe: t("gatherings:rsvpDetails.visibility.justMe"),
  };
  const guestOptions = Array.from({ length: MAX_GUESTS + 1 }, (_, count) =>
    t("gatherings:rsvpDetails.guestOption", { count }),
  );

  const save = () => {
    if (demoMode) {
      onClose();
      showToast(t("gatherings:rsvpDetails.savedToast"), "success");
      return;
    }
    update.mutate(
      { guestCount, accessNeeds, dietaryNeeds, visibility },
      {
        onSuccess: () => {
          onClose();
          showToast(t("gatherings:rsvpDetails.savedToast"), "success");
        },
        onError: () =>
          showToast(t("gatherings:rsvpDetails.saveErrorToast"), "error"),
      },
    );
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
          <Button variant="jade" onClick={save} disabled={update.isPending}>
            {t("gatherings:rsvpDetails.saveCta")}
          </Button>
        </>
      }
    >
      <div className={styles.detailsField}>
        {/* A <div>, not a <label>: a `SegmentedControl` is a `role="group"` of
            buttons, which a <label> cannot be associated with. The group takes
            its accessible name from the `label` prop instead. */}
        <div className={styles.detailsLabel}>
          {t("gatherings:rsvpDetails.guestsLabel")}
        </div>
        <SegmentedControl
          fullWidth
          label={t("gatherings:rsvpDetails.guestsLabel")}
          options={guestOptions}
          value={guestOptions[guestCount] ?? guestOptions[0]!}
          onChange={(label) => setGuestCount(guestOptions.indexOf(label))}
        />
        <p className={styles.detailsHint}>
          {t("gatherings:rsvpDetails.guestsHint")}
        </p>
      </div>

      <div className={styles.detailsField}>
        <label className={styles.detailsLabel} htmlFor="gathering-rsvp-access">
          {t("gatherings:rsvpDetails.accessLabel")}
        </label>
        <textarea
          id="gathering-rsvp-access"
          className={styles.detailsTextarea}
          value={accessNeeds}
          onChange={(event) => setAccessNeeds(event.target.value)}
          placeholder={t("gatherings:rsvpDetails.accessPlaceholder")}
        />
      </div>

      <div className={styles.detailsField}>
        <label className={styles.detailsLabel} htmlFor="gathering-rsvp-dietary">
          {t("gatherings:rsvpDetails.dietaryLabel")}
        </label>
        <textarea
          id="gathering-rsvp-dietary"
          className={styles.detailsTextarea}
          value={dietaryNeeds}
          onChange={(event) => setDietaryNeeds(event.target.value)}
          placeholder={t("gatherings:rsvpDetails.dietaryPlaceholder")}
        />
      </div>

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
    </Modal>
  );
}
