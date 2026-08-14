import { FiShield } from "react-icons/fi";
import {
  CheckLine,
  FormField,
  RadioCardGroup,
  Toggle,
} from "../../../shared/components/ui";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  NOTIFY,
  REL,
  VIS,
  type OptionRow,
  type OwnerRel,
  type OwnerVisibility,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import { ListingPhotoGallery } from "./ListingPhotoGallery";
import styles from "./ListBusinessPage.module.css";

function RadioStack({
  options,
  value,
  onChange,
  label,
}: {
  options: OptionRow[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <RadioCardGroup
      className={styles.stack}
      optionClassName={styles.radioOpt}
      checkedClassName={styles.optOn}
      ariaLabel={label}
      value={value}
      onChange={onChange}
      options={options.map((o) => ({
        id: o.id,
        render: (
          <>
            <span className={styles.roDot} aria-hidden />
            <span className={styles.radioTxt}>
              <b>{t(o.labelKey)}</b>
              <span>{t(o.descKey)}</span>
            </span>
          </>
        ),
      }))}
    />
  );
}

export function StepPhotosYou({
  form,
  userName,
  uploadPhoto,
}: {
  form: ListingForm;
  userName: string;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
}) {
  const { t } = useTranslation();
  const { draft, set, toggleIn } = form;
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step4.title")}
        em={t("marketing:listBusiness.step4.em")}
        sub={t("marketing:listBusiness.step4.sub")}
      />

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step4.photosLabel")}
        helper={t("marketing:listBusiness.step4.photosHelper")}
      >
        <ListingPhotoGallery form={form} uploadPhoto={uploadPhoto} />
      </FormField>

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step4.aboutYouHeading")}
      </h3>

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
        <FormField
          className={styles.lbField}
          id={ANCHOR.ownerRole}
          label={t("marketing:listBusiness.step4.ownerRoleLabel")}
          required
        >
          <input
            type="text"
            maxLength={40}
            placeholder={t("marketing:listBusiness.step4.ownerRolePlaceholder")}
            value={draft.ownerRole}
            onChange={(e) => set({ ownerRole: e.target.value })}
          />
        </FormField>
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
          placeholder={t(
            "marketing:listBusiness.step4.contactEmailPlaceholder",
          )}
          value={draft.contactEmail}
          onChange={(e) => set({ contactEmail: e.target.value })}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step4.notifyLabel")}
      >
        <div className={styles.stack}>
          {NOTIFY.map((n) => (
            <CheckLine
              key={n.id}
              checked={draft.notify.includes(n.id)}
              onChange={() => toggleIn("notify", n.id)}
              title={t(n.labelKey)}
            />
          ))}
        </div>
      </FormField>

      <div className={styles.consent}>
        <FiShield size={17} aria-hidden />
        <p>
          <Translation
            i18nKey="marketing:listBusiness.step4.consent"
            components={{ b: <b /> }}
          />
        </p>
      </div>
    </div>
  );
}
