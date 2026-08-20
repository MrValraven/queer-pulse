import { useEffect, useId, useState } from "react";
import { Button, SkeletonCard } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { dtoToDraft } from "../marketing/listBusiness/dtoToDraft";
import {
  useOwnedListing,
  useUpdateListing,
} from "../marketing/listBusiness/api/useListings";
import styles from "./QuickEditListingModal.module.css";

const BLURB_MAX_LENGTH = 140;
const HOURS_NOTE_MAX_LENGTH = 120;

/**
 * A lightweight alternative to the full multi-step `ListingWizard` (gap-audit
 * HSG-9): fixes the common single-field corrections (blurb, hours note,
 * phone, website) in one screen instead of re-entering the whole wizard.
 * Anything structural (categories, address, photos, tags) still goes through
 * "Full editor", linked at the bottom.
 */
export function QuickEditListingModal({
  editRef,
  placeName,
  onClose,
}: {
  editRef: string;
  placeName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { listing, isLoading, error } = useOwnedListing(editRef);
  const updateListing = useUpdateListing();

  const [blurb, setBlurb] = useState("");
  const [hoursNote, setHoursNote] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [seeded, setSeeded] = useState(false);

  // Seed the local fields once the owned listing resolves — a plain effect
  // rather than `initialData` since the fields are locally editable from here.
  useEffect(() => {
    if (!listing || seeded) return;
    setBlurb(listing.blurb);
    setHoursNote(listing.hoursNote);
    setWebsite(listing.social.website);
    setPhone(listing.social.phone);
    setSeeded(true);
  }, [listing, seeded]);

  const blurbId = useId();
  const hoursNoteId = useId();
  const websiteId = useId();
  const phoneId = useId();

  const canSubmit = seeded && !updateListing.isPending;

  const submit = () => {
    if (!listing || !canSubmit) return;
    const draft = dtoToDraft(listing);
    updateListing.mutate(
      {
        ref: editRef,
        draft: {
          ...draft,
          blurb,
          hoursNote,
          social: { ...draft.social, website, phone },
        },
      },
      {
        onSuccess: () => {
          onClose();
          showToast(t("members:places.quickEdit.savedToast"), "success");
        },
        onError: () =>
          showToast(t("members:places.quickEdit.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("members:places.quickEdit.title")}
      onClose={onClose}
      sub={t("members:places.quickEdit.sub", { name: placeName })}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("members:places.quickEdit.cancel")}
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            {updateListing.isPending
              ? t("members:places.quickEdit.saving")
              : t("members:places.quickEdit.save")}
          </Button>
        </>
      }
    >
      {isLoading || error || !listing ? (
        <SkeletonCard />
      ) : (
        <>
          <label className={styles.field} htmlFor={blurbId}>
            {t("members:places.quickEdit.blurbLabel")}
          </label>
          <p className={styles.helper}>
            {t("members:places.quickEdit.blurbHelper")}
          </p>
          <input
            id={blurbId}
            type="text"
            className={styles.input}
            value={blurb}
            onChange={(event) =>
              setBlurb(event.target.value.slice(0, BLURB_MAX_LENGTH))
            }
            maxLength={BLURB_MAX_LENGTH}
          />
          <div className={styles.counter}>
            {blurb.length}/{BLURB_MAX_LENGTH}
          </div>

          <label className={styles.field} htmlFor={hoursNoteId}>
            {t("members:places.quickEdit.hoursNoteLabel")}
          </label>
          <p className={styles.helper}>
            {t("members:places.quickEdit.hoursNoteHelper")}
          </p>
          <textarea
            id={hoursNoteId}
            className={styles.textarea}
            value={hoursNote}
            onChange={(event) =>
              setHoursNote(event.target.value.slice(0, HOURS_NOTE_MAX_LENGTH))
            }
            maxLength={HOURS_NOTE_MAX_LENGTH}
          />

          <label className={styles.field} htmlFor={websiteId}>
            {t("members:places.quickEdit.websiteLabel")}
          </label>
          <input
            id={websiteId}
            type="url"
            className={styles.input}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />

          <label className={styles.field} htmlFor={phoneId}>
            {t("members:places.quickEdit.phoneLabel")}
          </label>
          <input
            id={phoneId}
            type="tel"
            className={styles.input}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          <p className={styles.moreLink}>
            <Translation
              i18nKey="members:places.quickEdit.moreLink"
              components={{
                a: (
                  <a
                    href={routes.listBusinessEdit.replace(":ref", editRef)}
                  />
                ),
              }}
            />
          </p>
        </>
      )}
    </Modal>
  );
}
