import { useState } from "react";
import { COC_LIST } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { cx } from "./cx";
import s from "./checkout.module.css";

export function CodeOfCare() {
  const { cocAgreed, setCoc } = useCheckout();
  const [open, setOpen] = useState(false);

  return (
    <div className={cx(s["co-coc"], open && s.open)}>
      <div className={s["co-coc-top"]}>
        <label style={{ display: "flex" }}>
          <input
            type="checkbox"
            id="cocCheck"
            checked={cocAgreed}
            onChange={(e) => setCoc(e.target.checked)}
          />
          <span className={s["co-coc-check"]} aria-hidden />
        </label>
        <div>
          <label className={s["co-coc-txt"]} htmlFor="cocCheck">
            I've read the <strong>Code of Care</strong> and I'm coming ready to
            look out for the people at this table.
          </label>
          <button
            className={s["co-coc-more"]}
            type="button"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide ←" : "What's that? →"}
          </button>
          <div className={s["co-coc-body"]}>
            <ul className={s["co-coc-list"]}>
              {COC_LIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
