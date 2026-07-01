import { DAYS, initials, PRICES, type ListingDraft } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

function hoursLine(draft: ListingDraft): string | null {
  const open = DAYS.filter((d) => draft.hours[d.id]?.open);
  const first = open[0];
  if (!first) return null;
  const sample = draft.hours[first.id]!;
  return `${open.map((d) => d.id).join(", ")} · ${sample.from}–${sample.to}`;
}

/** Sticky directory-card + detail-page preview that mirrors the live form. */
export function ListBusinessPreview({
  draft,
  userName,
}: {
  draft: ListingDraft;
  userName: string;
}) {
  const hasCard = draft.name.trim().length > 0;
  const price = PRICES.find((p) => p.id === draft.price);
  const wit = draft.whatItIs.filter((w) => w.text.trim());
  const hrs = hoursLine(draft);
  const showOwner = draft.visibility !== "anon" && draft.ownerName.trim();

  return (
    <aside className={styles.previewCol}>
      <div className={styles.pvHead}>
        <span className={styles.dot} />
        Live preview · updates as you type
      </div>

      <div
        className={[styles.dirCard, !hasCard && styles.dirCardEmpty]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.dirTop}>
          <span
            className={[styles.dirAv, !hasCard && styles.dirAvEmpty]
              .filter(Boolean)
              .join(" ")}
          >
            {hasCard ? initials(draft.name) : "+"}
          </span>
          <div>
            <div className={styles.dirName}>
              {hasCard ? (
                draft.name
              ) : (
                <span className={styles.dirNamePh}>Your place</span>
              )}
            </div>
            <div className={styles.dirMeta}>
              {draft.cats.length || draft.hood
                ? [draft.cats.join(", "), draft.hood]
                    .filter(Boolean)
                    .join(" · ")
                : "Category · neighbourhood"}
            </div>
          </div>
        </div>

        {(draft.badge || price) && (
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
        )}

        <div
          className={[styles.dirBlurb, !draft.blurb && styles.dirBlurbPh]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.blurb ||
            "Your place will appear here as you fill in the form — exactly as it'll look in the directory grid."}
        </div>

        {draft.tags.length > 0 && (
          <div className={styles.dirTags}>
            {draft.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.pvDetail}>
        <div
          className={[styles.pdTagline, !draft.tagline && styles.pdTaglinePh]
            .filter(Boolean)
            .join(" ")}
        >
          {draft.tagline ||
            "Your tagline becomes the pull-quote at the top of your page."}
        </div>

        {wit.length > 0 && (
          <div className={styles.pdSec}>
            <h5>What it is</h5>
            <ul className={styles.pdWit}>
              {wit.map((w) => (
                <li key={w.id}>{w.text}</li>
              ))}
            </ul>
          </div>
        )}

        {draft.goodFor.length > 0 && (
          <div className={styles.pdSec}>
            <h5>Good for</h5>
            <div className={styles.pdChips}>
              {draft.goodFor.map((g) => (
                <span key={g}>{g}</span>
              ))}
            </div>
          </div>
        )}

        {draft.langs.length > 0 && (
          <div className={styles.pdSec}>
            <h5>Languages</h5>
            <div className={styles.pdChips}>
              {draft.langs.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        )}

        {hrs && (
          <div className={styles.pdSec}>
            <h5>Hours</h5>
            <div className={styles.dirMeta}>{hrs}</div>
          </div>
        )}

        {showOwner && (
          <div className={styles.pdOwner}>
            <span className={styles.pdOwnerAv}>
              {initials(draft.ownerName)}
            </span>
            <div>
              <div className={styles.pdOwnerName}>
                {draft.visibility === "role"
                  ? draft.ownerRole
                  : draft.ownerName}
              </div>
              <div className={styles.pdOwnerRole}>
                {draft.visibility === "role"
                  ? "Role shown · name private"
                  : draft.ownerRole || "Your role"}
                {draft.linkToProfile ? ` · ${userName}` : ""}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.pvFoot}>
        This is a preview. Your listing goes live only after the community team
        reviews it.
      </div>
    </aside>
  );
}
