/**
 * The article headline and standfirst are PLAIN TEXT by contract.
 *
 * They are authored in a contentEditable (`RichText`), stored on
 * `MagazineArticle.title`/`.standfirst`, and rendered by the public reader as
 * JSX text (`ArticlePage`'s `<h1>{article.title}</h1>`, every card, the
 * `<title>`/OG metadata). Anything markup-shaped that reaches those surfaces
 * is shown literally, so the markup is removed ONCE at the write boundary —
 * the editor — rather than being stripped again at each render site.
 *
 * `htmlToPlainText` is the seed half of that contract: content authored before
 * the contract existed (or pasted/imported) is decoded on the way INTO the
 * editor, so the writer sees the real characters and the next save persists
 * them. The live half is `RichText`'s `plainText` mode, which reports
 * `textContent` instead of `innerHTML`.
 */

/** Decodes a stored value that may still carry tags or HTML entities into the
 * text a reader would actually see: `On <em>health</em> &amp; care` becomes
 * `On health & care`. Parsing happens in an inert `<template>` (never attached
 * to the live document, so nothing executes or fetches) rather than with a
 * tag-stripping regex, which leaves entities encoded and mis-tokenizes nested
 * or malformed markup. */
export function htmlToPlainText(value: string): string {
  if (!value.includes("<") && !value.includes("&")) return value;
  // Line-level markup carries a word boundary that `textContent` would drop,
  // gluing the last word of one line to the first of the next.
  const spaced = value
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\s*\/\s*(p|div|h[1-6]|li)\s*>/gi, " ");
  const template = document.createElement("template");
  template.innerHTML = spaced;
  // `\s` covers the non-breaking space a paste routinely leaves behind, so the
  // collapse below also normalizes `&nbsp;` runs into ordinary spaces.
  return (template.content.textContent ?? "").replace(/\s+/g, " ").trim();
}
