import { useState } from "react";
import { FiCreditCard, FiTrash2 } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  Button,
  Eyebrow,
  SectionHead,
  SkeletonCard,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDeleteMyCard, useMyCards, useUpdateMyCard } from "./api/useMyCards";
import type { MyCardDTO } from "./api/cards.api";
import { isCardSelfRenewable } from "./cardExpiry";
import { CardPhotoConsent } from "./CardPhotoConsent";
import { CardPronounConsent } from "./CardPronounConsent";
import { CardRenewAction } from "./CardRenewAction";
import { CardStatusNotice } from "./CardStatusNotice";
import { DiscreetGate } from "./DiscreetGate";
import { MembershipCardFace } from "./MembershipCardFace";
import { RemoveMyCardModal } from "./RemoveMyCardModal";
import styles from "./MyCardsPage.module.css";

/**
 * Every membership card the member holds.
 *
 * Each card carries its OWN discreet gate, but `revealedCardId` is lifted
 * up here and passed to every gate as a CONTROLLED prop, so revealing card B
 * genuinely re-covers card A instead of A staying visually revealed with its
 * QR silently gone (each gate's own uncontrolled state would otherwise drift
 * from this page's `isActive` check on the very next card revealed).
 */
export function MyCardsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { cards, isLoading } = useMyCards();
  const { demoMode } = useDemoMode();
  const [revealedCardId, setRevealedCardId] = useState<string | null>(null);
  // Demo mode writes nothing, so a renewal there has to be remembered here or
  // the card would sit visibly expired under a success toast. In live mode the
  // wallet refetches and the server is the only source of the card's next
  // state, so nothing is overridden.
  const [demoRenewals, setDemoRenewals] = useState<Record<string, string>>({});
  const [cardPendingRemoval, setCardPendingRemoval] =
    useState<MyCardDTO | null>(null);
  const deleteCard = useDeleteMyCard();
  const updateCard = useUpdateMyCard();
  // A card prints the pronouns on the member's PROFILE rather than a copy of
  // its own, so whether they have set any decides between a working toggle and
  // a pointer to where to set them.
  const { pronouns } = useAccountIdentity();
  const hasProfilePronouns = Boolean(pronouns?.trim());

  const visibleCards: MyCardDTO[] = demoMode
    ? cards.map((card) => {
        const renewedExpiry = demoRenewals[card.id];
        return renewedExpiry
          ? { ...card, status: "active", expiresAt: renewedExpiry }
          : card;
      })
    : cards;

  const confirmRemoval = () => {
    if (!cardPendingRemoval || deleteCard.isPending) return;
    deleteCard.mutate(cardPendingRemoval.id, {
      onSuccess: () => {
        showToast(t("cards:remove.toast"), "success");
        setCardPendingRemoval(null);
      },
      onError: () => showToast(t("common:toast.saveFailed"), "error"),
    });
  };

  return (
    <AppShell>
      <div className={styles.page}>
        <Eyebrow>{t("cards:page.eyebrow")}</Eyebrow>
        <SectionHead
          title={t("cards:page.title")}
          subtitle={t("cards:page.dek")}
        />

        {isLoading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : visibleCards.length === 0 ? (
          <div className={styles.empty}>
            <FiCreditCard className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyTitle}>{t("cards:empty.title")}</p>
            <p className={styles.emptyBody}>{t("cards:empty.body")}</p>
          </div>
        ) : (
          <ul className={styles.grid}>
            {visibleCards.map((card) => (
              <li key={card.id} className={styles.cell}>
                <DiscreetGate
                  isRevealed={revealedCardId === card.id}
                  onVisibilityChange={(isRevealed) =>
                    setRevealedCardId(isRevealed ? card.id : null)
                  }
                >
                  {/* The gate hands down its quick-hide rather than drawing
                      it; the card mounts it beside the flip control. */}
                  {(hide) => (
                    <MembershipCardFace
                      card={card}
                      isActive={revealedCardId === card.id}
                      onHide={hide}
                    />
                  )}
                </DiscreetGate>
                <CardStatusNotice card={card} />
                {/* Only where the issuing community actually runs photo
                    cards. A community that does not has nothing here for a
                    member to decide. */}
                {card.program.allowsMemberPhoto && (
                  <CardPhotoConsent
                    card={card}
                    isPending={updateCard.isPending}
                    onChange={(isPhotoHidden) =>
                      updateCard.mutate(
                        { cardId: card.id, isPhotoHidden },
                        {
                          onError: () =>
                            showToast(t("common:toast.saveFailed"), "error"),
                        },
                      )
                    }
                  />
                )}
                {/* Only where the issuing community actually prints
                    pronouns, on the same rule as the photo consent above. */}
                {card.program.allowsPronouns && (
                  <CardPronounConsent
                    card={card}
                    hasProfilePronouns={hasProfilePronouns}
                    isPending={updateCard.isPending}
                    onChange={(isPronounsHidden) =>
                      updateCard.mutate(
                        { cardId: card.id, isPronounsHidden },
                        {
                          onError: () =>
                            showToast(t("common:toast.saveFailed"), "error"),
                        },
                      )
                    }
                  />
                )}
                {/* Only where the issuing community opted in and the term is
                    inside its last thirty days (or already past). A card an
                    issuer paused or revoked is deliberately excluded: they
                    took it away on purpose, and the server refuses it too. */}
                {isCardSelfRenewable(card) && (
                  <CardRenewAction
                    card={card}
                    onRenewed={
                      demoMode
                        ? (expiresAt) =>
                            setDemoRenewals((current) => ({
                              ...current,
                              [card.id]: expiresAt,
                            }))
                        : undefined
                    }
                  />
                )}
                {/* A suspension is by nature temporary: a paused programme
                    resolves every holder's card to "suspended" and can come
                    back at any moment (see card-status.ts), so offering
                    permanent destroy there would let a member throw away a
                    card that's about to become valid again. Only revoked and
                    expired are terminal states. */}
                {(card.status === "revoked" || card.status === "expired") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCardPendingRemoval(card)}
                    aria-label={t("cards:remove.ctaAria", {
                      community: card.communityName,
                    })}
                  >
                    <FiTrash2 aria-hidden="true" /> {t("cards:remove.cta")}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {cardPendingRemoval && (
        <RemoveMyCardModal
          communityName={cardPendingRemoval.communityName}
          pending={deleteCard.isPending}
          onConfirm={confirmRemoval}
          onClose={() => setCardPendingRemoval(null)}
        />
      )}
    </AppShell>
  );
}
