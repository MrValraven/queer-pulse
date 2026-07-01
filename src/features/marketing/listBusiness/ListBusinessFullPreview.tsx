import { FiCheck } from "react-icons/fi";
import { ImageSlot, Modal } from "../../../shared/components/ui";
import { DAYS, initials, PRICES, type ListingDraft } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

/** Full-page preview of the listing as it will appear once live. */
export function ListBusinessFullPreview({
  draft,
  userName,
  onClose,
}: {
  draft: ListingDraft;
  userName: string;
  onClose: () => void;
}) {
  const price = PRICES.find((p) => p.id === draft.price);
  const wit = draft.whatItIs.filter((w) => w.text.trim());
  const openDays = DAYS.filter((d) => draft.hours[d.id]?.open);
  const showName = draft.visibility !== "anon" && draft.ownerName.trim();
  const social = [
    draft.social.instagram && `Instagram · ${draft.social.instagram}`,
    draft.social.website,
    draft.social.email,
    draft.social.phone,
  ].filter(Boolean) as string[];

  return (
    <Modal
      wide
      eyebrow="Full-page preview"
      title={draft.name || "Your place"}
      sub="This is how your listing will look in the directory once the team approves it."
      onClose={onClose}
    >
      <div className={styles.fp}>
        <div className={styles.fpHeadRow}>
          <span className={styles.dirAv}>
            {draft.name ? initials(draft.name) : "+"}
          </span>
          <div>
            <div className={styles.fpMeta}>
              {[draft.cats.join(", "), draft.hood, price?.label]
                .filter(Boolean)
                .join(" · ") || "Category · neighbourhood"}
            </div>
            <div className={styles.dirBadgeRow}>
              {draft.badge === "owned" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeJade}`}>
                  Queer-owned
                </span>
              )}
              {draft.badge === "friendly" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeCoral}`}>
                  LGBTQ+ friendly
                </span>
              )}
              {price && (
                <span className={`${styles.dirBadge} ${styles.dirBadgePrice}`}>
                  {price.sym}
                </span>
              )}
            </div>
          </div>
        </div>

        {draft.tagline && <p className={styles.fpTagline}>{draft.tagline}</p>}

        <div className={styles.fpGallery}>
          <ImageSlot
            className={styles.fpGalWide}
            tint="coral"
            radius={16}
            height={200}
            placeholder="Wide shot of the space"
            alt={draft.alt.wide}
          />
          <ImageSlot
            tint="jade"
            radius={16}
            height={120}
            placeholder="A detail"
            alt={draft.alt.d1}
          />
          <ImageSlot
            tint="plum"
            radius={16}
            height={120}
            placeholder="A detail"
            alt={draft.alt.d2}
          />
          <ImageSlot
            tint="coral"
            radius={16}
            height={120}
            placeholder="People / vibe"
            alt={draft.alt.vibe}
          />
        </div>

        {draft.blurb && <p className={styles.fpBlurb}>{draft.blurb}</p>}

        {wit.length > 0 && (
          <section className={styles.fpSec}>
            <h4>What it is</h4>
            <ul className={styles.pdWit}>
              {wit.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
          </section>
        )}

        {draft.goodFor.length > 0 && (
          <section className={styles.fpSec}>
            <h4>Good for</h4>
            <div className={styles.fpGoodFor}>
              {draft.goodFor.map((g) => (
                <span key={g} className={styles.fpGoodForRow}>
                  <FiCheck size={13} /> {g}
                </span>
              ))}
            </div>
          </section>
        )}

        {(draft.langs.length > 0 || draft.tags.length > 0) && (
          <section className={styles.fpSec}>
            <h4>Good to know</h4>
            <div className={styles.pdChips}>
              {draft.langs.map((l) => (
                <span key={`l-${l}`}>{l}</span>
              ))}
              {draft.tags.map((t) => (
                <span key={`t-${t}`}>{t}</span>
              ))}
            </div>
          </section>
        )}

        {openDays.length > 0 && (
          <section className={styles.fpSec}>
            <h4>Opening hours</h4>
            <div className={styles.fpHours}>
              {DAYS.map((d) => {
                const h = draft.hours[d.id]!;
                return (
                  <div key={d.id} className={styles.fpHrow}>
                    <span>{d.label}</span>
                    <span>{h.open ? `${h.from}–${h.to}` : "Closed"}</span>
                  </div>
                );
              })}
            </div>
            {draft.hoursNote && (
              <p className={styles.fpHoursNote}>{draft.hoursNote}</p>
            )}
          </section>
        )}

        {(draft.address || social.length > 0) && (
          <section className={styles.fpSec}>
            <h4>Find it</h4>
            {draft.address && <p className={styles.fpAddr}>{draft.address}</p>}
            {social.length > 0 && (
              <div className={styles.pdChips}>
                {social.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            )}
          </section>
        )}

        {showName && (
          <section className={styles.fpSec}>
            <h4>Who runs it</h4>
            <div className={styles.pdOwner}>
              <span className={styles.pdOwnerAv}>
                {initials(draft.ownerName)}
              </span>
              <div>
                <div className={styles.pdOwnerName}>
                  {draft.visibility === "role"
                    ? draft.ownerRole
                    : draft.ownerName}
                  {draft.linkToProfile ? ` · ${userName}` : ""}
                </div>
                <div className={styles.pdOwnerRole}>
                  {draft.visibility === "role"
                    ? "Role shown · name private"
                    : draft.ownerRole}
                </div>
              </div>
            </div>
            {draft.ownerBio && <p className={styles.fpBio}>{draft.ownerBio}</p>}
          </section>
        )}
      </div>
    </Modal>
  );
}
