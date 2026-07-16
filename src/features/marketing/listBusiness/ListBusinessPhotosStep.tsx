import { FiShield } from "react-icons/fi";
import {
  CheckLine,
  FormField,
  ImageSlot,
  Toggle,
} from "../../../shared/components/ui";
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
  type PhotoKey,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

const GALLERY: { key: PhotoKey; wide?: boolean; captionKey: string }[] = [
  {
    key: "wide",
    wide: true,
    captionKey: "marketing:listBusiness.step4.gallery.wide",
  },
  { key: "d1", captionKey: "marketing:listBusiness.step4.gallery.detail" },
  { key: "d2", captionKey: "marketing:listBusiness.step4.gallery.detail" },
  { key: "vibe", captionKey: "marketing:listBusiness.step4.gallery.vibe" },
];
const ALT_LABEL_KEYS: Record<PhotoKey, string> = {
  wide: "marketing:listBusiness.step4.alt.wide",
  d1: "marketing:listBusiness.step4.alt.d1",
  d2: "marketing:listBusiness.step4.alt.d2",
  vibe: "marketing:listBusiness.step4.alt.vibe",
};

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
    <div className={styles.stack} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={[styles.radioOpt, on && styles.optOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(o.id)}
          >
            <span className={styles.roDot} aria-hidden />
            <span className={styles.radioTxt}>
              <b>{t(o.labelKey)}</b>
              <span>{t(o.descKey)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StepPhotosYou({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, set, setAlt, toggleIn } = form;
  return (
    <>
      <PaneHeader
        title={t("marketing:listBusiness.step4.title")}
        em={t("marketing:listBusiness.step4.em")}
        sub={t("marketing:listBusiness.step4.sub")}
      />

      <FormField
        label={t("marketing:listBusiness.step4.photosLabel")}
        helper={t("marketing:listBusiness.step4.photosHelper")}
      >
        <div className={styles.galGrid}>
          {GALLERY.map((g) => (
            <ImageSlot
              key={g.key}
              className={g.wide ? styles.galWide : undefined}
              tint="coral"
              radius={14}
              height={g.wide ? 150 : 110}
              placeholder={t(g.captionKey)}
              alt={draft.alt[g.key]}
            />
          ))}
        </div>
        <div className={styles.altList}>
          {GALLERY.map((g) => (
            <div key={g.key} className={styles.altRow}>
              <span className={styles.altK}>{t(ALT_LABEL_KEYS[g.key])}</span>
              <input
                type="text"
                maxLength={100}
                placeholder={t("marketing:listBusiness.step4.altPlaceholder")}
                value={draft.alt[g.key]}
                onChange={(e) => setAlt(g.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </FormField>

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step4.aboutYouHeading")}
      </h3>

      <FormField
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

      <FormField label={t("marketing:listBusiness.step4.visLabel")} required>
        <RadioStack
          options={VIS}
          value={draft.visibility}
          onChange={(id) => set({ visibility: id as OwnerVisibility })}
          label={t("marketing:listBusiness.step4.visAria")}
        />
      </FormField>

      <FormField label={t("marketing:listBusiness.step4.linkProfileLabel")}>
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

      <FormField label={t("marketing:listBusiness.step4.notifyLabel")}>
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
    </>
  );
}
