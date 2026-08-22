import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MyCardsPage = lazyNamed(() => import("./MyCardsPage"), "MyCardsPage");
const CardVerifyPage = lazyNamed(() => import("./CardVerifyPage"), "CardVerifyPage");

/** The member's own cards, and the public page a scanned card resolves to. */
export function cardRoutes() {
  return (
    <>
      <Route path={routes.myCards} element={<MyCardsPage />} />
      {/* Public and unauthenticated: reached from a stranger's camera. */}
      <Route path={`${routes.cardVerify}/:token`} element={<CardVerifyPage />} />
    </>
  );
}
