import { FiCheck } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESS_OPTIONS,
  CONFIRM_CHECK_KEYS,
  HOODS,
  LANGS,
  TYPES,
  accessLabelKey,
  hoodLabelKey,
  langLabelKey,
  typeNameKey,
} from "./createGathering.data";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringPage.module.css";

export function TypeStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step1.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step1.sub")}</p>
      <div className={styles.types}>
        {TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              styles.typeCard,
              form.type === option.value && styles.typeCardSelected,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => form.selectType(option.value, option.icon)}
          >
            <div className={styles.typeIcon}>
              <option.icon />
            </div>
            <span className={styles.typeName}>{t(option.nameKey)}</span>
            <span className={styles.typeSub}>{t(option.subKey)}</span>
          </button>
        ))}
      </div>
      <label className={styles.label}>
        {t("gatherings:create.step1.titleLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step1.titlePlaceholder")}
        value={form.title}
        onChange={(e) => form.setTitle(e.target.value)}
      />
      <label className={styles.label}>
        {t("gatherings:create.step1.descLabel")}
      </label>
      <textarea
        className={styles.textarea}
        placeholder={t("gatherings:create.step1.descPlaceholder")}
        value={form.desc}
        onChange={(e) => form.setDesc(e.target.value)}
      />
    </div>
  );
}

