import { useRef, useState } from "react";
import { FiDownload, FiUpload } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ToolPage } from "./tools/ToolPage";
import { useLocalStorage } from "./tools/useLocalStorage";
import { RateBoardForm } from "./RateBoardForm";
import { RateBoardStats } from "./RateBoardStats";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SEED,
  type Experience,
  type RateEntry,
  type RateType,
} from "./rateBoard.data";
import styles from "./RateBoardPage.module.css";

const STORAGE_KEY = "qp.economy.rateBoard";

const EXPERIENCES: Experience[] = ["junior", "mid", "senior", "lead"];
const TYPES: RateType[] = ["freelance", "employed"];

/** Validate + coerce one parsed object into a RateEntry (null if unusable). */
function coerceEntry(raw: unknown): RateEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.role !== "string" || o.role.trim() === "") return null;
  if (
    typeof o.dayRate !== "number" ||
    !Number.isFinite(o.dayRate) ||
    o.dayRate <= 0
  )
    return null;
  const experience = EXPERIENCES.includes(o.experience as Experience)
    ? (o.experience as Experience)
    : "mid";
  const type = TYPES.includes(o.type as RateType)
    ? (o.type as RateType)
    : "freelance";
  const id =
    typeof o.id === "string" && o.id
      ? o.id
      : "rb_imp_" + Math.random().toString(36).slice(2, 9);
  return {
    id,
    role: o.role.trim(),
    experience,
    dayRate: Math.round(o.dayRate),
    type,
  };
}

export function RateBoardPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [entries, setEntries] = useLocalStorage<RateEntry[]>(STORAGE_KEY, SEED);
  const [compareRate, setCompareRate] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAdd(entry: RateEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "queerpulse-rate-board.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(t("economy:rateBoard.exportedToast"), "success");
  }

  function mergeImported(parsed: unknown) {
    if (!Array.isArray(parsed)) {
      showToast(t("economy:rateBoard.invalidFileToast"), "error");
      return;
    }
    const valid = parsed
      .map(coerceEntry)
      .filter((e): e is RateEntry => e !== null);
    if (valid.length === 0) {
      showToast(t("economy:rateBoard.noValidEntriesToast"), "error");
      return;
    }
    setEntries((prev) => {
      const seen = new Set(prev.map((e) => e.id));
      const fresh = valid.filter((e) => !seen.has(e.id));
      return [...fresh, ...prev];
    });
    showToast(
      t("economy:rateBoard.importedToast", { count: valid.length }),
      "success",
    );
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        mergeImported(JSON.parse(String(reader.result)));
      } catch {
        showToast(t("economy:rateBoard.readErrorToast"), "error");
      }
    };
    reader.onerror = () =>
      showToast(t("economy:rateBoard.readErrorGenericToast"), "error");
    reader.readAsText(file);
  }

  const actions = (
    <>
      <Button variant="ghost" onClick={handleExport}>
        <FiDownload aria-hidden /> {t("economy:rateBoard.export")}
      </Button>
      <Button variant="ghost" onClick={() => fileRef.current?.click()}>
        <FiUpload aria-hidden /> {t("economy:rateBoard.import")}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className={styles.fileInput}
        onChange={handleFile}
        aria-label={t("economy:rateBoard.importAriaLabel")}
      />
    </>
  );

  return (
    <ToolPage
      eyebrow={t("economy:toolPage.eyebrowCommunity")}
      title={
        <Translation
          i18nKey="economy:rateBoard.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("economy:rateBoard.sub")}
      form={
        <RateBoardForm
          onAdd={handleAdd}
          compareRate={compareRate}
          onCompareChange={setCompareRate}
        />
      }
      preview={<RateBoardStats entries={entries} compareRate={compareRate} />}
      actions={actions}
    />
  );
}
