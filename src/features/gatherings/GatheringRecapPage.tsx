import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { PhotoUploadModal, type RecapPhoto } from "./PhotoUploadModal";
import { GatheringRecapMain } from "./GatheringRecapSections";
import { GatheringRecapSidebar } from "./GatheringRecapSidebar";
import styles from "./GatheringRecapPage.module.css";

export function GatheringRecapPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submittedPhotos, setSubmittedPhotos] = useState<RecapPhoto[]>([]);

  function addPhoto(photo: RecapPhoto) {
    setSubmittedPhotos((prev) => [...prev, photo]);
    showToast("Your photo was added to the recap.", "success");
  }

  return (
    <AppShell unreadCount={3}>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>Gathering recap</div>
          <div className={styles.title}>
            Pride Brunch — <em>June Edition</em>
          </div>
          <div className={styles.meta}>
            Saturday 21 June 2026 · Príncipe Real, Lisbon
          </div>
          <div className={styles.attendedChip}>
            <FiCheck /> 38 attended
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <GatheringRecapMain
              loading={loading}
              submittedPhotos={submittedPhotos}
              onSubmitPhoto={() => setUploadOpen(true)}
            />
            <GatheringRecapSidebar
              onCopyLink={() => showToast("Link copied!", "success")}
            />
          </div>
        </div>
      </div>

      {uploadOpen && (
        <PhotoUploadModal
          onClose={() => setUploadOpen(false)}
          onSubmit={addPhoto}
        />
      )}
    </AppShell>
  );
}
