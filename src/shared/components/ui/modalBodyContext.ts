import { createContext } from "react";

/** True inside a `<Modal>` body, so a SuccessPanel there renders flat: the dialog is already the surface. */
export const IsInsideModalContext = createContext(false);
