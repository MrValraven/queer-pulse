import { useState } from "react";
import { useCheckout } from "./checkoutContext";
import { validEmail } from "./checkout.validation";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function AttendeeDetails() {
  const { isGuest, guestEmail, dietary, access, patch } = useCheckout();
  const [emailErr, setEmailErr] = useState(false);

  return (
    <>
      {isGuest && (
        <div className={s["co-field"]}>
          <label className={s["co-lbl"]} htmlFor="guestEmail">
            Email for your ticket &amp; receipt
          </label>
          <input
            className={cx(s["co-in"], emailErr && s.invalid)}
            id="guestEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={guestEmail}
            onChange={(e) => {
              patch({ guestEmail: e.target.value });
              if (emailErr) setEmailErr(false);
            }}
            onBlur={(e) =>
              setEmailErr(
                !!e.target.value && !validEmail(e.target.value.trim()),
              )
            }
            placeholder="you@example.com"
          />
          <div className={cx(s["co-err"], emailErr && s.show)}>
            Enter a valid email so we can send your ticket.
          </div>
        </div>
      )}

      <div className={s["co-field"]} style={{ marginBottom: 12 }}>
        <label className={s["co-lbl"]} htmlFor="dietary">
          Dietary needs or allergies{" "}
          <span className={s.opt}>— it's a shared meal</span>
        </label>
        <textarea
          className={s["co-ta"]}
          id="dietary"
          value={dietary}
          onChange={(e) => patch({ dietary: e.target.value })}
          placeholder="e.g. vegetarian, no nuts, coeliac…"
          autoComplete="off"
        />
      </div>

      <div className={s["co-field"]}>
        <label className={s["co-lbl"]} htmlFor="access">
          Access needs <span className={s.opt}>optional</span>
        </label>
        <textarea
          className={s["co-ta"]}
          id="access"
          value={access}
          onChange={(e) => patch({ access: e.target.value })}
          placeholder="Anything the host should know to make the space work for you (steps, quiet space, etc.)"
          autoComplete="off"
        />
      </div>
    </>
  );
}
