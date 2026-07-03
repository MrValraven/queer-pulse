import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobSidebar({
  form,
  company,
  onOpenFull,
}: {
  form: PostJobForm;
  company: CompanyProfile;
  onOpenFull: () => void;
}) {
  const { state, payLabel } = form;
  const chips = [state.category, state.format, state.commitment];
  if (state.seniority !== "Any level") chips.push(state.seniority);
  const desc = state.description
    ? state.description.slice(0, 150) +
      (state.description.length > 150 ? "…" : "")
    : "";

  return (
    <aside>
      <div className={styles.sideCard}>
        <h3 className={styles.sideH}>
          Live preview
          <button type="button" className={styles.expand} onClick={onOpenFull}>
            Full view
          </button>
        </h3>
        <div className={styles.previewCard}>
          <div className={styles.pvTop}>
            <span className={styles.pvType}>Hiring</span>
            {payLabel && <span className={styles.pvComp}>{payLabel}</span>}
          </div>
          <div className={styles.previewTitle}>
            {state.title || "Your title will appear here"}
          </div>
          <div className={styles.pvPoster}>
            <span className={styles.pvAv}>{company.logo}</span>
            <span className={styles.pvPosterName}>{company.nameText}</span>
          </div>
          <div
            className={[styles.previewDesc, !desc && styles.empty]
              .filter(Boolean)
              .join(" ")}
          >
            {desc || "Add a description…"}
          </div>
          <div className={styles.previewMeta}>
            {chips.map((c) => (
              <span key={c} className={styles.previewChip}>
                {c}
              </span>
            ))}
            {state.inclusivity.slice(0, 2).map((c) => (
              <span
                key={c}
                className={[styles.previewChip, styles.previewChipIncl].join(
                  " ",
                )}
              >
                {c}
              </span>
            ))}
          </div>
          <button
            type="button"
            className={styles.viewFull}
            onClick={onOpenFull}
          >
            See full listing →
          </button>
        </div>
      </div>

      <div className={styles.sideCard}>
        <h3 className={styles.sideH}>How this works</h3>
        <div className={styles.sideList}>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              Listings are <strong>visible to members</strong>, never public.
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              Listings <strong>expire after 60 days</strong> — reminder at 45.
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <strong>No placement fees.</strong> A community board, not a
              marketplace.
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <strong>Edit or close</strong> any time from your company profile.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
