/**
 * Small pieces shared by every per-layout slide field component
 * (`TextSlideFields`/`StatSlideFields`/`ImageSlideFields`/`RevealSlideFields`/
 * `BeforeAfterSlideFields`) and by `SlideEditorCard` itself. Kept out of any
 * one field file so none of them import from a sibling.
 */

/**
 * Every text-ish field on `Slide` is typed `ReactNode` (the reader renders
 * `<em>` emphasis), but everything that reaches this editor was deserialized
 * from JSON (mock data or the API) — never live JSX — so it is always a
 * plain string in practice. This narrows for a controlled input without
 * lying about the wider reader-side type.
 */
export function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** The patch contract every per-layout field component follows: receive the
 * one slide it edits, hand back the FULL next slide via `onChange` — callers
 * spread the previous slide (`{ ...slide, field: value }`), never mutate it,
 * which preserves the `layout`/`kind` discriminant on every edit. */
export interface FieldsProps<T> {
  slide: T;
  onChange: (slide: T) => void;
}
