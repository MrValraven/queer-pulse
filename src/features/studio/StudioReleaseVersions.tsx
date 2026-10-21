import { useId, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioReleaseVersionView,
  StudioReleaseView,
} from "./api/studio.adapters";
import styles from "./StudioReleaseVersions.module.css";

function dateFormatFor(language: string): Intl.DateTimeFormatOptions {
  return {
    day: "numeric",
    month: language === "pt" ? "long" : "short",
    year: "numeric",
  };
}

function VersionLine({ entry }: { entry: StudioReleaseVersionView }) {
  const { t, language } = useTranslation();
  const formatters = useFormat();
  return (
    <>
      <p className={styles.label}>
        {t("studio:versions.line", {
          version: entry.version,
          date: formatters.date(
            new Date(entry.createdAt),
            dateFormatFor(language),
          ),
        })}
      </p>
      <p className={styles.note}>{entry.note}</p>
    </>
  );
}

/** Under the hero: what changed in the latest version, and the earlier
 *  notes on request. Nothing for a release still at version 1. */
export function StudioReleaseVersions({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const earlierId = useId();
  const [isEarlierOpen, setIsEarlierOpen] = useState(false);
  const latest = release.latestVersion;
  if (!latest) return null;
  const earlier = release.versions.filter(
    (entry) => entry.version !== latest.version,
  );
  return (
    <section
      className={styles.block}
      aria-label={t("studio:versions.blockLabel")}
    >
      <VersionLine entry={latest} />
      {earlier.length > 0 && (
        <>
          <Button
            variant="quiet"
            size="sm"
            className={styles.toggle}
            aria-expanded={isEarlierOpen}
            aria-controls={earlierId}
            onClick={() => setIsEarlierOpen((wasOpen) => !wasOpen)}
          >
            <FiChevronRight aria-hidden className={styles.chevron} />
            {t("studio:versions.earlierCta")}
          </Button>
          <div id={earlierId}>
            <Collapse isOpen={isEarlierOpen}>
              <ol className={styles.earlier}>
                {earlier.map((entry) => (
                  <li key={entry.version}>
                    <VersionLine entry={entry} />
                  </li>
                ))}
              </ol>
            </Collapse>
          </div>
        </>
      )}
    </section>
  );
}