export function DatePlaceStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step2.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step2.sub")}</p>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step2.dateLabel")}
          </label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => form.setDate(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step2.timeLabel")}
          </label>
          <input
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => form.setTime(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step2.endTimeLabel")}
          </label>
          <input
            className={styles.input}
            type="time"
            value={form.endTime}
            onChange={(e) => form.setEndTime(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step2.hoodLabel")}
          </label>
          <select
            className={styles.select}
            value={form.hood}
            onChange={(e) => form.setHood(e.target.value)}
          >
            <option value="">
              {t("gatherings:create.step2.hoodPlaceholder")}
            </option>
            {HOODS.map((hood) => (
              <option key={hood.value} value={hood.value}>
                {t(hood.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className={styles.label}>
        {t("gatherings:create.step2.venueLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.venuePlaceholder")}
        value={form.venue}
        onChange={(e) => form.setVenue(e.target.value)}
      />
      <label className={styles.label}>
        {t("gatherings:create.step2.addressLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.addressPlaceholder")}
        value={form.address}
        onChange={(e) => form.setAddress(e.target.value)}
      />
      <label className={styles.label}>
        {t("gatherings:create.step2.directionsLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step2.directionsPlaceholder")}
        value={form.directions}
        onChange={(e) => form.setDirections(e.target.value)}
      />
    </div>
  );
}

export function CapacityStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step3.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step3.sub")}</p>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step3.capLabel")}
          </label>
          <input
            className={styles.input}
            type="number"
            min={2}
            max={200}
            placeholder={t("gatherings:create.step3.capPlaceholder")}
            value={form.cap}
            onChange={(e) => form.setCap(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>
            {t("gatherings:create.step3.langLabel")}
          </label>
          <select
            className={styles.select}
            value={form.lang}
            onChange={(e) => form.setLang(e.target.value)}
          >
            {LANGS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {t(lang.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className={styles.label}>
        {t("gatherings:create.step3.accessLabel")}
      </label>
      <p className={styles.hint}>{t("gatherings:create.step3.accessHint")}</p>
      <div className={styles.accessList}>
        {ACCESS_OPTIONS.map((option) => {
          const on = form.access.has(option.value);
          return (
            <div
              key={option.value}
              className={[styles.accessItem, on && styles.accessItemSelected]
                .filter(Boolean)
                .join(" ")}
              onClick={() => form.toggleAccess(option.value)}
              role="checkbox"
              aria-checked={on}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  form.toggleAccess(option.value);
                }
              }}
            >
              <div className={styles.accessCheck}>{on ? <FiCheck /> : ""}</div>
              <span className={styles.accessName}>{t(option.labelKey)}</span>
            </div>
          );
        })}
      </div>
      <label className={styles.label}>
        {t("gatherings:create.step3.notesLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step3.notesPlaceholder")}
        value={form.accessNotes}
        onChange={(e) => form.setAccessNotes(e.target.value)}
      />
    </div>
  );
}

export function PricingStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step4.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step4.sub")}</p>
      <div
        className={styles.freeToggle}
        onClick={() => form.setFree(!form.free)}
        role="checkbox"
        aria-checked={form.free}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            form.setFree(!form.free);
          }
        }}
      >
        <div
          className={[styles.freeCheck, form.free && styles.freeCheckOn]
            .filter(Boolean)
            .join(" ")}
        >
          {form.free ? <FiCheck /> : ""}
        </div>
        <div>
          <div className={styles.freeLabel}>
            {t("gatherings:create.step4.freeLabel")}
          </div>
        </div>
      </div>
      {!form.free && (
        <div>
          <p className={styles.hint}>
            {t("gatherings:create.step4.tiersHint")}
          </p>
          <div className={styles.tierHead}>
            <span />
            <span className={styles.tierColHead}>
              {t("gatherings:create.step4.priceColHead")}
            </span>
            <span className={styles.tierColHead}>
              {t("gatherings:create.step4.spotsColHead")}
            </span>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.solidarity.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="0"
                aria-label={t(
                  "gatherings:create.step4.tier.solidarity.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="3"
                aria-label={t(
                  "gatherings:create.step4.tier.solidarity.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <div className={styles.tierNote}>
            {t("gatherings:create.step4.tier.solidarity.note")}
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.standard.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.stdPrice}
                onChange={(e) => form.setStdPrice(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.standard.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="8"
                aria-label={t(
                  "gatherings:create.step4.tier.standard.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>
              {t("gatherings:create.step4.tier.supporter.name")}
            </span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.supPrice}
                onChange={(e) => form.setSupPrice(e.target.value)}
                aria-label={t(
                  "gatherings:create.step4.tier.supporter.priceAria",
                )}
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="5"
                aria-label={t(
                  "gatherings:create.step4.tier.supporter.spotsAria",
                )}
              />
              <span className={styles.spotsSuffix}>
                {t("gatherings:create.step4.spotsSuffix")}
              </span>
            </div>
            <span />
          </div>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            {t("gatherings:create.step4.tier.supporterHint")}
          </p>
        </div>
      )}
      <label className={styles.label} style={{ marginTop: 4 }}>
        {t("gatherings:create.step4.includedLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step4.includedPlaceholder")}
        value={form.included}
        onChange={(e) => form.setIncluded(e.target.value)}
      />
      <label className={styles.label}>
        {t("gatherings:create.step4.bringLabel")}
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder={t("gatherings:create.step4.bringPlaceholder")}
        value={form.bring}
        onChange={(e) => form.setBring(e.target.value)}
      />
    </div>
  );
}

export function ReviewStep({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const TypeIcon = form.typeIcon;
  const accessList = [...form.access];
  const accessVal =
    accessList.length || form.accessNotes.trim() ? (
      <span className={styles.reviewAccess}>
        {accessList.map((a) => (
          <span key={a} className={styles.reviewAccessTag}>
            <FiCheck /> {t(accessLabelKey(a) ?? a)}
          </span>
        ))}
        {form.accessNotes.trim() && (
          <span className={styles.reviewAccessNote}>
            {form.accessNotes.trim()}
          </span>
        )}
      </span>
    ) : (
      <span className={styles.reviewAccessEmpty}>
        {t("gatherings:create.step5.accessEmpty")}
      </span>
    );

  const scheduledAt = form.date
    ? new Date(`${form.date}T${form.time || "00:00"}`)
    : undefined;
  const dateTimeValue =
    scheduledAt && !Number.isNaN(scheduledAt.getTime())
      ? t("gatherings:create.step5.dateTimeValue", {
          date: fmt.date(scheduledAt, { day: "numeric", month: "short" }),
          time: fmt.time(scheduledAt),
        })
      : "—";

  const hoodLabel = form.hood ? t(hoodLabelKey(form.hood) ?? form.hood) : "—";
  const langLabel = t(langLabelKey(form.lang) ?? form.lang);
  const typeLabel = form.type ? t(typeNameKey(form.type) ?? form.type) : "—";

  const review = [
    {
      l: t("gatherings:create.step5.row.type"),
      v: (
        <>
          {TypeIcon && <TypeIcon />} <strong>{typeLabel}</strong>
        </>
      ),
    },
    {
      l: t("gatherings:create.step5.row.title"),
      v: <strong>{form.title || "—"}</strong>,
    },
    { l: t("gatherings:create.step5.row.dateTime"), v: dateTimeValue },
    {
      l: t("gatherings:create.step5.row.location"),
      v: t("gatherings:create.step5.locationValue", {
        venue: form.venue || "—",
        hood: hoodLabel,
      }),
    },
    {
      l: t("gatherings:create.step5.row.capacity"),
      v: t("gatherings:create.step5.capacityValue", {
        cap: form.cap || "—",
        lang: langLabel,
      }),
    },
    {
      l: t("gatherings:create.step5.row.pricing"),
      v: form.free
        ? t("gatherings:create.step5.pricingFree")
        : t("gatherings:create.step5.pricingSliding", {
            std: form.stdPrice ? fmt.currency(Number(form.stdPrice)) : "—",
            sup: form.supPrice ? fmt.currency(Number(form.supPrice)) : "—",
          }),
    },
    { l: t("gatherings:create.step5.row.accessibility"), v: accessVal },
  ];
  const remaining = 3 - form.checkedCount;
  return (
    <div>
      <div className={styles.stepTitle}>
        <Translation
          i18nKey="gatherings:create.step5.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.stepSub}>{t("gatherings:create.step5.sub")}</p>
      <div className={styles.reviewGrid}>
        {review.map((r) => (
          <div className={styles.reviewRow} key={r.l}>
            <div className={styles.reviewLbl}>{r.l}</div>
            <div className={styles.reviewVal}>{r.v}</div>
          </div>
        ))}
      </div>
      <div className={styles.label} style={{ marginBottom: 4 }}>
        {t("gatherings:create.step5.confirmHeading")}
      </div>
      <p className={styles.checkIntro}>
        <Translation
          i18nKey="gatherings:create.step5.confirmIntro"
          components={{ strong: <strong /> }}
        />
      </p>
      {CONFIRM_CHECK_KEYS.map((textKey, i) => (
        <div
          key={textKey}
          className={styles.checkRow}
          onClick={() => form.toggleCheck(i)}
          role="checkbox"
          aria-checked={form.checks[i]}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              form.toggleCheck(i);
            }
          }}
        >
          <div
            className={[styles.check, form.checks[i] && styles.checkOn]
              .filter(Boolean)
              .join(" ")}
          >
            {form.checks[i] ? <FiCheck /> : ""}
          </div>
          <span className={styles.checkText}>{t(textKey)}</span>
        </div>
      ))}
      <div
        className={[
          styles.publishStatus,
          form.allChecked && styles.publishStatusReady,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {form.allChecked ? (
          t("gatherings:create.step5.allSet")
        ) : (
          <Translation
            i18nKey="gatherings:create.step5.progress"
            values={{ count: remaining, checkedCount: form.checkedCount }}
            components={{
              num: <span className={styles.checkCount} />,
              remaining: <span className={styles.checkCount} />,
            }}
          />
        )}
      </div>
    </div>
  );
}
