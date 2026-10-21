import type { UploadStepId } from "./studioUploadDraft.data";

export const UPLOAD_STEPS: {
  id: UploadStepId;
  num: number;
  nmKey: string;
  subKey: string;
}[] = [
  {
    id: "release",
    num: 1,
    nmKey: "studio:uploadFlow.steps.release.nm",
    subKey: "studio:uploadFlow.steps.release.sub",
  },
  {
    id: "tracks",
    num: 2,
    nmKey: "studio:uploadFlow.steps.tracks.nm",
    subKey: "studio:uploadFlow.steps.tracks.sub",
  },
  {
    id: "publish",
    num: 3,
    nmKey: "studio:uploadFlow.steps.publish.nm",
    subKey: "studio:uploadFlow.steps.publish.sub",
  },
];

/** Fixed ids for the release step's fields (one form per page), so the
 *  error summary and the publish checklist can link straight to them. */
export const RELEASE_FIELD_IDS = {
  title: "studio-release-title",
  description: "studio-release-description",
  buyUrl: "studio-release-buy-url",
  cover: "studio-release-cover",
  rights: "studio-release-rights",
  tracks: "studio-release-tracks",
} as const;

/** The order the error summary lists the release fields in, top to bottom. */
export const RELEASE_ERROR_FIELDS = ["title", "description", "buyUrl"] as const;

export const UPLOAD_FILES = [
  {
    name: "01_abertura.wav",
    meta: "24 bit / 48 kHz · 2:14 · −14.2 LUFS · 18.4 MB",
    ok: true,
  },
  {
    name: "02_o_regresso.wav",
    meta: "24 bit / 48 kHz · 3:42 · −14.0 LUFS · 30.4 MB",
    ok: true,
  },
  {
    name: "03_mae_tres_vezes.wav",
    meta: "24 bit / 48 kHz · 4:08 · −14.1 LUFS · 33.8 MB",
    ok: true,
  },
  {
    name: "04_a_vizinha.wav",
    meta: "24 bit / 48 kHz · 5:31 · −7.8 LUFS · 45.2 MB",
    ok: false,
  },
  {
    name: "05_intervalo.wav",
    meta: "24 bit / 48 kHz · 1:48 · −14.3 LUFS · 14.7 MB",
    ok: true,
  },
];

/** The showcase splits: shares add up to the 100% the footer states, and
 *  each line's role and note are catalog keys, so they read in PT too. */
export const UPLOAD_SPLITS = [
  {
    avatar: "MS",
    tone: "coral",
    name: "Mariana Sol",
    subtitleKey: "studio:upload.splits.demo.mariana.subtitle",
    roleKey: "studio:upload.splits.demo.mariana.role",
    percent: "70",
  },
  {
    avatar: "JA",
    tone: "jade",
    name: "João Anjos",
    subtitleKey: "studio:upload.splits.demo.joao.subtitle",
    roleKey: "studio:upload.splits.demo.joao.role",
    percent: "10",
  },
  {
    avatar: "IT",
    tone: "coral",
    name: "Inês T.",
    subtitleKey: "studio:upload.splits.demo.ines.subtitle",
    roleKey: "studio:upload.splits.demo.ines.role",
    percent: "5",
  },
  {
    avatar: "CO",
    tone: "jade",
    name: "Coro de Outubro",
    subtitleKey: "studio:upload.splits.demo.coro.subtitle",
    roleKey: "studio:upload.splits.demo.coro.role",
    percent: "15",
  },
];

import type { TFunction } from "../../shared/i18n/types";
import { Translation } from "../../shared/i18n/Translation";

/** Pattern B: side-info cards carry a coral <em> emphasis, so they're built
 * from `t` rather than exported as plain-string data (§ extraction-brief 2). */
export function buildUploadSideInfo(t: TFunction) {
  return [
    {
      eyebrow: t("studio:upload.side.files.eyebrow"),
      title: (
        <Translation
          i18nKey="studio:upload.side.files.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:upload.side.files.body"
          components={{ em: <em /> }}
        />
      ),
      list: [
        {
          label: t("studio:upload.side.files.list.sourceKept.label"),
          value: t("studio:upload.side.files.list.sourceKept.value"),
          em: true,
        },
        {
          label: t("studio:upload.side.files.list.listenerDelivery.label"),
          value: t("studio:upload.side.files.list.listenerDelivery.value"),
          em: false,
        },
        {
          label: t("studio:upload.side.files.list.loudnessTarget.label"),
          value: t("studio:upload.side.files.list.loudnessTarget.value"),
          em: false,
        },
        {
          label: t("studio:upload.side.files.list.isrc.label"),
          value: t("studio:upload.side.files.list.isrc.value"),
          em: true,
        },
      ],
    },
    {
      eyebrow: t("studio:upload.side.lyrics.eyebrow"),
      title: (
        <Translation
          i18nKey="studio:upload.side.lyrics.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="studio:upload.side.lyrics.body"
          components={{ em: <em /> }}
        />
      ),
      list: [
        {
          label: t("studio:upload.side.lyrics.list.autoTranscribe.label"),
          value: t("studio:upload.side.lyrics.list.autoTranscribe.value"),
          em: true,
        },
        {
          label: t("studio:upload.side.lyrics.list.communityTranslation.label"),
          value: t("studio:upload.side.lyrics.list.communityTranslation.value"),
          em: false,
        },
        {
          label: t("studio:upload.side.lyrics.list.approval.label"),
          value: t("studio:upload.side.lyrics.list.approval.value"),
          em: false,
        },
      ],
    },
  ];
}

/** The live sidebar: what Studio really does with a file (kept as uploaded,
 *  loudness measured as it uploads, no ISRC). */
export function buildUploadSideInfoLive(t: TFunction, isShow = false) {
  return [
    {
      eyebrow: t("studio:uploadFlow.side.eyebrow"),
      title: (
        <Translation
          i18nKey="studio:uploadFlow.side.title"
          components={{ em: <em /> }}
        />
      ),
      body: t("studio:uploadFlow.side.body"),
      list: [
        {
          label: t("studio:uploadFlow.side.formats.label"),
          value: t("studio:uploadFlow.side.formats.value"),
          em: true,
        },
        {
          label: t("studio:uploadFlow.side.size.label"),
          value: t(
            isShow
              ? "studio:uploadFlow.side.size.valueShow"
              : "studio:uploadFlow.side.size.value",
          ),
          em: false,
        },
        {
          label: t("studio:uploadFlow.side.listeners.label"),
          value: t("studio:uploadFlow.side.listeners.value"),
          em: false,
        },
        {
          label: t("studio:uploadFlow.side.loudness.label"),
          value: t("studio:uploadFlow.side.loudness.value"),
          em: false,
        },
      ],
    },
  ];
}
