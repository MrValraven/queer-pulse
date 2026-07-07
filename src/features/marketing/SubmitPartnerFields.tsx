import { FormField } from "../../shared/components/ui";
import type { Region } from "./api/partners.api";
import type { SubmitPartnerForm } from "./useSubmitPartnerForm";
import { REGION_OPTIONS } from "./submitPartnerApplication.data";
import styles from "./SubmitPartnerApplicationPage.module.css";

/** All the fields of the "Apply to partner" application form. */
export function SubmitPartnerFields({ form }: { form: SubmitPartnerForm }) {
  const { state, set, setRegion, errorFor } = form;
  return (
    <>
      <div className={styles.sectionHead}>Your organisation</div>

      <FormField label="Organisation name" required error={errorFor("name")}>
        <input
          type="text"
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Casa Arco"
        />
      </FormField>

      <div className={styles.row}>
        <FormField
          label="Logo mark"
          required
          error={errorFor("logo")}
          helper="A short word or initials shown as the badge (e.g. “ILGA”, “CA”)."
        >
          <input
            type="text"
            value={state.logo}
            onChange={(e) => set("logo", e.target.value)}
            placeholder="e.g. CA"
            maxLength={5}
          />
        </FormField>

        <FormField label="City / base" required error={errorFor("city")}>
          <input
            type="text"
            value={state.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Porto"
          />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField label="Region" required>
          <select
            value={state.region}
            onChange={(e) => setRegion(e.target.value as Region)}
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Region label"
          required
          error={errorFor("regionLabel")}
          helper="Shown on the card — override the default if you like."
        >
          <input
            type="text"
            value={state.regionLabel}
            onChange={(e) => set("regionLabel", e.target.value)}
            placeholder="e.g. Portugal"
          />
        </FormField>
      </div>

      <div className={styles.sectionHead}>The pitch</div>

      <FormField
        label="Eyebrow"
        required
        error={errorFor("eyebrow")}
        helper="A short kind-of-partner line, e.g. “Partner · Community drop-in”."
      >
        <input
          type="text"
          value={state.eyebrow}
          onChange={(e) => set("eyebrow", e.target.value)}
          placeholder="e.g. Partner · Advocacy organisation"
        />
      </FormField>

      <FormField
        label="One-line tagline"
        required
        error={errorFor("tagline")}
        helper="The single sentence that captures what you do."
      >
        <textarea
          rows={2}
          value={state.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="A community kitchen that decided nobody should be cold or hungry while they wait for a safe bed."
        />
      </FormField>

      <FormField
        label="Short description"
        required
        error={errorFor("desc")}
        helper="One or two sentences shown on the listing card."
      >
        <textarea
          rows={3}
          value={state.desc}
          onChange={(e) => set("desc", e.target.value)}
          placeholder="What your organisation does, in plain language, and who it serves."
        />
      </FormField>

      <FormField
        label="Tags"
        helper="Comma-separated — shown as chips on the card."
      >
        <input
          type="text"
          value={state.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="Housing, Food, Drop-in"
        />
      </FormField>

      <div className={styles.sectionHead}>How you'd partner</div>

      <div className={styles.row}>
        <FormField
          label="Partner tier"
          required
          error={errorFor("tier")}
          helper="How you'd describe the relationship."
        >
          <input
            type="text"
            value={state.tier}
            onChange={(e) => set("tier", e.target.value)}
            placeholder="e.g. Community partner"
          />
        </FormField>

        <FormField
          label="Since / status"
          required
          error={errorFor("since")}
          helper="A short status line for the card."
        >
          <input
            type="text"
            value={state.since}
            onChange={(e) => set("since", e.target.value)}
            placeholder="e.g. Applying · 2026"
          />
        </FormField>
      </div>

      {/* Honeypot — visually hidden; bots fill it, people don't. */}
      <input
        type="text"
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={state.handle}
        onChange={(e) => set("handle", e.target.value)}
      />
    </>
  );
}
