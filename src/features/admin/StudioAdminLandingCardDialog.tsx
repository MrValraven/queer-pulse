import { useId, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, CheckLine, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LANDING_LIMITS } from "../studio/api/studio.types";
import {
  useCreateLandingCard,
  useUpdateLandingCard,
} from "./api/useStudioAdminLandingMutations";
import type {
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingPersonaOptionDTO,
} from "./api/studioLandingAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { StudioAdminPersonaSearch } from "./StudioAdminPersonaSearch";
import css from "./StudioAdminLandingCards.module.css";

/** Add (card null) or edit an artist card: the persona (add only), the quote
 *  and the consent tick. Every save asks for consent again, so the box starts
 *  unticked. */
export function StudioAdminLandingCardDialog({
  card,
  onClose,
}: {
  card: AdminStudioLandingArtistCardDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateLandingCard();
  const update = useUpdateLandingCard();
  const searchRef = useRef<HTMLInputElement>(null);
  const quoteId = useId();
  const quoteHelpId = useId();
  const quoteCounterId = useId();
  const [picked, setPicked] =
    useState<AdminStudioLandingPersonaOptionDTO | null>(null);
  const [quote, setQuote] = useState(card?.quote ?? "");
  const [hasConsent, setHasConsent] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const isPending = create.isPending || update.isPending;
  const remaining = STUDIO_LANDING_LIMITS.quoteMaxLength - quote.trim().length;
  const artist = card?.artist ?? picked?.artist ?? null;
  const isReady = hasConsent && remaining >= 0 && artist !== null;

  function submit() {
    if (isPending || !isReady || !artist) return;
    const trimmedQuote = quote.trim();
    const body = { quote: trimmedQuote === "" ? null : trimmedQuote };
    setErrorKey(null);
    const callbacks = {
      onSuccess: () => {
        showToast(
          t("admin:studioAdmin.landing.cards.saved", { name: artist.name }),
          "success",
        );
        onClose();
      },
      onError: (cause: unknown) =>
        setErrorKey(studioAdminSaveErrorKeyOf(cause)),
    };
    if (card)
      update.mutate({ cardId: card.id, ...body, hasConsent: true }, callbacks);
    else
      create.mutate(
        { subprofileId: artist.id, ...body, hasConsent: true },
        callbacks,
      );
  }

  return (
    <Modal
      title={
        card
          ? t("admin:studioAdmin.landing.cardDialog.editTitle", {
              name: card.artist.name,
            })
          : t("admin:studioAdmin.landing.cardDialog.addTitle")
      }
      onClose={onClose}
      initialFocusRef={searchRef}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={!isReady || isPending || undefined}
            aria-busy={isPending || undefined}
            onClick={submit}
          >
            {t("admin:studioAdmin.landing.cardDialog.saveCta")}
          </Button>
        </>
      }
    >
      <form
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {!card && (
          <StudioAdminPersonaSearch
            inputRef={searchRef}
            isPickable={(option) => option.isEligible && !option.hasCard}
            onPick={(option) => {
              setPicked(option);
              setErrorKey(null);
            }}
          />
        )}
        <Collapse isOpen={artist !== null}>
          <p className={css.chosen}>
            <span className={css.resultMeta}>
              {t("admin:studioAdmin.landing.cardDialog.artistLabel")}
            </span>{" "}
            {artist?.name}
          </p>
        </Collapse>
        <label htmlFor={quoteId} className={css.fieldLabel}>
          {t("admin:studioAdmin.landing.cardDialog.quoteLabel")}
        </label>
        <textarea
          id={quoteId}
          className={css.textarea}
          rows={3}
          value={quote}
          aria-invalid={remaining < 0 || undefined}
          aria-describedby={`${quoteHelpId} ${quoteCounterId}`}
          onChange={(event) => setQuote(event.target.value)}
        />
        <p id={quoteHelpId} className={css.fieldHint}>
          {t("admin:studioAdmin.landing.cardDialog.quoteHelp")}
        </p>
        <p id={quoteCounterId} className={css.fieldHint}>
          {t("messages:request.charactersLeft", { remaining })}
        </p>
        <div className={css.consent}>
          <CheckLine
            checked={hasConsent}
            onChange={setHasConsent}
            title={t("admin:studioAdmin.landing.cardDialog.consent")}
          />
        </div>
        <Collapse isOpen={errorKey !== null}>
          <p className={css.error} role="alert">
            {errorKey ? t(errorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
