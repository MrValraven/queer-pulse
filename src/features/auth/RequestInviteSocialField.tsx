import { FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./auth.module.css";

/**
 * The optional "A social profile" input on the request-invite form. Its own
 * file so `RequestInviteFields` stays under the 200-line ceiling.
 *
 * Free text with no format check: a handle, a link or "@name on instagram" are
 * all fine, and a blank field never blocks submit. The helper says why we ask
 * and that leaving it blank never counts against anyone, because people who
 * are not out may have nothing they can safely share.
 */
export function RequestInviteSocialField({
  socialProfile,
  setSocialProfile,
}: {
  socialProfile: string;
  setSocialProfile: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormField
      label={
        <Translation
          i18nKey="auth:requestInvite.field.social.label"
          components={{ optional: <span className={styles.optionalSuffix} /> }}
        />
      }
      helper={t("auth:requestInvite.field.social.helper")}
    >
      <input
        id="ri-social"
        type="text"
        inputMode="url"
        maxLength={200}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={t("auth:requestInvite.field.social.placeholder")}
        value={socialProfile}
        onChange={(event) => setSocialProfile(event.target.value)}
      />
    </FormField>
  );
}
