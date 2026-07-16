import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MEMBER_RATE } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import s from "./checkout.module.css";

const MEMBER_NAME = "Alex Rivera";
const MEMBER_EMAIL = "alex.rivera@example.com";

export function WhoAmI() {
  const { isGuest, toggleGuest } = useCheckout();
  const { t } = useTranslation();

  return (
    <div className={s["co-whoami"]}>
      <div className={s["co-whoami-av"]}>{isGuest ? "?" : "AR"}</div>
      <div>
        <div className={s["co-whoami-name"]}>
          {isGuest ? (
            <Translation
              i18nKey="gatherings:checkout.whoami.guestTitle"
              components={{ strong: <strong /> }}
            />
          ) : (
            <Translation
              i18nKey="gatherings:checkout.whoami.memberTitle"
              components={{ strong: <strong /> }}
              values={{ name: MEMBER_NAME }}
            />
          )}
        </div>
        <div className={s["co-whoami-mail"]}>
          {isGuest
            ? t("gatherings:checkout.whoami.memberDiscountNote", {
                rate: MEMBER_RATE * 100,
              })
            : t("gatherings:checkout.whoami.memberEmailLine", {
                email: MEMBER_EMAIL,
              })}
        </div>
      </div>
      <button
        className={s["co-whoami-switch"]}
        type="button"
        onClick={toggleGuest}
      >
        {isGuest ? (
          <>
            {t("gatherings:checkout.whoami.signBackInCta")}
            <br />
            {t("gatherings:checkout.whoami.asNameCta", { name: "Alex" })}
          </>
        ) : (
          <>
            {t("gatherings:checkout.whoami.notYouCta")}
            <br />
            {t("gatherings:checkout.whoami.checkoutAsGuestCta")}
          </>
        )}
      </button>
    </div>
  );
}
