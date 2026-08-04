import {
  FiCheck,
  FiHeart,
  FiHome,
  FiInfo,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import { FormField, RadioCardGroup } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ANCHOR,
  CATS,
  catLabel,
  GOODFOR,
  goodForLabel,
  hoodLabel,
  initials,
  LANGS,
  langLabel,
  NEIGHBOURHOODS,
  PRICES,
  VERIFY,
  type ListingPath,
  type OwnerBadge,
  type VerifyOption,
} from "./listBusiness.data";
import { useSimilarListings } from "./api/useSimilarListings";
import type { SimilarListing } from "./api/listings.api";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

const VERIFY_ICON: Record<string, typeof FiMail> = {
  email: FiMail,
  instagram: FiInstagram,
  post: FiMapPin,
  later: FiMessageCircle,
};

/* ===== Step 0 — You & the place ===== */
export function StepPath({
  form,
  userName,
}: {
  form: ListingForm;
  userName: string;
}) {
  const { t } = useTranslation();
  const { draft, pickPath, set } = form;
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step0.title")}
        em={t("marketing:listBusiness.step0.em")}
        sub={t("marketing:listBusiness.step0.sub")}
      />
      <RadioCardGroup<ListingPath>
        id={ANCHOR.path}
        className={styles.pathGrid}
        optionClassName={styles.pathCard}
        checkedClassName={styles.pathCardOn}
        ariaLabel={t("marketing:listBusiness.step0.pathAria")}
        value={draft.path}
        onChange={pickPath}
        options={[
          {
            id: "claim",
            render: (
              <>
                <span className={`${styles.pcIc} ${styles.pcIcOwn}`}>
                  <FiHome />
                </span>
                <b>{t("marketing:listBusiness.step0.claim.title")}</b>
                <span>{t("marketing:listBusiness.step0.claim.desc")}</span>
              </>
            ),
          },
          {
            id: "suggest",
            render: (
              <>
                <span className={`${styles.pcIc} ${styles.pcIcSug}`}>
                  <FiHeart />
                </span>
                <b>{t("marketing:listBusiness.step0.suggest.title")}</b>
                <span>{t("marketing:listBusiness.step0.suggest.desc")}</span>
              </>
            ),
          },
        ]}
      />

      {draft.path === "claim" && (
        <div id={ANCHOR.verify} className={styles.revealBlock}>
          <label>{t("marketing:listBusiness.step0.verifyLabel")}</label>
          <p>{t("marketing:listBusiness.step0.verifyHelp")}</p>
          <RadioCardGroup
            className={styles.stack}
            optionClassName={styles.verifyOpt}
            checkedClassName={styles.optOn}
            ariaLabel={t("marketing:listBusiness.step0.verifyLabel")}
            value={draft.verify}
            onChange={(id) => set({ verify: id })}
            options={VERIFY.map((v: VerifyOption) => {
              const Icon = VERIFY_ICON[v.id] ?? FiMail;
              return {
                id: v.id,
                render: (
                  <>
                    <span className={styles.voIc}>
                      <Icon size={17} />
                    </span>
                    <span className={styles.radioTxt}>
                      <b>{t(v.labelKey)}</b>
                      <span>{t(v.descKey)}</span>
                    </span>
                    <span className={styles.voBadge}>{t(v.badgeKey)}</span>
                  </>
                ),
              };
            })}
          />
        </div>
      )}

      <div className={styles.consent}>
        <FiInfo size={17} aria-hidden />
        <p>
          <Translation
            i18nKey="marketing:listBusiness.step0.signedInAs"
            components={{ b: <b /> }}
            values={{ name: userName }}
          />
        </p>
      </div>
    </div>
  );
}

/** Directory look-alikes surfaced under the name field so people don't
 *  re-list an existing place. */
