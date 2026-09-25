import { useRef, type TextareaHTMLAttributes } from "react";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";

/** Line breaks from a drop or an unexpected keyboard: a field holds one line,
 *  so they fold into spaces. Enter and paste are caught before this. */
const LINE_BREAKS = /\s*\r?\n\s*/g;

/**
 * A one-row textarea that grows with its text, so a long heading or line
 * wraps the way the page wraps it. `field-sizing: content` does the growing
 * where the browser has it, `useAutoGrowFallback` elsewhere. The focus
 * registry's ref rides along beside the fallback's own.
 */
export function TopicTextarea({
  value,
  fieldRef,
  onChange,
  ...fieldProps
}: Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "rows"
> & {
  value: string;
  fieldRef: (element: HTMLElement | null) => void;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, value);
  return (
    <textarea
      {...fieldProps}
      ref={(element) => {
        textareaRef.current = element;
        fieldRef(element);
      }}
      rows={1}
      value={value}
      onChange={(event) =>
        onChange(event.target.value.replace(LINE_BREAKS, " "))
      }
    />
  );
}
