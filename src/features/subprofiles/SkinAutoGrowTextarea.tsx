import { useRef } from "react";
import {
  IS_FIELD_SIZING_SUPPORTED,
  useAutoGrowFallback,
} from "./useAutoGrowTextarea";
import listStyles from "./SkinListControls.module.css";

/** A multi-line item field (an FAQ answer, a step's body, a note) that
 *  grows with its text from a three-row minimum, so nothing is clipped.
 *  It forwards FormField's injected `id` and `aria-*` onto the textarea.
 *  `className` replaces the FormField-sized default (the refined surface). */
export function SkinAutoGrowTextarea({
  value,
  placeholder,
  onChange,
  className = listStyles.autoGrowTextarea,
  ...wiring
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, value);
  return (
    <textarea
      {...wiring}
      ref={textareaRef}
      className={className}
      rows={IS_FIELD_SIZING_SUPPORTED ? undefined : 3}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
SkinAutoGrowTextarea.formFieldControl = true;
