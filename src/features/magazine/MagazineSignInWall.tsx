import { useLocation } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";

interface MagazineSignInWallProps {
  className?: string;
}

/**
 * The magazine's honest members-only wall. Every magazine read endpoint sits
 * behind `ActiveMemberGuard`, so a logged-out visitor's request comes back 401.
 * The front used to render that as "The magazine is coming soon", telling the
 * public the magazine does not exist and giving a member who shared an article
 * link no way in. This says what is actually true and offers the way through.
 * CON-07.
 *
 * The sign-in CTA carries a `?next=` back-link to the current URL, so the
 * visitor lands back on the page they were trying to read.
 */
export function MagazineSignInWall({ className }: MagazineSignInWallProps) {
  const { t } = useTranslation();
  const { pathname, search } = useLocation();
  const signInHref = `${routes.signIn}?next=${encodeURIComponent(
    `${pathname}${search}`,
  )}`;
  return (
    <EmptyState
      className={className}
      icon={<FiBookOpen />}
      title={t("magazine:signInWall.title")}
      description={t("magazine:signInWall.description")}
      action={{ label: t("magazine:signInWall.signInCta"), to: signInHref }}
      secondaryAction={{
        label: t("magazine:signInWall.requestInviteCta"),
        to: routes.requestInvite,
      }}
    />
  );
}
