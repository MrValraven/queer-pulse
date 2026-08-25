/** Stable lookup key so a resolved-name map is shared across all mention kinds. */
export function mentionNameKey(kind: string, slug: string): string {
  return `${kind}:${slug}`;
}
