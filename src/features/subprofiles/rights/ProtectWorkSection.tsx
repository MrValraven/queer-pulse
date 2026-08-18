import { useState } from "react";
import { FiCopy, FiDownload, FiMail } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import { buildAuthorshipRecord } from "./authorshipRecord";
import styles from "./ProtectWorkSection.module.css";

/** `mailto:` bodies have no hard spec limit, but very long ones silently fail
 *  to open in some mail clients, so the embedded record is truncated well
 *  below that danger zone. The full record is always available via
 *  Download/Copy. */
const EMAIL_BODY_CHARACTER_LIMIT = 1500;

export interface ProtectWorkSectionProps {
  /** The saved item to build the authorship record for. */
  item: SubprofileItemView;
  /** The persona's display name, used as the record's author line. */
  authorName: string;
}

/**
 * Owner-only "Protect this work" section for the item editor drawer: builds
 * the authorship record (Task 4's `buildAuthorshipRecord`) on demand and
 * offers it three ways, all client-side (no API call, so dual-mode is
 * irrelevant here):
 * - Download: a `.txt` file via an object URL + a synthetic anchor click.
 * - Copy: `navigator.clipboard.writeText`, confirmed with a toast.
 * - Email: a `mailto:` link pre-filled with a subject and a truncated body,
 *   so the owner can send themselves a dated, independent copy.
 *
 * The caller (`SubprofileItemDrawer`) only renders this once the item is
 * already saved, since a brand-new draft has no real `createdAt` yet.
 */
export function ProtectWorkSection({ item, authorName }: ProtectWorkSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isBuildingRecord, setIsBuildingRecord] = useState(false);

  async function withAuthorshipRecord(
    action: (record: string) => void | Promise<void>,
  ) {
    setIsBuildingRecord(true);
    try {
      const record = await buildAuthorshipRecord({ item, authorName });
      await action(record);
    } catch {
      // Web Crypto unavailable (non-secure context) or the clipboard write
      // was denied: nothing actionable beyond letting the owner know and
      // retry, same shape as SubprofileShareCard's clipboard try/catch.
      showToast(t("subprofiles:protect.failed"), "error");
    } finally {
      setIsBuildingRecord(false);
    }
  }

  function downloadRecord(record: string) {
    const blob = new Blob([record], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const fileSlug = (item.title || "work")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    anchor.href = objectUrl;
    anchor.download = `authorship-${fileSlug}.txt`;
    // A detached anchor's `.click()` isn't reliable across browsers, so it
    // has to be attached to the document first (matches `downloadTextFile`
    // in `src/features/admin/roadmap/modals/auditCsv.ts`).
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  async function copyRecord(record: string) {
    await navigator.clipboard.writeText(record);
    showToast(t("subprofiles:protect.copied"), "success");
  }

  function emailRecord(record: string) {
    const subject = encodeURIComponent(`Authorship record: ${item.title}`);
    const body = encodeURIComponent(record.slice(0, EMAIL_BODY_CHARACTER_LIMIT));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <section className={`${styles.section} pe-field-wide`}>
      <h4 className={styles.heading}>{t("subprofiles:protect.heading")}</h4>
      <p className={styles.blurb}>{t("subprofiles:protect.blurb")}</p>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          disabled={isBuildingRecord}
          onClick={() => void withAuthorshipRecord(downloadRecord)}
        >
          <FiDownload aria-hidden /> {t("subprofiles:protect.download")}
        </Button>
        <Button
          variant="ghost"
          disabled={isBuildingRecord}
          onClick={() => void withAuthorshipRecord(copyRecord)}
        >
          <FiCopy aria-hidden /> {t("subprofiles:protect.copy")}
        </Button>
        <Button
          variant="ghost"
          disabled={isBuildingRecord}
          onClick={() => void withAuthorshipRecord(emailRecord)}
        >
          <FiMail aria-hidden /> {t("subprofiles:protect.email")}
        </Button>
      </div>
    </section>
  );
}
