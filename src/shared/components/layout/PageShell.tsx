import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/** Standard page frame: fixed Navbar, main content, plum Footer. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main data-page-main>{children}</main>
      <Footer />
    </>
  );
}
