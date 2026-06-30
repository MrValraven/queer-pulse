import { FiCheck } from "react-icons/fi";
import {
  ACCESS_OPTIONS,
  CONFIRM_CHECKS,
  HOODS,
  LANGS,
  TYPES,
} from "./createGathering.data";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringPage.module.css";

export function TypeStep({ form }: { form: GatheringForm }) {
  return (
    <div>
      <div className={styles.stepTitle}>
        What kind of <em>gathering?</em>
      </div>
      <p className={styles.stepSub}>
        Choose the format. This determines some of the fields that follow.
      </p>
      <div className={styles.types}>
        {TYPES.map((t) => (
          <button
            key={t.name}
            type="button"
            className={[
              styles.typeCard,
              form.type === t.name && styles.typeCardSelected,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => form.selectType(t.name, t.icon)}
          >
            <div className={styles.typeIcon}>
              <t.icon />
            </div>
            <span className={styles.typeName}>{t.name}</span>
            <span className={styles.typeSub}>{t.sub}</span>
          </button>
        ))}
      </div>
      <label className={styles.label}>Event title</label>
      <input
        className={styles.input}
        type="text"
        placeholder="A clear, specific title — not a pun, not a mystery"
        value={form.title}
        onChange={(e) => form.setTitle(e.target.value)}
      />
      <label className={styles.label}>Short description</label>
      <textarea
        className={styles.textarea}
        placeholder="What will people do? What should they expect? What makes this gathering worth attending?"
        value={form.desc}
        onChange={(e) => form.setDesc(e.target.value)}
      />
    </div>
  );
}

export function DatePlaceStep({ form }: { form: GatheringForm }) {
  return (
    <div>
      <div className={styles.stepTitle}>
        When and <em>where?</em>
      </div>
      <p className={styles.stepSub}>
        The location is only shared with confirmed attendees — not shown on the
        public listing.
      </p>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => form.setDate(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Time</label>
          <input
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => form.setTime(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>End time (optional)</label>
          <input
            className={styles.input}
            type="time"
            value={form.endTime}
            onChange={(e) => form.setEndTime(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Neighbourhood</label>
          <select
            className={styles.select}
            value={form.hood}
            onChange={(e) => form.setHood(e.target.value)}
          >
            <option value="">Select…</option>
            {HOODS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>
      <label className={styles.label}>Venue name</label>
      <input
        className={styles.input}
        type="text"
        placeholder="e.g. Casa da Mariquinhas, My studio, Jardim do Torel"
        value={form.venue}
        onChange={(e) => form.setVenue(e.target.value)}
      />
      <label className={styles.label}>
        Full address (shared only with confirmed attendees)
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder="Street address"
        value={form.address}
        onChange={(e) => form.setAddress(e.target.value)}
      />
      <label className={styles.label}>Getting there (optional)</label>
      <input
        className={styles.input}
        type="text"
        placeholder="e.g. Ring the bell on the left, 5 min walk from Intendente metro"
        value={form.directions}
        onChange={(e) => form.setDirections(e.target.value)}
      />
    </div>
  );
}

export function CapacityStep({ form }: { form: GatheringForm }) {
  return (
    <div>
      <div className={styles.stepTitle}>
        Who and <em>how many?</em>
      </div>
      <p className={styles.stepSub}>
        Set a realistic cap. It's easier to open more spots than to turn people
        away at the door.
      </p>
      <div className={styles.row2}>
        <div>
          <label className={styles.label}>Capacity</label>
          <input
            className={styles.input}
            type="number"
            min={2}
            max={200}
            placeholder="Max attendees"
            value={form.cap}
            onChange={(e) => form.setCap(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.label}>Language</label>
          <select
            className={styles.select}
            value={form.lang}
            onChange={(e) => form.setLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>
      <label className={styles.label}>
        Accessibility — what can you confirm?
      </label>
      <p className={styles.hint}>
        Only tick what you can genuinely confirm. Attendees will rely on this
        information.
      </p>
      <div className={styles.accessList}>
        {ACCESS_OPTIONS.map((name) => {
          const on = form.access.has(name);
          return (
            <div
              key={name}
              className={[styles.accessItem, on && styles.accessItemSelected]
                .filter(Boolean)
                .join(" ")}
              onClick={() => form.toggleAccess(name)}
              role="checkbox"
              aria-checked={on}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  form.toggleAccess(name);
                }
              }}
            >
              <div className={styles.accessCheck}>{on ? <FiCheck /> : ""}</div>
              <span className={styles.accessName}>{name}</span>
            </div>
          );
        })}
      </div>
      <label className={styles.label}>Accessibility notes (optional)</label>
      <input
        className={styles.input}
        type="text"
        placeholder="Anything else attendees should know — steps, parking, sound level…"
        value={form.accessNotes}
        onChange={(e) => form.setAccessNotes(e.target.value)}
      />
    </div>
  );
}

export function PricingStep({ form }: { form: GatheringForm }) {
  return (
    <div>
      <div className={styles.stepTitle}>
        Tickets and <em>pricing.</em>
      </div>
      <p className={styles.stepSub}>
        QueerPulse takes 0% of ticket revenue. All money goes directly to you.
        Sliding scale is mandatory for any paid event.
      </p>
      <div
        className={styles.freeToggle}
        onClick={() => form.setFree(!form.free)}
        role="checkbox"
        aria-checked={form.free}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            form.setFree(!form.free);
          }
        }}
      >
        <div
          className={[styles.freeCheck, form.free && styles.freeCheckOn]
            .filter(Boolean)
            .join(" ")}
        >
          {form.free ? <FiCheck /> : ""}
        </div>
        <div>
          <div className={styles.freeLabel}>Free event — no tickets needed</div>
        </div>
      </div>
      {!form.free && (
        <div>
          <p className={styles.hint}>
            Set three tiers. The sliding scale is not optional — if your event
            is paid, all three tiers must be offered. Members choose their tier
            privately.
          </p>
          <div className={styles.tierHead}>
            <span />
            <span className={styles.tierColHead}>Price / person</span>
            <span className={styles.tierColHead}>Spots</span>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>Free / solidarity</span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="0"
                aria-label="Free / solidarity price in euros"
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="3"
                aria-label="Free / solidarity number of spots"
              />
              <span className={styles.spotsSuffix}>ppl</span>
            </div>
            <span />
          </div>
          <div className={styles.tierNote}>
            This tier is for members who cannot afford to pay. Set aside at
            least 2–3 spots.
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>Standard</span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.stdPrice}
                onChange={(e) => form.setStdPrice(e.target.value)}
                aria-label="Standard price in euros"
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="8"
                aria-label="Standard number of spots"
              />
              <span className={styles.spotsSuffix}>ppl</span>
            </div>
            <span />
          </div>
          <div className={styles.tierRow}>
            <span className={styles.tierLabel}>Supporter</span>
            <div className={styles.moneyCell}>
              <span className={styles.moneyPrefix}>€</span>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                value={form.supPrice}
                onChange={(e) => form.setSupPrice(e.target.value)}
                aria-label="Supporter price in euros"
              />
            </div>
            <div className={styles.spotsCell}>
              <input
                className={styles.tierInput}
                type="number"
                min={0}
                defaultValue="5"
                aria-label="Supporter number of spots"
              />
              <span className={styles.spotsSuffix}>ppl</span>
            </div>
            <span />
          </div>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            Supporter tier income subsidises the free tier. Suggested: standard
            × 1.8.
          </p>
        </div>
      )}
      <label className={styles.label} style={{ marginTop: 4 }}>
        What's included in the ticket?
      </label>
      <input
        className={styles.input}
        type="text"
        placeholder="e.g. Shared dinner and wine, materials provided, just your time"
        value={form.included}
        onChange={(e) => form.setIncluded(e.target.value)}
      />
      <label className={styles.label}>Anything to bring / prepare?</label>
      <input
        className={styles.input}
        type="text"
        placeholder="Optional — e.g. Bring something to share, wear comfortable shoes"
        value={form.bring}
        onChange={(e) => form.setBring(e.target.value)}
      />
    </div>
  );
}

export function ReviewStep({ form }: { form: GatheringForm }) {
  const TypeIcon = form.typeIcon;
  const accessList = [...form.access];
  const accessVal =
    accessList.length || form.accessNotes.trim() ? (
      <span className={styles.reviewAccess}>
        {accessList.map((a) => (
          <span key={a} className={styles.reviewAccessTag}>
            <FiCheck /> {a}
          </span>
        ))}
        {form.accessNotes.trim() && (
          <span className={styles.reviewAccessNote}>
            {form.accessNotes.trim()}
          </span>
        )}
      </span>
    ) : (
      <span className={styles.reviewAccessEmpty}>
        None specified yet — add what you can confirm
      </span>
    );
  const review = [
    {
      l: "Type",
      v: (
        <>
          {TypeIcon && <TypeIcon />} <strong>{form.type || "—"}</strong>
        </>
      ),
    },
    { l: "Title", v: <strong>{form.title || "—"}</strong> },
    { l: "Date & time", v: `${form.date || "—"} at ${form.time || "—"}` },
    { l: "Location", v: `${form.venue || "—"}, ${form.hood || "—"}` },
    { l: "Capacity", v: `${form.cap || "—"} people · ${form.lang}` },
    {
      l: "Pricing",
      v: form.free
        ? "Free event"
        : `Sliding scale · Free / €${form.stdPrice || "—"} / €${form.supPrice || "—"}`,
    },
    { l: "Accessibility", v: accessVal },
  ];
  const remaining = 3 - form.checkedCount;
  return (
    <div>
      <div className={styles.stepTitle}>
        Review and <em>publish.</em>
      </div>
      <p className={styles.stepSub}>
        Check the details before your gathering goes live.
      </p>
      <div className={styles.reviewGrid}>
        {review.map((r) => (
          <div className={styles.reviewRow} key={r.l}>
            <div className={styles.reviewLbl}>{r.l}</div>
            <div className={styles.reviewVal}>{r.v}</div>
          </div>
        ))}
      </div>
      <div className={styles.label} style={{ marginBottom: 4 }}>
        Before you publish — confirm all three
      </div>
      <p className={styles.checkIntro}>
        Tick each box to confirm. The <strong>Publish gathering</strong> button
        stays disabled until all three are checked.
      </p>
      {CONFIRM_CHECKS.map((text, i) => (
        <div
          key={text}
          className={styles.checkRow}
          onClick={() => form.toggleCheck(i)}
          role="checkbox"
          aria-checked={form.checks[i]}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              form.toggleCheck(i);
            }
          }}
        >
          <div
            className={[styles.check, form.checks[i] && styles.checkOn]
              .filter(Boolean)
              .join(" ")}
          >
            {form.checks[i] ? <FiCheck /> : ""}
          </div>
          <span className={styles.checkText}>{text}</span>
        </div>
      ))}
      <div
        className={[
          styles.publishStatus,
          form.allChecked && styles.publishStatusReady,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {form.allChecked ? (
          "All set — you can publish now."
        ) : (
          <>
            <span className={styles.checkCount}>{form.checkedCount}</span> of 3
            confirmed — tick the{" "}
            {remaining === 1 ? (
              "last box"
            ) : (
              <>
                remaining <span className={styles.checkCount}>{remaining}</span>{" "}
                boxes
              </>
            )}{" "}
            to publish.
          </>
        )}
      </div>
    </div>
  );
}
