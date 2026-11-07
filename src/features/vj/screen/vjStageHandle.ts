/**
 * What a stage renderer (the WebGL compositor or the DOM renderer) answers to
 * the page through a ref, so the page can release an object URL the renderer
 * never adopted without scanning the DOM.
 */
export interface VjStageHandle {
  /** True while the renderer holds this object URL (showing, loading, primed or mixing). */
  holdsSource: (sourceUrl: string) => boolean;
}
