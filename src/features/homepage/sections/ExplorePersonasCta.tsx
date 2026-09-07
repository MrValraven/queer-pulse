import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { PersonasExplainerModal } from "./PersonasExplainerModal";

/**
 * The landing "Explore personas" call to action. The persona directory is
 * auth-gated, so a signed-out visitor who clicked straight through was bounced
 * to the sign-in page with no idea why. Instead: signed-in members navigate to
 * the directory as before; signed-out visitors get an explainer modal on why
 * personas live behind the door. Demo mode is always "signed in" (mock
 * persona), so it keeps navigating. Mirrors `ExploreMembersCta`.
 */
export function ExplorePersonasCta({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const label = t("homepage:subprofiles.cta");

  if (loggedIn) {
    return (
      <Button
        variant="ghost-dark"
        to={routes.subprofiles}
        className={className}
      >
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost-dark"
        className={className}
        onClick={() => setIsExplainerOpen(true)}
      >
        {label}
      </Button>
      {isExplainerOpen && (
        <PersonasExplainerModal onClose={() => setIsExplainerOpen(false)} />
      )}
    </>
  );
}
