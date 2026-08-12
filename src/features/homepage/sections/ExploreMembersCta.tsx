import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { MembersExplainerModal } from "./MembersExplainerModal";

/**
 * The landing "Explore members" call to action. The member directory is
 * auth-gated, so a signed-out visitor who clicked straight through was bounced
 * to the sign-in page. Instead: signed-in members navigate to the directory as
 * before; signed-out visitors get an explainer modal on how membership works.
 * Demo mode is always "signed in" (mock persona), so it keeps navigating.
 */
export function ExploreMembersCta({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const label = t("homepage:discovery.exploreMembersCta");

  if (loggedIn) {
    return (
      <Button to={routes.members} className={className}>
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && <MembersExplainerModal onClose={() => setOpen(false)} />}
    </>
  );
}
