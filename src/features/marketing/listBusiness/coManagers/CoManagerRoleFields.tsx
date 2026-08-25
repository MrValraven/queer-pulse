import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { OwnerRoleField } from "../fields/OwnerRoleField";
import type { ListingForm } from "../useListingForm";
import styles from "./CoManagers.module.css";

/**
 * What a co-manager sees where the owner sees "About you".
 *
 * The owner's name, short bio, contact email, how much of their identity the
 * listing shows, whether it links to their profile, their connection to the
 * business, and the two permissions they granted are all theirs. The API does
 * not send those eight fields to a co-manager and refuses a save that carries
 * one, so they are not rendered as disabled inputs here: they are absent, and
 * the line below says why.
 *
 * The role shown on the public listing stays, because it describes the
 * business rather than the owner.
 */
export function CoManagerRoleFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  return (
    <>
      <OwnerRoleField
        form={form}
        labelKey="marketing:listBusiness.coManagers.roleFieldLabel"
        helperKey="marketing:listBusiness.coManagers.roleFieldHelper"
      />
      <p className={styles.notice}>
        <span className={styles.noticeIcon} aria-hidden>
          <FiLock />
        </span>
        {t("marketing:listBusiness.coManagers.ownerPrivateNotice")}
      </p>
    </>
  );
}