function DuplicateNotice({ dups }: { dups: SimilarListing[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.dupNotice} role="alert">
      <div className={styles.dnHead}>
        {t("marketing:listBusiness.step1.dupHead")}
      </div>
      {dups.map((match) => (
        <div key={match.slug || match.name} className={styles.dupMatch}>
          <span className={styles.dmAv}>{initials(match.name)}</span>
          <span className={styles.dmInfo}>
            <b>{match.name}</b>
            <span>
              {catLabel(t, match.cat)} · {match.hood}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ===== Step 1 — Basics ===== */
export function StepBasics({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, toggleCat, pickBadge } = form;
  // Live duplicate detection against the real directory — by name, and by
  // proximity once a pin exists (item #5).
  const coords =
    draft.latitude !== null && draft.longitude !== null
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null;
  const dups = useSimilarListings(draft.name, coords);
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step1.title")}
        em={t("marketing:listBusiness.step1.em")}
        sub={t("marketing:listBusiness.step1.sub")}
      />

      <FormField
        className={styles.lbField}
        id={ANCHOR.name}
        label={t("marketing:listBusiness.step1.nameLabel")}
        required
        helper={t("marketing:listBusiness.step1.nameHelper")}
      >
        <input
          type="text"
          maxLength={60}
          placeholder={t("marketing:listBusiness.step1.namePlaceholder")}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </FormField>
      {dups.length > 0 && <DuplicateNotice dups={dups} />}

      <FormField
        className={styles.lbField}
        id={ANCHOR.cats}
        label={t("marketing:listBusiness.step1.catsLabel")}
        required
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t("marketing:listBusiness.step1.catsAria")}
        >
          {CATS.map((c) => {
            const on = draft.cats.includes(c);
            const full = draft.cats.length >= 2 && !on;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                disabled={full}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleCat(c)}
              >
                {catLabel(t, c)}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.hood}
        label={t("marketing:listBusiness.step1.hoodLabel")}
        required
      >
        <select
          value={draft.hood}
          onChange={(e) => set({ hood: e.target.value })}
        >
          <option value="">
            {t("marketing:listBusiness.step1.hoodPlaceholder")}
          </option>
          {NEIGHBOURHOODS.map((h) => (
            <option key={h} value={h}>
              {hoodLabel(t, h)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.badge}
        label={t("marketing:listBusiness.step1.badgeLabel")}
        required
        helper={t("marketing:listBusiness.step1.badgeHelper")}
      >
        <RadioCardGroup<OwnerBadge>
          className={styles.optGrid}
          optionClassName={styles.optCard}
          checkedClassName={styles.optOn}
          ariaLabel={t("marketing:listBusiness.step1.badgeAria")}
          value={draft.badge}
          onChange={pickBadge}
          options={[
            {
              id: "owned",
              render: (
                <>
                  <span className={`${styles.ownTag} ${styles.ownTagJade}`}>
                    {t("marketing:listBusiness.step1.owned.tag")}
                  </span>
                  <b>{t("marketing:listBusiness.step1.owned.title")}</b>
                  <span>{t("marketing:listBusiness.step1.owned.desc")}</span>
                </>
              ),
            },
            {
              id: "friendly",
              render: (
                <>
                  <span className={`${styles.ownTag} ${styles.ownTagCoral}`}>
                    {t("marketing:listBusiness.step1.friendly.tag")}
                  </span>
                  <b>{t("marketing:listBusiness.step1.friendly.title")}</b>
                  <span>{t("marketing:listBusiness.step1.friendly.desc")}</span>
                </>
              ),
            },
          ]}
        />
      </FormField>
      {draft.badge === "owned" && (
        <div className={styles.revealBlock}>
          <label>{t("marketing:listBusiness.step1.evidenceLabel")}</label>
          <p>{t("marketing:listBusiness.step1.evidenceHelp")}</p>
          <FormField>
            <input
              type="text"
              maxLength={120}
              placeholder={t(
                "marketing:listBusiness.step1.evidencePlaceholder",
              )}
              value={draft.evidence}
              onChange={(e) => set({ evidence: e.target.value })}
            />
          </FormField>
        </div>
      )}

      <FormField
        className={styles.lbField}
        id={ANCHOR.price}
        label={t("marketing:listBusiness.step1.priceLabel")}
        required
      >
        <RadioCardGroup
          className={styles.priceRow}
          optionClassName={`${styles.chip} ${styles.priceChip}`}
          checkedClassName={styles.chipOn}
          ariaLabel={t("marketing:listBusiness.step1.priceAria")}
          value={draft.price}
          onChange={(id) => set({ price: id })}
          options={PRICES.map((p) => ({
            id: p.id,
            render: (
              <>
                <span className={styles.priceSym}>{p.sym}</span>
                <span className={styles.priceLbl}>{t(p.labelKey)}</span>
              </>
            ),
          }))}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.blurb}
        label={t("marketing:listBusiness.step1.blurbLabel")}
        required
        helper={t("marketing:listBusiness.step1.blurbHelper")}
        labelAside={`${draft.blurb.length} / 140`}
      >
        <textarea
          maxLength={140}
          placeholder={t("marketing:listBusiness.step1.blurbPlaceholder")}
          value={draft.blurb}
          onChange={(e) => set({ blurb: e.target.value })}
        />
      </FormField>
    </div>
  );
}

/* ===== Step 2 — Story ===== */
export function StepStory({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, setWit, addWit, delWit, addTag, removeTag, toggleIn } =
    form;
  const [tagInput, setTagInput] = useState("");
  const commitTag = () => {
    addTag(tagInput);
    setTagInput("");
  };
  return (
    <div className={styles.stepBody}>
      <PaneHeader
        title={t("marketing:listBusiness.step2.title")}
        em={t("marketing:listBusiness.step2.em")}
        sub={t("marketing:listBusiness.step2.sub")}
      />

      <FormField
        className={styles.lbField}
        id={ANCHOR.tagline}
        label={t("marketing:listBusiness.step2.taglineLabel")}
        required
        helper={
          <Translation
            i18nKey="marketing:listBusiness.step2.taglineHelper"
            components={{ em: <em /> }}
          />
        }
      >
        <input
          type="text"
          maxLength={120}
          placeholder={t("marketing:listBusiness.step2.taglinePlaceholder")}
          value={draft.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        id={ANCHOR.whatItIs}
        label={t("marketing:listBusiness.step2.witLabel")}
        required
        helper={t("marketing:listBusiness.step2.witHelper")}
      >
        <div>
          {draft.whatItIs.map((line, i) => (
            <div key={line.id} className={styles.witLine}>
              <input
                type="text"
                maxLength={90}
                placeholder={t(
                  i === 0
                    ? "marketing:listBusiness.step2.witFirstPlaceholder"
                    : "marketing:listBusiness.step2.witMorePlaceholder",
                )}
                value={line.text}
                onChange={(e) => setWit(i, e.target.value)}
              />
              <button
                type="button"
                className={styles.witDel}
                onClick={() => delWit(i)}
                aria-label={t("marketing:listBusiness.step2.witRemoveAria")}
              >
                <FiX />
              </button>
            </div>
          ))}
          {draft.whatItIs.length < 4 && (
            <button type="button" className={styles.witAdd} onClick={addWit}>
              <FiPlus size={14} /> {t("marketing:listBusiness.step2.witAdd")}
            </button>
          )}
        </div>
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step2.tagsLabel")}
      >
        <div className={styles.tagInputWrap}>
          <input
            type="text"
            maxLength={24}
            placeholder={t("marketing:listBusiness.step2.tagsPlaceholder")}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitTag();
              }
            }}
          />
          <button
            type="button"
            className={styles.hoursToolBtn}
            onClick={commitTag}
          >
            {t("marketing:listBusiness.step2.tagsAddCta")}
          </button>
        </div>
        {draft.tags.length > 0 && (
          <div className={styles.tagList}>
            {draft.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={styles.tagPill}
                onClick={() => removeTag(tag)}
                aria-label={t("marketing:listBusiness.step2.tagRemoveAria", {
                  tag,
                })}
              >
                {tag} <FiX size={11} />
              </button>
            ))}
          </div>
        )}
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step2.goodForLabel")}
        helper={t("marketing:listBusiness.step2.goodForHelper")}
      >
        <div
          className={styles.gfGrid}
          role="group"
          aria-label={t("marketing:listBusiness.step2.goodForAria")}
        >
          {GOODFOR.map((g) => {
            const on = draft.goodFor.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("goodFor", g)}
              >
                {on && <FiCheck size={12} />} {goodForLabel(t, g)}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step2.langsLabel")}
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t("marketing:listBusiness.step2.langsAria")}
        >
          {LANGS.map((l) => {
            const on = draft.langs.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                className={[styles.chip, on && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("langs", l)}
              >
                {langLabel(t, l)}
              </button>
            );
          })}
        </div>
      </FormField>
    </div>
  );
}
