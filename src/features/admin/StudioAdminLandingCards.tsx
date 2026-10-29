import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LANDING_LIMITS } from "../studio/api/studio.types";
import {
  useRemoveLandingCard,
  useReorderLandingCards,
} from "./api/useStudioAdminLandingMutations";
import type {
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingDTO,
} from "./api/studioLandingAdmin.api";
import { StudioAdminLandingCardDialog } from "./StudioAdminLandingCardDialog";
import { StudioAdminLandingCardRow } from "./StudioAdminLandingCardRow";
import { movedIds, studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./StudioAdminLandingCards.module.css";

type CardDialog =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; card: AdminStudioLandingArtistCardDTO };

/** The artist cards of the Studio page: the list in page order (drag handle,
 *  Move up, Move down, Edit card, Remove card) and the add and edit dialog. */
export function StudioAdminLandingCards({
  landing,
}: {
  landing: AdminStudioLandingDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const fullLineId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reorder = useReorderLandingCards();
  const remove = useRemoveLandingCard();
  const [dialog, setDialog] = useState<CardDialog>({ kind: "closed" });
  const [removeTarget, setRemoveTarget] =
    useState<AdminStudioLandingArtistCardDTO | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const cards = landing.artistCards;
  const isFull = cards.length >= STUDIO_LANDING_LIMITS.artistCardsMax;
  const isBusy = reorder.isPending || remove.isPending;

  const toastError = (cause: unknown) =>
    showToast(t(studioAdminSaveErrorKeyOf(cause)), "error");

  function move(card: AdminStudioLandingArtistCardDTO, targetIndex: number) {
    const cardIds = movedIds(
      cards.map((candidate) => candidate.id),
      card.id,
      targetIndex,
    );
    if (!cardIds || isBusy) return;
    reorder.mutate(
      { cardIds },
      {
        onSuccess: () =>
          setStatusMessage(
            t("admin:studioAdmin.moved", {
              name: card.artist.name,
              position: targetIndex + 1,
            }),
          ),
        onError: toastError,
      },
    );
  }

  function confirmRemove(card: AdminStudioLandingArtistCardDTO) {
    const removedIndex = cards.indexOf(card);
    remove.mutate(
      { cardId: card.id },
      {
        onSuccess: () => {
          setRemoveTarget(null);
          showToast(
            t("admin:studioAdmin.landing.cards.removed", {
              name: card.artist.name,
            }),
            "success",
          );
          focusNeighbourControl({
            list: listRef.current,
            index: removedIndex,
            findControl: (row) =>
              row.querySelector<HTMLElement>("[data-card-remove]"),
            fallback: headingRef.current,
          });
        },
        onError: (cause) => {
          setRemoveTarget(null);
          toastError(cause);
        },
      },
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <div className={css.head}>
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className={css.title}>
          {t("admin:studioAdmin.landing.cards.heading")}
        </h2>
        <Button
          variant="primary"
          size="sm"
          aria-disabled={isFull || undefined}
          aria-describedby={isFull ? fullLineId : undefined}
          onClick={() => {
            if (!isFull) setDialog({ kind: "add" });
          }}
        >
          {t("admin:studioAdmin.landing.cards.addCta")}
        </Button>
      </div>
      <p className={css.sub}>{t("admin:studioAdmin.landing.cards.sub")}</p>
      <Collapse isOpen={isFull}>
        <p id={fullLineId} className={css.hint}>
          {t("admin:studioAdmin.landing.cards.full")}
        </p>
      </Collapse>
      <Collapse isOpen={cards.length === 0}>
        <p className={css.hint}>{t("admin:studioAdmin.landing.cards.empty")}</p>
      </Collapse>
      <ul ref={listRef} className={css.cardList}>
        <AnimatePresence initial={false}>
          {cards.map((card, index) => (
            <StudioAdminLandingCardRow
              key={card.id}
              card={card}
              index={index}
              count={cards.length}
              isBusy={isBusy}
              onMove={(targetIndex) => move(card, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = cards.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) move(dragged, index);
              }}
              onEdit={() => setDialog({ kind: "edit", card })}
              onRemove={() => setRemoveTarget(card)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <AnimatePresence>
        {dialog.kind !== "closed" && (
          <StudioAdminLandingCardDialog
            key={dialog.kind === "edit" ? dialog.card.id : "add"}
            card={dialog.kind === "edit" ? dialog.card : null}
            onClose={() => setDialog({ kind: "closed" })}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={removeTarget !== null}
        tone="destructive"
        loading={remove.isPending}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) confirmRemove(removeTarget);
        }}
        title={t("admin:studioAdmin.landing.cards.removeConfirm.title", {
          name: removeTarget?.artist.name ?? "",
        })}
        description={t("admin:studioAdmin.landing.cards.removeConfirm.body")}
        confirmLabel={t("admin:studioAdmin.landing.cards.removeCta")}
      />
    </section>
  );
}
