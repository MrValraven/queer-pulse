import { FiHeart } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PRON_OPTIONS } from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import s from "./checkout.module.css";

export function GuestDetails() {
  const { qty, guests, updateGuest } = useCheckout();
  const { t } = useTranslation();
  if (qty <= 1) return null;

  return (
    <div>
      <div className={s["co-sec"]}>
        {t("gatherings:checkout.guest.sectionTitle")}
      </div>
      <div>
        {guests.map((g, i) => {
          const guestNumber = i + 2;
          return (
            <div key={i} className={s["co-guest-card"]}>
              <div className={s["co-guest-head"]}>
                <div className={s["co-guest-lbl"]}>
                  <span className={s["co-guest-num"]}>{guestNumber}</span>
                  {t("gatherings:checkout.guest.guestNumberLabel", {
                    number: guestNumber,
                  })}
                </div>
                <label className={s["co-gift-toggle"]}>
                  <input
                    type="checkbox"
                    checked={g.gift}
                    onChange={(e) => updateGuest(i, "gift", e.target.checked)}
                  />
                  <span className={s["co-gift-pill"]}>
                    <FiHeart /> {t("gatherings:checkout.guest.giftToggleLabel")}
                  </span>
                </label>
              </div>

              {g.gift ? (
                <>
                  <div className={s["co-field"]}>
                    <label className={s["co-lbl"]} htmlFor={`gmail${i}`}>
                      {t("gatherings:checkout.guest.emailLabel")}
                    </label>
                    <input
                      className={s["co-in"]}
                      id={`gmail${i}`}
                      type="email"
                      autoComplete={`section-guest${guestNumber} email`}
                      value={g.email}
                      onChange={(e) => updateGuest(i, "email", e.target.value)}
                      placeholder={t(
                        "gatherings:checkout.guest.emailPlaceholder",
                      )}
                    />
                  </div>
                  <div className={s["co-field"]} style={{ marginTop: 12 }}>
                    <label className={s["co-lbl"]} htmlFor={`gnote${i}`}>
                      {t("gatherings:checkout.guest.noteLabel")}{" "}
                      <span className={s.opt}>
                        {t("gatherings:checkout.guest.optionalTag")}
                      </span>
                    </label>
                    <textarea
                      className={s["co-ta"]}
                      id={`gnote${i}`}
                      value={g.note}
                      onChange={(e) => updateGuest(i, "note", e.target.value)}
                      placeholder={t(
                        "gatherings:checkout.guest.notePlaceholder",
                      )}
                    />
                  </div>
                  <div className={s["co-gift-note"]}>
                    {t("gatherings:checkout.guest.giftNote")}
                  </div>
                </>
              ) : (
                <>
                  <div className={s["co-grid-2"]}>
                    <div className={s["co-field"]}>
                      <label className={s["co-lbl"]} htmlFor={`gname${i}`}>
                        {t("gatherings:checkout.guest.nameLabel")}
                      </label>
                      <input
                        className={s["co-in"]}
                        id={`gname${i}`}
                        autoComplete={`section-guest${guestNumber} name`}
                        value={g.name}
                        onChange={(e) => updateGuest(i, "name", e.target.value)}
                        placeholder={t(
                          "gatherings:checkout.guest.namePlaceholder",
                        )}
                      />
                    </div>
                    <div className={s["co-field"]}>
                      <label className={s["co-lbl"]} htmlFor={`gpron${i}`}>
                        {t("gatherings:checkout.guest.pronounsLabel")}
                      </label>
                      <select
                        className={s["co-select"]}
                        id={`gpron${i}`}
                        value={g.pron}
                        onChange={(e) => updateGuest(i, "pron", e.target.value)}
                      >
                        <option value="">
                          {t("gatherings:checkout.guest.pronounsPlaceholder")}
                        </option>
                        {PRON_OPTIONS.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={s["co-field"]} style={{ marginTop: 12 }}>
                    <label className={s["co-lbl"]} htmlFor={`gdiet${i}`}>
                      {t("gatherings:checkout.guest.dietaryLabel")}
                    </label>
                    <input
                      className={s["co-in"]}
                      id={`gdiet${i}`}
                      value={g.dietary}
                      onChange={(e) =>
                        updateGuest(i, "dietary", e.target.value)
                      }
                      placeholder={t(
                        "gatherings:checkout.guest.dietaryPlaceholder",
                      )}
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
