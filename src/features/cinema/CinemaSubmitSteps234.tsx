import { FiCheck } from "react-icons/fi";
import { ChipSelect, FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  AD_OPTIONS,
  CAPTION_LANGS,
  CAPTION_OPTIONS,
  REVENUE_MODELS,
  SIGN_TRACKS,
  TERM_OPTIONS,
  TERRITORY_OPTIONS,
} from "./cinemaSubmit.data";
import type { SubmitForm } from "./useSubmitForm";
import { FbHead, FieldLabel, RadioGrid } from "./CinemaSubmitParts";
import styles from "./CinemaSubmitPage.module.css";

/** Step 2 — captions, audio description, sign-language tracks. */
export function CinemaSubmitStep2({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set, toggle } = form;
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={2}
        heading={
          <Translation
            i18nKey="cinema:submit.form.step2.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:submit.form.step2.sub")}
      />

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step2.captions.why")}>
            {t("cinema:submit.form.step2.captions.label")}
          </FieldLabel>
        }
      >
        <RadioGrid
          options={CAPTION_OPTIONS}
          value={draft.captions}
          onChange={(value) => set("captions", value)}
          ariaLabel={t("cinema:submit.form.step2.captions.ariaLabel")}
        />
      </FormField>

      <FormField label={t("cinema:submit.form.step2.captionLangs.label")}>
        <ChipSelect
          label={t("cinema:submit.form.step2.captionLangs.label")}
          options={CAPTION_LANGS.map((captionLang) => ({
            value: captionLang.value,
            label: t(captionLang.labelKey),
          }))}
          selected={new Set(draft.captionLangs)}
          onToggle={(value) => toggle("captionLangs", value)}
          tone="jade"
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step2.ad.why")}>
            {t("cinema:submit.form.step2.ad.label")}
          </FieldLabel>
        }
      >
        <RadioGrid
          options={AD_OPTIONS}
          value={draft.ad}
          onChange={(value) => set("ad", value)}
          ariaLabel={t("cinema:submit.form.step2.ad.ariaLabel")}
        />
      </FormField>

      <FormField label={t("cinema:submit.form.step2.signTracks.label")}>
        <ChipSelect
          label={t("cinema:submit.form.step2.signTracks.label")}
          options={SIGN_TRACKS.map((signTrack) => ({
            value: signTrack.value,
            label: t(signTrack.labelKey),
          }))}
          selected={new Set(draft.signTracks)}
          onToggle={(value) => toggle("signTracks", value)}
          tone="jade"
        />
      </FormField>

      <FormField
        label={
          <FieldLabel opt={t("cinema:submit.form.step2.notes.opt")}>
            {t("cinema:submit.form.step2.notes.label")}
          </FieldLabel>
        }
      >
        <textarea
          rows={3}
          placeholder={t("cinema:submit.form.step2.notes.placeholder")}
          value={draft.accessNotes}
          onChange={(e) => set("accessNotes", e.target.value)}
        />
      </FormField>
    </div>
  );
}

/** Step 3 — territory, term, rights confirmation. */
export function CinemaSubmitStep3({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={3}
        heading={t("cinema:submit.form.step3.heading")}
        sub={t("cinema:submit.form.step3.sub")}
      />

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step3.territory.why")}>
            {t("cinema:submit.form.step3.territory.label")}
          </FieldLabel>
        }
      >
        <RadioGrid
          options={TERRITORY_OPTIONS}
          value={draft.territory}
          onChange={(value) => set("territory", value)}
          ariaLabel={t("cinema:submit.form.step3.territory.ariaLabel")}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why={t("cinema:submit.form.step3.term.why")}>
            {t("cinema:submit.form.step3.term.label")}
          </FieldLabel>
        }
      >
        <RadioGrid
          options={TERM_OPTIONS}
          value={draft.term}
          onChange={(value) => set("term", value)}
          ariaLabel={t("cinema:submit.form.step3.term.ariaLabel")}
        />
      </FormField>

      {/* i18n sweep: this checkbox is a binding legal representation ("I
          hold the rights to distribute this film…"). Left English —
          deliberately NOT routed through t() — per the sweep brief §6/§7:
          a subtly-off pt-PT rendering would change what a filmmaker is
          agreeing to. Same reasoning the Cinema Rights-page contract FAQ
          was left English for. Flagged in the sweep report; do not
          translate without a native pt-PT + legal review. */}
      <FormField>
        <button
          type="button"
          onClick={() => set("rightsConfirmed", !draft.rightsConfirmed)}
          aria-pressed={draft.rightsConfirmed}
          className={[styles.confirm, draft.rightsConfirmed && styles.confirmOn]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.confirmBox} aria-hidden>
            {draft.rightsConfirmed && <FiCheck size={13} />}
          </span>
          {/* eslint-disable local/no-literal-string -- binding legal representation, deliberately left English per the comment above; not routed through t() */}
          <span className={styles.confirmText}>
            <strong>I hold the rights to distribute this film</strong>,
            including music, archival footage, and anyone who appears in it, or
            I'm authorised by those who do.
          </span>
          {/* eslint-enable local/no-literal-string */}
        </button>
      </FormField>
    </div>
  );
}

/** Step 4 — revenue model, with optional pricing. */
export function CinemaSubmitStep4({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const model = REVENUE_MODELS.find(
    (revenueModel) => revenueModel.value === draft.revenue,
  );
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={4}
        heading={
          <Translation
            i18nKey="cinema:submit.form.step4.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:submit.form.step4.sub")}
      />

      <div className={styles.revCards}>
        {REVENUE_MODELS.map((revenueModel) => {
          const on = revenueModel.value === draft.revenue;
          return (
            <button
              key={revenueModel.value}
              type="button"
              onClick={() => set("revenue", revenueModel.value)}
              aria-pressed={on}
              className={[styles.revCard, on && styles.revCardOn]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.rcHead}>
                <span className={styles.rDot} aria-hidden />
                <span className={styles.rcLabel}>
                  {t(revenueModel.labelKey)}
                </span>
                <span
                  className={[
                    styles.rcTag,
                    revenueModel.tagKind === "free"
                      ? styles.rcTagFree
                      : styles.rcTagPaid,
                  ].join(" ")}
                >
                  {t(revenueModel.tagKey)}
                </span>
              </div>
              <div className={styles.rcDesc}>{t(revenueModel.descKey)}</div>
              <div className={styles.rcSplit}>{t(revenueModel.splitKey)}</div>
            </button>
          );
        })}
      </div>

      {model?.priced && (
        <div className={styles.priceRow}>
          <FormField label={t("cinema:submit.form.step4.rentPrice.label")}>
            <input
              type="number"
              placeholder="3"
              value={draft.rentPrice}
              onChange={(e) => set("rentPrice", e.target.value)}
            />
          </FormField>
          {model.priced === "rentbuy" && (
            <FormField label={t("cinema:submit.form.step4.buyPrice.label")}>
              <input
                type="number"
                placeholder="12"
                value={draft.buyPrice}
                onChange={(e) => set("buyPrice", e.target.value)}
              />
            </FormField>
          )}
        </div>
      )}
    </div>
  );
}
