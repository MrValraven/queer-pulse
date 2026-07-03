import { useCheckout } from "./checkoutContext";
import s from "./checkout.module.css";

export function WhoAmI() {
  const { isGuest, toggleGuest } = useCheckout();

  return (
    <div className={s["co-whoami"]}>
      <div className={s["co-whoami-av"]}>{isGuest ? "?" : "AR"}</div>
      <div>
        <div className={s["co-whoami-name"]}>
          {isGuest ? (
            <>
              Checking out as a <strong>guest</strong>
            </>
          ) : (
            <>
              Signed in as <strong>Alex Rivera</strong>
            </>
          )}
        </div>
        <div className={s["co-whoami-mail"]}>
          {isGuest
            ? "Members get 10% off — sign in to save it"
            : "alex.rivera@example.com · Member"}
        </div>
      </div>
      <button
        className={s["co-whoami-switch"]}
        type="button"
        onClick={toggleGuest}
      >
        {isGuest ? (
          <>
            Sign back in
            <br />
            as Alex
          </>
        ) : (
          <>
            Not you?
            <br />
            Check out as guest
          </>
        )}
      </button>
    </div>
  );
}
