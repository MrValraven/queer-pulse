export const UPLOAD_STEPS = [
  {
    num: 1,
    nmKey: "studio:upload.steps.files.nm",
    subKey: "studio:upload.steps.files.sub",
    on: true,
  },
  {
    num: 2,
    nmKey: "studio:upload.steps.metadata.nm",
    subKey: "studio:upload.steps.metadata.sub",
  },
  {
    num: 3,
    nmKey: "studio:upload.steps.licence.nm",
    subKey: "studio:upload.steps.licence.sub",
  },
];

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

export const UPLOAD_SPLITS = [
  {
    avatar: "MS",
    tone: "coral",
    name: "Mariana Sol",
    subtitle: "you · songwriter, voice, piano · all tracks",
    role: "writer + performer · 1 – 11",
    percent: "85",
  },
  {
    avatar: "JA",
    tone: "jade",
    name: "João Anjos",
    subtitle: "cellist · IBAN pending invite",
    role: "cello · 2, 7, 11",
    percent: "10",
  },
  {
    avatar: "IT",
    tone: "coral",
    name: "Inês T.",
    subtitle: "mix & master · QP member",
    role: "production · all tracks",
    percent: "5",
  },
  {
    avatar: "CO",
    tone: "jade",
    name: "Coro de Outubro",
    subtitle: "choir · 15 voices, treated as one",
    role: "choir · 4 only",
    percent: "20",
    onTrack: "on track 4",
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
