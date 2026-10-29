import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { Avatar } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMeFollowing } from "./StudioMeFollowing";
import { StudioMePlaylists } from "./StudioMePlaylists";
import { StudioMeRecent } from "./StudioMeRecent";
import { StudioMeTopArtists } from "./StudioMeTopArtists";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import listening from "./StudioListeningPage.module.css";
import s from "./StudioMePage.module.css";

const IDENTITY_AVATAR_SIZE = 56;

/**
 * "Your profile": the member's private Studio profile. The identity sits under
 * the title, then their playlists, top artists, followed artists and recent
 * listening, each section reading its own data.
 */
export function StudioMePage() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:me.pageTitle"));
  const identity = useAccountIdentity();

  return (
    <StudioShell>
      <div className={listening.pageHeader}>
        <div className={listening.eyebrow}>{t("studio:me.eyebrow")}</div>
        <h1>
          <Translation i18nKey="studio:me.title" components={{ em: <em /> }} />
        </h1>
        <p className={listening.dek}>{t("studio:me.dek")}</p>
        <div className={s.identity}>
          <Avatar
            initials={identity.initials}
            src={identity.photo}
            size={IDENTITY_AVATAR_SIZE}
          />
          <span className={s.identityName}>{identity.name}</span>
        </div>
      </div>

      <div className={listening.wrap}>
        <div className={s.sections}>
          <StudioMePlaylists />
          <StudioMeTopArtists />
          <StudioMeFollowing />
          <StudioMeRecent />
        </div>
      </div>
    </StudioShell>
  );
}
