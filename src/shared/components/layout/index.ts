export { Navbar } from "./Navbar";
export { LandingNav } from "./LandingNav";
export { Sidebar } from "./Sidebar";
export { Footer } from "./Footer";
export { PageShell } from "./PageShell";
export { PageHero } from "./PageHero";
export { AppShell } from "./AppShell";
export { BackToSettingsLink } from "./BackToSettingsLink";
export { SystemStateShell } from "./SystemStateShell";
export { MagazineDeskShell } from "./MagazineDeskShell";
export { useMagazineShellOverlay } from "./magazineShellOverlay";
export { SkipToContentLink, MAIN_CONTENT_ID } from "./SkipToContentLink";

// ENG-190: `AdminShell` (and `ADMIN_NAV`) stay out of this barrel on purpose.
// Every page imports the shell components above from here, so a re-export put
// AdminShell's ~17 kB stylesheet into index.html as a render-blocking <link>
// for every visitor. Staff pages import it from "./AdminShell" directly.
