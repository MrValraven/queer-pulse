import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Avatar } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import shellStyles from "./StudioShell.module.css";

/** The member's real avatar, labelled, linking to their account. */
export function StudioShellAccount() {
  const { t } = useTranslation();
  const identity = useAccountIdentity();
  return (
    <Link
      to={routes.account}
      className={shellStyles.account}
      aria-label={t("studio:shell.accountLabel", { name: identity.name })}
    >
      <Avatar
        initials={identity.initials}
        src={identity.photo}
        size={34}
        alt=""
      />
    </Link>
  );
}
