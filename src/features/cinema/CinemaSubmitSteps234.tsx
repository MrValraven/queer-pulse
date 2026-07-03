import { FiCheck } from "react-icons/fi";
import { ChipSelect, FormField } from "../../shared/components/ui";
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
  const { draft, set, toggle } = form;
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={2}
        title="Accessibility"
        em="assets"
        sub="Captions, audio description, sign-language tracks. We help if you're stuck — nobody's turned away over cost."
      />

      <FormField
        label={
          <FieldLabel why="We caption every film before it goes live. If you don't have captions, our access fund can make them for you.">
            Do you have captions?
          </FieldLabel>
        }
      >
        <RadioGrid
          options={CAPTION_OPTIONS}
          value={draft.captions}
          onChange={(v) => set("captions", v)}
          ariaLabel="Captions"
        />
      </FormField>

      <FormField label="Caption languages you can provide">
        <ChipSelect
          options={CAPTION_LANGS}
          selected={new Set(draft.captionLangs)}
          onToggle={(v) => toggle("captionLangs", v)}
          tone="jade"
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why="A described track or a script we can voice. Optional, but it opens your film to blind and low-vision viewers.">
            Audio description
          </FieldLabel>
        }
      >
        <RadioGrid
          options={AD_OPTIONS}
          value={draft.ad}
          onChange={(v) => set("ad", v)}
          ariaLabel="Audio description"
        />
      </FormField>

      <FormField label="Sign-language tracks available">
        <ChipSelect
          options={SIGN_TRACKS}
          selected={new Set(draft.signTracks)}
          onToggle={(v) => toggle("signTracks", v)}
          tone="jade"
        />
      </FormField>

      <FormField
        label={
          <FieldLabel opt="(optional)">Anything else we should know</FieldLabel>
        }
      >
        <textarea
          rows={3}
          placeholder="Flashing imagery timecodes, sensory notes, or access needs of your own we should plan around…"
          value={draft.accessNotes}
          onChange={(e) => set("accessNotes", e.target.value)}
        />
      </FormField>
    </div>
  );
}

/** Step 3 — territory, term, rights confirmation. */
export function CinemaSubmitStep3({ form }: { form: SubmitForm }) {
  const { draft, set } = form;
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={3}
        title="Rights"
        titlePost="you're granting"
        sub="Non-exclusive, always. You keep every other right and can show the film anywhere else, anytime."
      />

      <FormField
        label={
          <FieldLabel why="Where we can stream it. Worldwide reaches the most people, but a local-only première is completely fine.">
            Territory
          </FieldLabel>
        }
      >
        <RadioGrid
          options={TERRITORY_OPTIONS}
          value={draft.territory}
          onChange={(v) => set("territory", v)}
          ariaLabel="Territory"
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why="How long the film stays in the catalogue. You can pull it earlier at any time, no penalty.">
            Term
          </FieldLabel>
        }
      >
        <RadioGrid
          options={TERM_OPTIONS}
          value={draft.term}
          onChange={(v) => set("term", v)}
          ariaLabel="Term"
        />
      </FormField>

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
          <span className={styles.confirmText}>
            <strong>I hold the rights to distribute this film</strong>,
            including music, archival footage, and anyone who appears in it — or
            I'm authorised by those who do.
          </span>
        </button>
      </FormField>
    </div>
  );
}

/** Step 4 — revenue model, with optional pricing. */
export function CinemaSubmitStep4({ form }: { form: SubmitForm }) {
  const { draft, set } = form;
  const model = REVENUE_MODELS.find((m) => m.value === draft.revenue);
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={4}
        title="How you want"
        em="to sell"
        sub="You choose. You can change this after submission, once per year."
      />

      <div className={styles.revCards}>
        {REVENUE_MODELS.map((m) => {
          const on = m.value === draft.revenue;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => set("revenue", m.value)}
              aria-pressed={on}
              className={[styles.revCard, on && styles.revCardOn]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.rcHead}>
                <span className={styles.rDot} aria-hidden />
                <span className={styles.rcLabel}>{m.label}</span>
                <span
                  className={[
                    styles.rcTag,
                    m.tagKind === "free" ? styles.rcTagFree : styles.rcTagPaid,
                  ].join(" ")}
                >
                  {m.tag}
                </span>
              </div>
              <div className={styles.rcDesc}>{m.desc}</div>
              <div className={styles.rcSplit}>{m.split}</div>
            </button>
          );
        })}
      </div>

      {model?.priced && (
        <div className={styles.priceRow}>
          <FormField label="Rental price (€2–8)">
            <input
              type="number"
              placeholder="3"
              value={draft.rentPrice}
              onChange={(e) => set("rentPrice", e.target.value)}
            />
          </FormField>
          {model.priced === "rentbuy" && (
            <FormField label="Buy price (min 2× rental)">
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
