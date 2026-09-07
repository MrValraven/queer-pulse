import {
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";

/**
 * A borderless textarea that grows with its content, so the editor rows for
 * tasks and commitments read like the detail page they become: the poster
 * types straight into the rendered layout instead of a stack of boxes.
 */
export function PostOpportunityInlineTextarea({
  value,
  onValueChange,
  className,
  ...rest
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onValueChange: (next: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    const borderY = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + borderY}px`;
  }, [value]);

  return (
    <textarea
      {...rest}
      ref={textareaRef}
      rows={1}
      className={className}
      value={value}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
        onValueChange(event.target.value)
      }
    />
  );
}
