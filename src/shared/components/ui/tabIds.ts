/**
 * Build the ids that link a tab to its panel. Exported so a caller can label
 * its panel with the SAME ids this component stamps on the buttons, which is
 * the half of the APG tab pattern a `role="tab"` alone cannot provide.
 *
 * Pass the `idPrefix` you gave `<Tabs>`:
 *
 * ```tsx
 * const tabsId = useId();
 * <Tabs idPrefix={tabsId} tabs={tabs} active={active} onChange={setActive} />
 * <div {...tabPanelProps(tabsId, active)}>…</div>
 * ```
 */
export function tabIds(
  idPrefix: string,
  tabId: string,
): { tab: string; panel: string } {
  return {
    tab: `${idPrefix}-tab-${tabId}`,
    panel: `${idPrefix}-panel-${tabId}`,
  };
}

/** Props for the region a tab controls: `<div {...tabPanelProps(id, active)}>`. */
export function tabPanelProps(
  idPrefix: string,
  tabId: string,
): { id: string; role: "tabpanel"; "aria-labelledby": string; tabIndex: 0 } {
  const ids = tabIds(idPrefix, tabId);
  return {
    id: ids.panel,
    role: "tabpanel",
    "aria-labelledby": ids.tab,
    // A panel with no focusable content of its own still has to be reachable,
    // or a screen-reader user can tab off the tablist straight past it.
    tabIndex: 0,
  };
}
