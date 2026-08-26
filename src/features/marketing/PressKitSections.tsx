import { useMemo, useState } from "react";
import { FiArrowDown } from "react-icons/fi";
import { useClipboard } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  buildBoiler,
  buildDownloads,
  buildLogos,
  buildSwatches,
} from "./pressKit.data";
import { usePressKit } from "./api/usePressKit";
import { PressKitDownloadModal } from "./PressKitDownloadModal";
import { PRESS_ASSETS, buildKitPreview } from "./pressKitAssets.data";
import logoStyles from "./MarketingModal.module.css";
import styles from "./PressKitPage.module.css";

const FACTS_AS_OF = new Date(2026, 4, 14);

// The brand wordmark is content, not chrome — it's a fixed English proper
// noun (see docs/i18n/glossary-pt.md: "QueerPulse — Brand name. Never
// translated."), rendered from constants rather than a literal JSX string so
// the i18n sweep's no-literal-string lint stays satisfied without a catalog
// key. Same precedent as `GatheringDashboardPage.tsx`.
const BRAND_QUEER = "Queer";
const BRAND_PULSE = "Pulse";

type BoilerItem = ReturnType<typeof buildBoiler>[number];

/**
 * One boilerplate paragraph with an inline copy-to-clipboard button that swaps
 * its label to "Copied" for a moment. Each row owns its own `useClipboard`
 * state so several rows can show the copied affordance independently — the
 * shared hook replaces the hand-rolled `navigator.clipboard` + `setTimeout`
 * this section used to inline.
 */
function BoilerCopyRow({ item }: { item: BoilerItem }) {
  const { t } = useTranslation();
  const { copy, copied } = useClipboard(1600);
  return (
    <div className={styles.boiler}>
      <div className={styles.boilerH}>
        {item.label}
        <span className={styles.wc}>{item.wc}</span>
      </div>
      <button
        type="button"
        className={[styles.boilerCopy, copied && styles.copied]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void copy(item.text)}
      >
        {copied
          ? t("marketing:pressKit.boiler.copiedCta")
          : t("marketing:pressKit.boiler.copyCta")}
      </button>
      <div className={styles.boilerText}>{item.text}</div>
    </div>
  );
}

export function BoilerplateSection() {
  const { t } = useTranslation();
  const boiler = useMemo(() => buildBoiler(t), [t]);
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.boiler.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§01</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.boiler.section.lead"
          components={{ b: <b /> }}
        />
      </p>
      {boiler.map((b) => (
        <BoilerCopyRow item={b} key={b.id} />
      ))}
    </section>
  );
}

export function MarkSection() {
  const { t } = useTranslation();
  const logos = useMemo(() => buildLogos(), []);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openLogo = openIndex !== null ? logos[openIndex] : null;
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.mark.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§02</span>
      </div>
      <p>{t("marketing:pressKit.mark.section.lead")}</p>
      <div className={styles.logoGrid}>
        {logos.map((logo, index) => (
          <div className={styles.logoCard} key={logo.asset.filename}>
            <div className={`${styles.logoDisplay} ${styles[logo.display]}`}>
              <span
                className={[
                  styles.logoMark,
                  ...logo.mark.split(" ").map((markClass) => styles[markClass]),
                ].join(" ")}
              >
                <span className={styles.logoDot} />
                <span>
                  {BRAND_QUEER}
                  <span className={styles.q}>{BRAND_PULSE}</span>
                </span>
              </span>
            </div>
            <div className={styles.logoMeta}>
              <span>{logo.meta}</span>
              <button type="button" onClick={() => setOpenIndex(index)}>
                {t("marketing:pressKit.mark.downloadLinkLabel")}
              </button>
            </div>
          </div>
        ))}
      </div>
      {openLogo && (
        <PressKitDownloadModal
          eyebrow={t("marketing:pressKit.mark.modal.eyebrow")}
          title={
            <Translation
              i18nKey="marketing:pressKit.mark.modal.title"
              components={{ em: <em /> }}
            />
          }
          lead={
            <Translation
              i18nKey="marketing:pressKit.mark.modal.lead"
              components={{ b: <b /> }}
              values={{ filename: openLogo.asset.filename }}
            />
          }
          asset={openLogo.asset}
          preview={
            <div
              className={`${logoStyles.logoStage} ${styles[openLogo.display]}`}
            >
              {/* The real file, so the preview and the download can never
                  drift apart. Decorative: the modal's own title and lead
                  already name the mark and its colourway. */}
              <img
                className={styles.logoPreviewImg}
                src={openLogo.asset.path}
                alt=""
              />
            </div>
          }
          buttonLabel={t("marketing:pressKit.mark.modal.buttonLabel")}
          onClose={() => setOpenIndex(null)}
        />
      )}
      <p className={styles.markUsageNote}>
        <Translation
          i18nKey="marketing:pressKit.mark.usageNote"
          components={{ b: <b />, em: <em /> }}
        />
      </p>
    </section>
  );
}

