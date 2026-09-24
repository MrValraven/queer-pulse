export type CopyEmailOutcome = "rich" | "plain" | "failed";

/**
 * Puts an email on the clipboard with BOTH an HTML and a plain-text part, so
 * pasting into Gmail, Outlook or Apple Mail keeps the formatting and a
 * plain-text field still gets readable words. Falls back to plain text where
 * `ClipboardItem` is missing or the rich write is refused; the caller says so.
 */
export async function copyRichEmail(email: {
  html: string;
  text: string;
}): Promise<CopyEmailOutcome> {
  const clipboard =
    typeof navigator === "undefined" ? undefined : navigator.clipboard;
  if (!clipboard) return "failed";
  if (
    typeof ClipboardItem !== "undefined" &&
    typeof clipboard.write === "function"
  ) {
    try {
      await clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([email.html], { type: "text/html" }),
          "text/plain": new Blob([email.text], { type: "text/plain" }),
        }),
      ]);
      return "rich";
    } catch {
      // Refused (permissions, unsupported type): plain text below.
    }
  }
  return (await copyPlainText(email.text)) ? "plain" : "failed";
}

export async function copyPlainText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
