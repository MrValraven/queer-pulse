import { useId, useState } from "react";
import {
  FiArrowRight,
  FiChevronDown,
  FiCreditCard,
  FiEdit2,
  FiShoppingBag,
} from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PersonaPostComposer } from "../subprofiles/PersonaPostComposer";
import type { StudioArtistView } from "./api/studio.adapters";
import {
  studioGettingPaidPath,
  studioPaymentsPath,
  studioPressEditPath,
  studioPressPath,
} from "./studioPaths";
import { StudioSalesPendingBadge } from "./StudioSalesPendingBadge";
import ownerStyles from "./StudioArtistOwner.module.css";

/** The owner's tools on their Studio page. The payments to confirm (with
 *  this persona's waiting count) and Getting paid stay in view above the
 *  fold, so the badge shows at a glance. The press kit (view and edit) and
 *  "Post an update", which lands in the About tab's Updates and on the
 *  persona page, fold under one heading so the page reads as the public
 *  sees it. The heading's button opens and closes that group. */
export function StudioArtistOwnerTools({
  artist,
}: {
  artist: StudioArtistView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const panelId = useId();
  const composerHeadingId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const personaId = artist.artist.id;
  return (
    <div className={ownerStyles.panel}>
      <div className={ownerStyles.toolLinks}>
        <Button variant="quiet" size="sm" to={studioPaymentsPath(personaId)}>
          <FiShoppingBag aria-hidden /> {t("studio:owner.v3.paymentsLink")}
          <StudioSalesPendingBadge subprofileId={personaId} />
        </Button>
        <Button variant="quiet" size="sm" to={studioGettingPaidPath(personaId)}>
          <FiCreditCard aria-hidden /> {t("studio:owner.v3.gettingPaidLink")}
        </Button>
      </div>
      <section aria-labelledby={headingId}>
        <h2 className={ownerStyles.toolsHeading}>
          <Button
            id={headingId}
            variant="quiet"
            className={ownerStyles.toggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => setIsOpen((wasOpen) => !wasOpen)}
          >
            <span>{t("studio:owner.v3.toolsHeading")}</span>
            <FiChevronDown
              aria-hidden
              className={ownerStyles.chevron}
              data-open={isOpen || undefined}
            />
          </Button>
        </h2>
        <div id={panelId}>
          <Collapse isOpen={isOpen}>
            <div className={ownerStyles.toolsBody}>
              <div className={ownerStyles.toolLinks}>
                <Button
                  variant="quiet"
                  size="sm"
                  to={studioPressPath(personaId)}
                >
                  {t("studio:owner.v3.pressKit")} <FiArrowRight aria-hidden />
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  to={studioPressEditPath(personaId)}
                >
                  <FiEdit2 aria-hidden /> {t("studio:owner.v3.editPressKit")}
                </Button>
              </div>
              <h3 id={composerHeadingId} className={ownerStyles.subheading}>
                {t("studio:owner.v3.postUpdateHeading")}
              </h3>
              <div role="group" aria-labelledby={composerHeadingId}>
                <PersonaPostComposer subprofileId={personaId} />
              </div>
            </div>
          </Collapse>
        </div>
      </section>
    </div>
  );
}
