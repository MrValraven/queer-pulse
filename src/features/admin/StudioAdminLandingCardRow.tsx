import { m, useIsPresent } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit3,
  FiMenu,
  FiTrash2,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { AdminStudioLandingArtistCardDTO } from "./api/studioLandingAdmin.api";
import { AdminAvatar, AdminChip } from "./ui";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminLandingCards.module.css";

/** The id a dragged card carries, kept apart from anything else dropped. */
const CARD_DRAG_TYPE = "application/x-studio-admin-landing-card";

/** One artist card: drag handle, avatar, name, quote, chips ("Not shown" when
 *  the persona fails the page's artist rule) and its four actions. */
export function StudioAdminLandingCardRow({
  card,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onEdit,
  onRemove,
}: {
  card: AdminStudioLandingArtistCardDTO;
  index: number;
  count: number;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedCardId: string) => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const name = card.artist.name;
  // Destructured so the compiler sees the two refs apart from the plain
  // values and handlers read during render.
  const {
    moveUpRef,
    moveDownRef,
    moveUp,
    moveDown,
    isFirst,
    isLast,
    handleProps,
    dropProps,
  } = useStudioAdminReorderRow({
    dragType: CARD_DRAG_TYPE,
    itemId: card.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  const duration = reducedMotion ? 0 : 0.22;

  return (
    <m.li
      layout="position"
      className={css.cardItem}
      inert={!isPresent}
      initial={{ opacity: 0, height: 0, overflow: "hidden" }}
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration }}
      {...dropProps}
    >
      <div className={css.cardRow}>
        <span
          className={css.dragHandle}
          aria-hidden
          title={t("admin:studioAdmin.dragAria", { name })}
          {...handleProps}
        >
          <FiMenu />
        </span>
        <AdminAvatar
          size="md"
          src={card.artist.avatarUrl ?? undefined}
          initials={initialsFromName(name, "?")}
          alt=""
        />
        <div className={css.cardMain}>
          <span className={css.cardName}>{name}</span>
          <span className={css.cardMeta}>
            {t("admin:studioAdmin.landing.cards.consentedOn", {
              date: fmt.date(new Date(card.consentedAt)),
            })}
          </span>
          {card.quote && <p className={css.cardQuote}>{card.quote}</p>}
          <div className={css.chipRow}>
            {card.isFoundingArtist && (
              <AdminChip tone="jade">
                {t("admin:studioAdmin.landing.personaSearch.isFounding")}
              </AdminChip>
            )}
            {!card.isShown && (
              <AdminChip tone="warn">
                {t("admin:studioAdmin.landing.cards.notShown")}
              </AdminChip>
            )}
          </div>
        </div>
        <div className={css.actions}>
          <Button
            ref={moveUpRef}
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.moveUpAria", { name })}
            aria-disabled={isBusy || isFirst || undefined}
            onClick={moveUp}
          >
            <FiArrowUp aria-hidden /> {t("admin:studioAdmin.moveUpCta")}
          </Button>
          <Button
            ref={moveDownRef}
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.moveDownAria", { name })}
            aria-disabled={isBusy || isLast || undefined}
            onClick={moveDown}
          >
            <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.landing.cards.editLabel", {
              name,
            })}
            onClick={onEdit}
          >
            <FiEdit3 aria-hidden />{" "}
            {t("admin:studioAdmin.landing.cards.editCta")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("admin:studioAdmin.landing.cards.removeLabel", {
              name,
            })}
            aria-disabled={isBusy || undefined}
            data-card-remove
            onClick={() => {
              if (!isBusy) onRemove();
            }}
          >
            <FiTrash2 aria-hidden />{" "}
            {t("admin:studioAdmin.landing.cards.removeCta")}
          </Button>
        </div>
      </div>
    </m.li>
  );
}
