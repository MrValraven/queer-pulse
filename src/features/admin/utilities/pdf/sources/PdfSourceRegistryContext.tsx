/* eslint-disable react-refresh/only-export-components --
   The provider and its one reader hook stay together, the same convention
   every provider in the app follows. */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { PdfSourceRegistry } from "./pdfSourceRegistry";

const PdfSourceRegistryContext = createContext<PdfSourceRegistry | null>(null);

export function PdfSourceRegistryProvider({
  registry,
  children,
}: {
  registry: PdfSourceRegistry;
  children: ReactNode;
}) {
  return (
    <PdfSourceRegistryContext.Provider value={registry}>
      {children}
    </PdfSourceRegistryContext.Provider>
  );
}

export function usePdfSourceRegistry(): PdfSourceRegistry {
  const registry = useContext(PdfSourceRegistryContext);
  if (!registry) throw new Error("pdf-source-registry-missing");
  return registry;
}
