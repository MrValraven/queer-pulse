import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRemoveLandingPhoto } from "./api/useStudioAdminLandingMutations";
import type {
  AdminStudioLandingDTO,
  AdminStudioLandingPhotoDTO,
  StudioLandingPhotoSlot,
} from "./api/studioLandingAdmin.api";
import { StudioAdminLandingPhotoDialog } from "./StudioAdminLandingPhotoDialog";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import css from "./StudioAdminLandingCards.module.css";

/** The catalog line naming each slot. */
const SLOT_LABEL_KEY: Record<StudioLandingPhotoSlot, string> = {
  hero: "admin:studioAdmin.landing.photos.slot.hero",
  manifesto: "admin:studioAdmin.landing.photos.slot.manifesto",
};

const PHOTO_SLOTS: StudioLandingPhotoSlot[] = ["hero", "manifesto"];

/** One slot: the current image (or "No photo"), its descriptions, credit and
 *  Replace and Remove, or Add photo when the slot is empty. */
function PhotoTile({
  slot,
  photo,
  onEdit,
  onRemove,
}: {
  slot: StudioLandingPhotoSlot;
  photo: AdminStudioLandingPhotoDTO | null;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const editId = useId();
  const removeId = useId();
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  return (
    <li className={css.photoTile} aria-labelledby={headingId}>
      <span id={headingId} className={css.cardName}>
        {t(SLOT_LABEL_KEY[slot])}
      </span>
      <div className={css.photoFrame}>
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={photo?.url ?? "empty"}
            style={{ width: "100%", height: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            {photo ? (
              <img
                className={css.photoImage}
                src={photo.url}
                alt={photo.altText[language]}
                loading="lazy"
              />
            ) : (
              <span className={css.photoEmpty}>
                {t("admin:studioAdmin.landing.photos.empty")}
              </span>
            )}
          </m.div>
        </AnimatePresence>
      </div>
      <Collapse isOpen={photo !== null}>
        <div className={css.photoText}>
          <span>{photo?.altText.en}</span>
          <span>{photo?.altText.pt}</span>
          {photo?.credit && <span>{photo.credit}</span>}
          {photo && (
            <span>
              {t("admin:studioAdmin.landing.cards.consentedOn", {
                date: fmt.date(new Date(photo.consentedAt)),
              })}
            </span>
          )}
        </div>
      </Collapse>
      <div className={css.actions}>
        <Button
          id={editId}
          variant="ghost"
          size="sm"
          aria-labelledby={`${editId} ${headingId}`}
          onClick={onEdit}
        >
          {t(
            photo
              ? "admin:studioAdmin.landing.photos.replaceCta"
              : "admin:studioAdmin.landing.photos.addCta",
          )}
        </Button>
        <Collapse isOpen={photo !== null}>
          <Button
            id={removeId}
            variant="ghost"
            size="sm"
            aria-labelledby={`${removeId} ${headingId}`}
            onClick={onRemove}
          >
            {t("admin:studioAdmin.landing.photos.removeCta")}
          </Button>
        </Collapse>
      </div>
    </li>
  );
}

/** The two photo slots of the Studio page, side by side. */
export function StudioAdminLandingPhotos({
  landing,
}: {
  landing: AdminStudioLandingDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const remove = useRemoveLandingPhoto();
  const [editSlot, setEditSlot] = useState<StudioLandingPhotoSlot | null>(null);
  const [removeSlot, setRemoveSlot] = useState<StudioLandingPhotoSlot | null>(
    null,
  );

  function confirmRemove(slot: StudioLandingPhotoSlot) {
    remove.mutate(
      { slot },
      {
        onSuccess: () =>
          showToast(t("admin:studioAdmin.landing.photos.removed"), "success"),
        onError: (cause) =>
          showToast(t(studioAdminSaveErrorKeyOf(cause)), "error"),
        onSettled: () => setRemoveSlot(null),
      },
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={css.title}>
        {t("admin:studioAdmin.landing.photos.heading")}
      </h2>
      <p className={css.sub}>{t("admin:studioAdmin.landing.photos.sub")}</p>
      <ul className={css.photoGrid}>
        {PHOTO_SLOTS.map((slot) => (
          <PhotoTile
            key={slot}
            slot={slot}
            photo={landing.photos[slot]}
            onEdit={() => setEditSlot(slot)}
            onRemove={() => setRemoveSlot(slot)}
          />
        ))}
      </ul>
      <AnimatePresence>
        {editSlot && (
          <StudioAdminLandingPhotoDialog
            key={editSlot}
            slot={editSlot}
            slotLabel={t(SLOT_LABEL_KEY[editSlot])}
            photo={landing.photos[editSlot]}
            onClose={() => setEditSlot(null)}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={removeSlot !== null}
        tone="destructive"
        loading={remove.isPending}
        onClose={() => setRemoveSlot(null)}
        onConfirm={() => {
          if (removeSlot) confirmRemove(removeSlot);
        }}
        title={t("admin:studioAdmin.landing.photos.removeConfirm.title")}
        description={t("admin:studioAdmin.landing.photos.removeConfirm.body")}
        confirmLabel={t("admin:studioAdmin.landing.photos.removeCta")}
      />
    </section>
  );
}