export function ColourSection() {
  const { t } = useTranslation();
  const swatches = useMemo(() => buildSwatches(t), [t]);
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.colour.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§03</span>
      </div>
      <p>{t("marketing:pressKit.colour.section.lead")}</p>
      <div className={styles.swatchRow}>
        {swatches.map((s) => (
          <div className={styles.swatch} key={s.name}>
            <div
              className={styles.swatchChip}
              style={{
                background: s.background,
                border: s.border ? "1px solid rgba(45,27,61,.10)" : undefined,
              }}
            />
            <div className={styles.swatchName}>{s.name}</div>
            <div className={styles.swatchHex}>{s.hex}</div>
            <div className={styles.swatchMeta}>{s.meta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Cosmetic placeholder-avatar tints, cycled by row index (purely presentational
 *  — the live contact data carries no colour). */
const TEAM_PLACEHOLDER_TINTS = ["", "phJade", "phPlum"];

/** Up-to-two-letter initials for the placeholder avatar when no photo exists. */
function teamInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeamSection() {
  const { contacts } = usePressKit();
  if (contacts.length === 0) return null;
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.team.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§04</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.team.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.teamGrid}>
        {contacts.map((contact, index) => {
          const tint =
            TEAM_PLACEHOLDER_TINTS[index % TEAM_PLACEHOLDER_TINTS.length];
          return (
            <div className={styles.teamCard} key={contact.id}>
              <div
                className={[styles.ph, tint && styles[tint]]
                  .filter(Boolean)
                  .join(" ")}
              >
                {contact.avatarUrl ? (
                  <img
                    className={styles.phImg}
                    src={contact.avatarUrl}
                    alt=""
                  />
                ) : (
                  teamInitials(contact.name)
                )}
              </div>
              <h4>{contact.name}</h4>
              <div className={styles.teamRole}>{contact.role}</div>
              <p>{contact.description}</p>
              <div className={styles.teamLangs}>{contact.languages}</div>
              <div className={styles.teamContact}>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FactsSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { facts } = usePressKit();
  if (facts.length === 0) return null;
  const asOf = fmt.date(FACTS_AS_OF, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.facts.section.title"
            components={{ em: <em /> }}
            values={{ date: asOf }}
          />
        </h2>
        <span className={styles.secNum}>§05</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.facts.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.factsGrid}>
        {facts.map((fact) => (
          <div className={styles.fact} key={fact.key}>
            <b>{fact.value}</b>
            <span>{t(`marketing:pressKit.facts.${fact.key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CoverageSection() {
  const { coverage } = usePressKit();
  if (coverage.length === 0) return null;
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.coverage.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§06</span>
      </div>
      <p>
        <Translation
          i18nKey="marketing:pressKit.coverage.section.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.covList}>
        {coverage.map((item) => {
          const body = (
            <>
              <div>
                <div className={styles.covSource}>{item.source}</div>
                <div className={styles.covTitle}>{item.title}</div>
                <div className={styles.covMeta}>{item.meta}</div>
              </div>
              <div className={styles.covDate}>{item.publishedOn}</div>
            </>
          );
          return item.url ? (
            <a
              className={styles.covRow}
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {body}
            </a>
          ) : (
            <div className={styles.covRow} key={item.id}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DownloadsSection() {
  const { t } = useTranslation();
  const downloads = useMemo(() => buildDownloads(t), [t]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openDownload = openIndex !== null ? downloads[openIndex] : null;
  const isCompleteKit = openDownload?.asset === PRESS_ASSETS.completeKit;
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>
          <Translation
            i18nKey="marketing:pressKit.downloads.section.title"
            components={{ em: <em /> }}
          />
        </h2>
        <span className={styles.secNum}>§07</span>
      </div>
      <p>{t("marketing:pressKit.downloads.section.lead")}</p>
      <div className={styles.downloadRow}>
        {downloads.map((download, index) => (
          <button
            type="button"
            className={styles.dlCard}
            key={download.asset.filename}
            onClick={() => setOpenIndex(index)}
          >
            <div
              className={[styles.dlIc, download.icCls && styles[download.icCls]]
                .filter(Boolean)
                .join(" ")}
            >
              {download.asset.format}
            </div>
            <div className={styles.dlInfo}>
              <b>{download.title}</b>
              <span>{download.description}</span>
            </div>
            <div className={styles.dlArrow}>
              <FiArrowDown aria-hidden />
            </div>
          </button>
        ))}
      </div>
      {openDownload && (
        <PressKitDownloadModal
          eyebrow={t("marketing:pressKit.downloads.modal.eyebrow", {
            format: openDownload.asset.format,
          })}
          title={<>{openDownload.title}.</>}
          lead={
            <Translation
              i18nKey="marketing:pressKit.downloads.modal.lead"
              components={{ b: <b /> }}
              values={{
                desc: openDownload.description,
                filename: openDownload.asset.filename,
              }}
            />
          }
          rows={
            isCompleteKit
              ? buildKitPreview(t)
              : [
                  {
                    format: openDownload.asset.format,
                    title: openDownload.asset.filename,
                    description: openDownload.description,
                  },
                ]
          }
          asset={openDownload.asset}
          buttonLabel={t("marketing:pressKit.downloads.modal.buttonLabel", {
            format: openDownload.asset.format,
          })}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
