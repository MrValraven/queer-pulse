import { useId } from "react";
import { linkedPathPrefix, typingSlug } from "./subprofileAddressChange";
import styles from "./PersonaAddressField.module.css";

/**
 * The linked persona's slug input, drawn as the whole address it produces:
 * the site host and `/members/<creator>/` sit in the box as a fixed prefix
 * and only the slug is editable. What's typed is normalised on the way in
 * (`typingSlug`), so the box always reads as the link that will be saved.
 *
 * The host comes from `window.location` rather than a hardcoded domain (the
 * same call the Start Community handle field makes). The prefix is also the
 * input's description, so a screen reader hears the full address too.
 */
export function PersonaAddressField({
  label,
  placeholder,
  ownerSlug,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  placeholder: string;
  ownerSlug: string;
  value: string;
  onChange: (slug: string) => void;
  onBlur: () => void;
}) {
  const inputId = useId();
  const prefixId = useId();
  const host = typeof window === "undefined" ? "" : window.location.host;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        {/* Clipped from the START when narrow, so the creator's slug next to
            the input stays visible and the host is what gives way. */}
        <span className={styles.prefix} id={prefixId}>
          <span dir="ltr">
            {host}
            {linkedPathPrefix(ownerSlug)}
          </span>
        </span>
        <input
          id={inputId}
          className={styles.input}
          value={value}
          placeholder={placeholder}
          aria-describedby={prefixId}
          onChange={(event) => onChange(typingSlug(event.target.value))}
          onBlur={onBlur}
          // A URL slug: never auto-capitalise / auto-correct / spell-check it,
          // and give the URL keyboard (with `/` + `.`). enterKeyHint "done"
          // since it's the last edited field before the global save.
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
          enterKeyHint="done"
        />
      </div>
    </div>
  );
}
