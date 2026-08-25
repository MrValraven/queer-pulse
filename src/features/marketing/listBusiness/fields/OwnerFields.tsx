import { FiShield } from "react-icons/fi";
import { FormField, Toggle } from "../../../../shared/components/ui";
import { Translation } from "../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  REL,
  VIS,
  type OwnerRel,
  type OwnerVisibility,
} from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { OwnerRoleField } from "./OwnerRoleField";
import { RadioStack } from "./RadioStack";
import styles from "../ListBusinessPage.module.css";

/**
 * The "about you" field body: the member's connection to the place, the name
 * and role shown on the listing, how much of that identity is public, whether
 * the listing links to their profile, and the contact email moderation writes
 * to.
 *
 * Shared by the create wizard's step 4 pane (`StepPhotosYou`) and the owner
 * editor's About-you section. Fragment, so each field stays a direct child of
 * the caller's `.stepBody` column.
 *
 * OWNER ONLY. Everything here except the role is the owner's own personal
 * data, which the API keeps out of a co-manager's response and refuses in a
 * co-manager's save, so a co-manager gets `CoManagerRoleFields` instead.
 */
export function OwnerFields({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, set } = form;

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.rel}
        label={t("marketing:listBusiness.step4.relLabel")}
        required
      >
        <RadioStack
          options={REL}
          value={draft.rel}
          onChange={(id) => set({ rel: id as OwnerRel })}
          label={t("marketing:listBusiness.step4.relAria")}
        />
      </FormField>

      <div className={styles.twoCol}>
        <FormField
          className={styles.lbField}
          id={ANCHOR.ownerName}
          label={t("marketing:listBusiness.step4.ownerNameLabel")}
          required
        >
          <input
            type="text"
            maxLength={50}
            placeholder={t("marketing:listBusiness.step4.ownerNamePlaceholder")}
            value={draft.ownerName}
            onChange={(e) => set({ ownerName: e.target.value })}
          />
        </FormField>
        <OwnerRoleField form={form} />
      </div>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step4.ownerBioLabel")}
        labelAside={`${draft.ownerBio.length} / 220`}
      >
        <textarea
          maxLength={220}
          placeholder={t("marketing:listBusiness.step4.ownerBioPlaceholder")}
          value={draft.ownerBio}
          onChange={(e) => set({ ownerBio: e.target.value })}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step4.visLabel")}
        required
      >
        <RadioStack
          options={VIS}
          value={draft.visibility}
          onChange={(id) => set({ visibility: id as OwnerVisibility })}
          label={t("marketing:listBusiness.step4.visAria")}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step4.linkProfileLabel")}
      >
        <div className={styles.memToggle}>
          <div className={styles.mtTxt}>
            <b>{t("marketing:listBusiness.step4.linkProfileTitle")}</b>
            <span>
              {t("marketing:listBusiness.step4.linkProfileDesc", {
                name: userName,
              })}
            </span>
          </div>
          <Toggle
            checked={draft.linkToProfile}
            onChange={(v) => set({ linkToProfile: v })}
            label={t("marketing:listBusiness.step4.linkProfileToggleLabel")}
          />
        </div>
      </FormField>

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step4.loopHeading")}
      </h3>
      <FormField
        className={styles.lbField}
        id={ANCHOR.contactEmail}
        label={t("marketing:listBusiness.step4.contactEmailLabel")}
        required
        helper={t("marketing:listBusiness.step4.contactEmailHelper")}
      >
        <input
          type="email"
          placeholder={t("marketing:listBusiness.step4.contactEmailPlaceholder")}
          value={draft.contactEmail}
          onChange={(e) => set({ contactEmail: e.target.value })}
        />
      </FormField>

      <p className={styles.hint}>
        {t("marketing:listBusiness.step4.notifyNote")}
      </p>

      <div className={styles.consent}>
        <FiShield size={17} aria-hidden />
        <p>
          <Translation
            i18nKey="marketing:listBusiness.step4.consent"
            components={{ b: <b /> }}
          />
        </p>
      </div>
    </>
  );
}
