/** Hands the browser the signed download link. Its own module so tests mock
 *  the navigation. */
export function navigateToDownload(url: string): void {
  window.location.assign(url);
}
