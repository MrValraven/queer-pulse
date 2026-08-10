/** The article editor's Draft/Shape/Read mode seg. Draft hides the `.erail`
 * rails for a wider writing column; Shape shows them; Read swaps the
 * editable `ArticleDocument` for the read-only `ArticleReaderPreview`.
 * Its own file so `ArticleEditorPage`, `ArticleEditorHeader`, and any
 * future consumer share one definition without an import cycle. */
export type EditorMode = "draft" | "shape" | "read";
