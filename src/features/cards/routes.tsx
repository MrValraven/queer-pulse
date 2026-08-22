import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MyCardsPage = lazyNamed(() => import("./MyCardsPage"), "MyCardsPage");
const CardVerifyPage = lazyNamed(() => import("./CardVerifyPage"), "CardVerifyPage");
const CardPrintPage = lazyNamed(() => import("./CardPrintPage"), "CardPrintPage");

/** The member's own cards, the public page a scanned card resolves to, and
 *  the sheet a community prints physical cards from. */
export function cardRoutes() {
  return (
    <>
      <Route path={routes.myCards} element={<MyCardsPage />} />
      {/* Public and unauthenticated: reached from a stranger's camera. */}
      <Route path={`${routes.cardVerify}/:token`} element={<CardVerifyPage />} />
      {/* Owner and mod only, checked in the page and again by the backend on
          the holders query it depends on. */}
      <Route path="/mod/:slug/cards/print" element={<CardPrintPage />} />
    </>
  );
}
