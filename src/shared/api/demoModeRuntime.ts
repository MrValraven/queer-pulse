/**
 * The demo flag for code that runs outside React (the Studio link parser,
 * which the inbox's hook-free preview path also calls). `DemoModeProvider`
 * owns the value and keeps this mirror in step; components keep reading
 * `useDemoMode()`. False until the provider mounts.
 */
let isDemoModeOn = false;

export function isDemoModeRuntime(): boolean {
  return isDemoModeOn;
}

export function setDemoModeRuntime(isDemo: boolean): void {
  isDemoModeOn = isDemo;
}
