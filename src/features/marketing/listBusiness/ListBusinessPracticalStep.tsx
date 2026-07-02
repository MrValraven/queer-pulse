import { FiCheck, FiMapPin } from "react-icons/fi";
import { Button, FormField } from "../../../shared/components/ui";
import { ANCHOR, DAYS, validateSocials } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneHeader } from "./ListBusinessChrome";
import styles from "./ListBusinessPage.module.css";

const SOCIALS: {
  key: "instagram" | "website" | "email" | "phone";
  type: string;
  placeholder: string;
  err: string;
}[] = [
  {
    key: "instagram",
    type: "text",
    placeholder: "Instagram · @handle",
    err: "",
  },
  {
    key: "website",
    type: "url",
    placeholder: "Website · yourplace.pt",
    err: "That doesn't look like a web address.",
  },
  {
    key: "email",
    type: "email",
    placeholder: "Email · hello@yourplace.pt",
    err: "That doesn't look like an email.",
  },
  {
    key: "phone",
    type: "tel",
    placeholder: "Phone · +351 …",
    err: "That doesn't look like a phone number.",
  },
];

export function StepPractical({ form }: { form: ListingForm }) {
  const { draft, set, setDay, copyMonToAll, clearHours, setSocial } = form;
  const socialOk = validateSocials(draft.social);
  const anyOpen = DAYS.some((d) => draft.hours[d.id]?.open);

  return (
    <>
      <PaneHeader
        title="The"
        em="practical"
        sub="How people find you, when you're open, and where to reach you. Share only what you want public."
      />

      <FormField
        id={ANCHOR.address}
        label="Address"
        required
        helper="Street and number is enough — we'll place the pin from there."
      >
        <div className={styles.geoRow}>
          <div>
            <input
              type="text"
              maxLength={120}
              placeholder="R. Antero de Quental 26, 1170-024 Lisboa"
              value={draft.address}
              onChange={(e) =>
                set({ address: e.target.value, geocoded: false })
              }
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => set({ geocoded: draft.address.trim().length > 0 })}
          >
            Find on map
          </Button>
        </div>
      </FormField>
      {draft.geocoded && (
        <>
          <div className={styles.mapBox}>
            {/* Decorative stand-in map illustration (no real geocoding in the
                prototype); flat greys are intentional, not themed surfaces. */}
            <svg
              viewBox="0 0 600 260"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              <rect width="600" height="260" fill="#e9e5db" />
              <path d="M0 80 L600 96 L600 108 L0 92 Z" fill="#d9d3c5" />
              <path d="M0 168 L600 184 L600 196 L0 180 Z" fill="#d9d3c5" />
              <path d="M150 0 L168 260 L182 260 L164 0 Z" fill="#d9d3c5" />
              <path d="M400 0 L418 260 L432 260 L414 0 Z" fill="#d9d3c5" />
              <rect x="240" y="104" width="70" height="64" fill="#cfc8b5" />
              <circle cx="300" cy="132" r="26" fill="#b8d4b1" opacity=".7" />
            </svg>
            <span className={styles.pin}>
              <FiMapPin size={28} fill="currentColor" stroke="var(--paper)" />
            </span>
          </div>
          <div className={styles.mapStatus}>
            <FiCheck size={13} /> Pin placed near {draft.address.split(",")[0]}
          </div>
        </>
      )}

      <h3 className={styles.groupH}>Opening hours *</h3>
      <div className={styles.hoursTools}>
        <span
          className={[
            styles.openNow,
            anyOpen ? styles.openNowOpen : styles.openNowClosed,
          ].join(" ")}
        >
          {anyOpen ? "Has open hours" : "All closed"}
        </span>
        <button
          type="button"
          className={styles.hoursToolBtn}
          onClick={copyMonToAll}
        >
          Copy Monday to all days
        </button>
        <button
          type="button"
          className={styles.hoursToolBtn}
          onClick={clearHours}
        >
          Mark all closed
        </button>
      </div>
      <div id={ANCHOR.hours} className={styles.hoursGrid}>
        {DAYS.map((d) => {
          const h = draft.hours[d.id]!;
          return (
            <div key={d.id} className={styles.hrow}>
              <span className={styles.hday}>{d.label}</span>
              <button
                type="button"
                aria-pressed={h.open}
                className={[styles.htg, h.open && styles.htgOpen]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setDay(d.id, { open: !h.open })}
              >
                {h.open ? "Open" : "Closed"}
              </button>
              <div className={styles.htimes}>
                {h.open ? (
                  <>
                    <input
                      type="time"
                      value={h.from}
                      aria-label={`${d.label} opens`}
                      onChange={(e) => setDay(d.id, { from: e.target.value })}
                    />
                    <span className={styles.dash}>–</span>
                    <input
                      type="time"
                      value={h.to}
                      aria-label={`${d.label} closes`}
                      onChange={(e) => setDay(d.id, { to: e.target.value })}
                    />
                  </>
                ) : (
                  <span className={styles.closedLbl}>Closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <FormField label="A short hours note — optional">
        <input
          type="text"
          maxLength={80}
          placeholder="Closed Mondays. The back room books separately."
          value={draft.hoursNote}
          onChange={(e) => set({ hoursNote: e.target.value })}
        />
      </FormField>

      <h3 className={styles.groupH}>Find you online</h3>
      <p className={styles.onlineHint}>
        You choose what's public. Leave anything blank you'd rather keep off the
        listing.
      </p>
      <div id={ANCHOR.social} className={styles.twoCol}>
        {SOCIALS.map((s) => {
          const value = draft.social[s.key];
          const valid = socialOk[s.key];
          return (
            <FormField key={s.key} error={!valid && s.err ? s.err : undefined}>
              <input
                type={s.type}
                aria-invalid={!valid}
                placeholder={s.placeholder}
                value={value}
                onChange={(e) => setSocial(s.key, e.target.value)}
              />
            </FormField>
          );
        })}
      </div>
    </>
  );
}
