import { FiHeart } from "react-icons/fi";
import { PRON_OPTIONS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import s from "./checkout.module.css";

export function GuestDetails() {
  const { qty, guests, updateGuest } = useCheckout();
  if (qty <= 1) return null;

  return (
    <div>
      <div className={s["co-sec"]}>Who's joining you</div>
      <div>
        {guests.map((g, i) => {
          const num = i + 2;
          return (
            <div key={i} className={s["co-guest-card"]}>
              <div className={s["co-guest-head"]}>
                <div className={s["co-guest-lbl"]}>
                  <span className={s["co-guest-num"]}>{num}</span>
                  Guest {num}
                </div>
                <label className={s["co-gift-toggle"]}>
                  <input
                    type="checkbox"
                    checked={g.gift}
                    onChange={(e) => updateGuest(i, "gift", e.target.checked)}
                  />
                  <span className={s["co-gift-pill"]}>
                    <FiHeart /> Gift this seat
                  </span>
                </label>
              </div>

              {g.gift ? (
                <>
                  <div className={s["co-field"]}>
                    <label className={s["co-lbl"]} htmlFor={`gmail${i}`}>
                      Their email
                    </label>
                    <input
                      className={s["co-in"]}
                      id={`gmail${i}`}
                      type="email"
                      value={g.email}
                      onChange={(e) => updateGuest(i, "email", e.target.value)}
                      placeholder="they@example.com"
                    />
                  </div>
                  <div className={s["co-field"]} style={{ marginTop: 12 }}>
                    <label className={s["co-lbl"]} htmlFor={`gnote${i}`}>
                      A note <span className={s.opt}>optional</span>
                    </label>
                    <textarea
                      className={s["co-ta"]}
                      id={`gnote${i}`}
                      value={g.note}
                      onChange={(e) => updateGuest(i, "note", e.target.value)}
                      placeholder="See you Saturday!"
                    />
                  </div>
                  <div className={s["co-gift-note"]}>
                    We'll email a claimable ticket — they add their own name
                    &amp; dietary needs.
                  </div>
                </>
              ) : (
                <>
                  <div className={s["co-grid-2"]}>
                    <div className={s["co-field"]}>
                      <label className={s["co-lbl"]} htmlFor={`gname${i}`}>
                        Name
                      </label>
                      <input
                        className={s["co-in"]}
                        id={`gname${i}`}
                        value={g.name}
                        onChange={(e) => updateGuest(i, "name", e.target.value)}
                        placeholder="Their name"
                      />
                    </div>
                    <div className={s["co-field"]}>
                      <label className={s["co-lbl"]} htmlFor={`gpron${i}`}>
                        Pronouns
                      </label>
                      <select
                        className={s["co-select"]}
                        id={`gpron${i}`}
                        value={g.pron}
                        onChange={(e) => updateGuest(i, "pron", e.target.value)}
                      >
                        <option value="">Select…</option>
                        {PRON_OPTIONS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={s["co-field"]} style={{ marginTop: 12 }}>
                    <label className={s["co-lbl"]} htmlFor={`gdiet${i}`}>
                      Dietary needs <span className={s.opt}>optional</span>
                    </label>
                    <input
                      className={s["co-in"]}
                      id={`gdiet${i}`}
                      value={g.dietary}
                      onChange={(e) =>
                        updateGuest(i, "dietary", e.target.value)
                      }
                      placeholder="e.g. vegan, no shellfish"
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
