import { ChipSelect, FormField } from "../../shared/components/ui";
import {
  COUNTRIES,
  FORMATS,
  IDENTITY_TAGS,
  LANGUAGES,
} from "./cinemaSubmit.data";
import type { SubmitForm } from "./useSubmitForm";
import { FbHead, FieldLabel } from "./CinemaSubmitParts";
import { ContentNotesBuilder, PosterUpload } from "./CinemaSubmitWidgets";
import styles from "./CinemaSubmitPage.module.css";

/** Step 1 — basic information, shown on the film's public page. */
export function CinemaSubmitStep1({ form }: { form: SubmitForm }) {
  const { draft, set, toggle } = form;
  const identities = new Set(draft.identities);
  return (
    <div className={styles.formBlock}>
      <FbHead
        num={1}
        title="Tell us about"
        em="your film"
        sub="Basic information — visible on the film's public page"
      />

      <FormField label="Film title" required>
        <input
          type="text"
          placeholder="e.g. The light between rooms"
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </FormField>

      <div className={styles.fieldRow}>
        <FormField
          label={<FieldLabel opt="(if different)">Original title</FieldLabel>}
        >
          <input
            type="text"
            placeholder="Title in original language"
            value={draft.originalTitle}
            onChange={(e) => set("originalTitle", e.target.value)}
          />
        </FormField>
        <FormField label="Year of production">
          <input
            type="number"
            placeholder="2026"
            value={draft.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.fieldRow3}>
        <FormField label="Runtime (minutes)">
          <input
            type="number"
            placeholder="92"
            value={draft.runtime}
            onChange={(e) => set("runtime", e.target.value)}
          />
        </FormField>
        <FormField label="Country of origin">
          <select
            value={draft.country}
            onChange={(e) => set("country", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Original language">
          <select
            value={draft.language}
            onChange={(e) => set("language", e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Format">
        <div className={styles.radioGrid} role="radiogroup" aria-label="Format">
          {FORMATS.map((f) => {
            const on = f.value === draft.format;
            return (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("format", f.value)}
                className={[styles.rOpt, on && styles.rOptOn]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.rDot} aria-hidden />
                <span className={styles.rText}>
                  {f.label}
                  {f.sub && <span className={styles.rSub}>{f.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        label={
          <FieldLabel why="Written by you, in your own voice. 80–200 words. Not a pitch — describe the film as if you're writing to a friend who hasn't seen it.">
            Synopsis
          </FieldLabel>
        }
        required
      >
        <textarea
          rows={5}
          placeholder="A patient, generous film about Lisbon's working-class queer elders, made over three years in the kitchens that raised them…"
          value={draft.synopsis}
          onChange={(e) => set("synopsis", e.target.value)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel
            opt="(optional, but shown on the film page)"
            why="Why you made it, and what you want people to bring to it. 60–120 words."
          >
            Director's statement
          </FieldLabel>
        }
      >
        <textarea
          rows={4}
          placeholder="I make films about people who were never asked whether they wanted to be documented…"
          value={draft.statement}
          onChange={(e) => set("statement", e.target.value)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why="Self-disclosed only. These let viewers find more work by their communities. Never required. Tick what you want shown.">
            Identity tags for yourself as filmmaker
          </FieldLabel>
        }
      >
        <ChipSelect
          options={IDENTITY_TAGS}
          selected={identities}
          onToggle={(v) => toggle("identities", v)}
        />
      </FormField>

      <FormField
        label={
          <FieldLabel why="We surface these prominently, with timecodes if you can provide them. Think of them as information, not warnings — they help viewers decide whether tonight's the night for your film.">
            Content notes
          </FieldLabel>
        }
      >
        <ContentNotesBuilder form={form} />
      </FormField>

      <FormField
        label={
          <FieldLabel why="3:4 ratio preferred. Min 1800px tall. Used on your film's page and in the catalogue grid.">
            Upload poster / key art
          </FieldLabel>
        }
      >
        <PosterUpload form={form} />
      </FormField>

      <FormField
        label={
          <FieldLabel why="Password-protected Vimeo, Frame.io, or WeTransfer links work. We view every film before accepting it. Turnaround: 10–14 days.">
            Screener link
          </FieldLabel>
        }
        required
      >
        <input
          type="url"
          placeholder="https://vimeo.com/… or paste a WeTransfer link"
          value={draft.screener}
          onChange={(e) => set("screener", e.target.value)}
        />
      </FormField>
    </div>
  );
}
