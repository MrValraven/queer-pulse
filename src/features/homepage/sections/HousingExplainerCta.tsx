import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { HousingExplainerModal } from "./HousingExplainerModal";

/**
 * The landing housing call to action. The housing board is auth-gated
 * (`/local/housing` and `/local/housing/*` in `GATED_PATTERNS`), so a signed-out
 * visitor who clicked "Browse housing" was bounced to the sign-in page with no
 * idea why — and the section offered them a second gated link, "Post that
 * you're looking", that did the same thing.
 *
 * Signed in, this is the button it always was and the flatmate link stays beside
 * it. Signed out, it becomes the section's single button, says what it actually
 * does, and opens an explainer on what housing here is and why the board has a
 * door. Demo mode is always "signed in", so the demo homepage is unchanged.
 * Mirrors `ExplorePersonasCta`.
 */
export function HousingExplainerCta({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  if (loggedIn) {
    return (
      <Button
        variant="primary"
        size="lg"
        to={routes.housing}
        className={className}
      >
        {t("homepage:housing.cta")}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className={className}
        onClick={() => setIsExplainerOpen(true)}
      >
        {t("homepage:housing.explainerCta")}
      </Button>
      {isExplainerOpen && (
        <HousingExplainerModal onClose={() => setIsExplainerOpen(false)} />
      )}
    </>
  );
}
