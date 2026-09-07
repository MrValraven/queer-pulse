import { useState } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { Avatar } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HousingReviewsExplainerModal } from "./HousingReviewsExplainerModal";
import type { HousingLandlordContent } from "./housingShowcase.data";
import styles from "./HousingShowcase.module.css";

interface HousingLandlordPanelProps {
  landlord: HousingLandlordContent;
  /** False for the back (peeking) card, whose foot link renders as inert text. */
  interactive: boolean;
}

/** "The landlord" tab content for one housing listing card: past-tenant
 *  verdict and quotes when they exist, or an honest empty state when the
 *  landlord is new to the board.
 *
 *  The foot CTA asks how reviews work, so it opens the explainer modal rather
 *  than navigating to the housing board. Only the FRONT card is interactive
 *  (`interactive`), so at most one of the two stacked panels can ever hold an
 *  open modal. */
export function HousingLandlordPanel({
  landlord,
  interactive,
}: HousingLandlordPanelProps) {
  const { t } = useTranslation();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  return (
    <>
      <div className={styles.lpPad} style={{ paddingTop: 24 }}>
        <div className={styles.llHead}>
          <Avatar
            initials={landlord.avatarInitial}
            src={landlord.avatarSrc}
            tint="plum"
            size={46}
          />
          <div>
            <div className={styles.hhName}>{landlord.name}</div>
            <div className={styles.hhSub}>{landlord.sub}</div>
          </div>
        </div>

        {landlord.verdict && (
          <div className={styles.verdict}>
            <FiCheck aria-hidden /> {landlord.verdict}
          </div>
        )}

        {landlord.quotes?.map((quote) => (
          <div key={quote.who} className={styles.quote}>
            <Avatar
              initials={quote.initials}
              tint={quote.tint}
              src={quote.src}
              size={38}
            />
            <div>
              <p>{quote.quote}</p>
              <div className={styles.who}>{quote.who}</div>
            </div>
          </div>
        ))}

        {landlord.flag && (
          <div className={styles.flag}>
            <FiAlertTriangle className={styles.flagIcon} aria-hidden />
            <span>
              <b>{landlord.flag.lead}</b> {landlord.flag.rest}
            </span>
          </div>
        )}

        {landlord.emptyState && (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>{landlord.emptyState.title}</div>
            <div className={styles.emptyBody}>{landlord.emptyState.body}</div>
          </div>
        )}

        {landlord.facts && (
          <div className={styles.sig}>
            <div className={styles.factsHeading}>
              {t("homepage:housing.listings.factsHeading")}
            </div>
            {landlord.facts.map((fact) => (
              <div key={fact.text} className={styles.sigRow}>
                {fact.known ? (
                  <FiCheck className={styles.sigIcon} aria-hidden />
                ) : (
                  <FiAlertCircle
                    className={styles.factNeutralIcon}
                    aria-hidden
                  />
                )}
                <span>{fact.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.lstFoot}>
        <span>{landlord.footNote}</span>
        {landlord.footCta &&
          (interactive ? (
            <button
              type="button"
              className={styles.footLinkButton}
              onClick={() => setIsExplainerOpen(true)}
            >
              {landlord.footCta} <FiArrowRight aria-hidden />
            </button>
          ) : (
            <span className={styles.footLink}>{landlord.footCta}</span>
          ))}
      </div>
      {isExplainerOpen && (
        <HousingReviewsExplainerModal
          onClose={() => setIsExplainerOpen(false)}
        />
      )}
    </>
  );
}
