import type { ReactNode } from "react";

/** One row of a `PieceRowMenu`. `danger` renders the item in the danger tone. */
export interface PieceRowMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  danger?: boolean;
  onSelect: () => void;
}
