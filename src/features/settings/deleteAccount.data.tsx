import type { ReactNode } from 'react'

export type DeleteOption = 'deactivate' | 'delete'

interface WhatItem {
  col: string
  text: ReactNode
}

export const DELETE_CONTENT: Record<
  DeleteOption,
  { wh: WhatItem[]; phrase: string | null; btnLabel: string; isDanger: boolean }
> = {
  deactivate: {
    wh: [
      { col: 'rgba(45,27,61,.3)', text: <>Your <strong>profile is hidden</strong> immediately — no other member can find or view it.</> },
      { col: 'var(--jade)', text: <>Your <strong>data is fully preserved</strong>: messages, posts, history remain intact.</> },
      { col: 'var(--jade)', text: <><strong>Reactivate instantly</strong> by signing back in with your email and password.</> },
      { col: 'rgba(45,27,61,.3)', text: <>Your <strong>name is removed</strong> from member lists and search results.</> },
      { col: 'rgba(45,27,61,.3)', text: <>Event RSVPs and forum contributions are <strong>attributed to [deactivated member]</strong>.</> },
    ],
    phrase: null,
    btnLabel: 'Deactivate my account',
    isDanger: false,
  },
  delete: {
    wh: [
      { col: 'var(--accent-ink)', text: <><strong>All your data is queued for deletion</strong> and permanently erased within 30 days.</> },
      { col: 'var(--accent-ink)', text: <>Messages you sent <strong>are deleted from all conversations</strong> — recipients lose them too.</> },
      { col: 'var(--accent-ink)', text: <>Your forum posts are <strong>permanently removed</strong> — not anonymised, deleted.</> },
      { col: 'rgba(45,27,61,.3)', text: <>Your email address is <strong>added to a suppression list</strong> so we don't accidentally re-create your account.</> },
      { col: 'rgba(45,27,61,.3)', text: <>You can request a <strong>data archive before deleting</strong> — do that first.</> },
    ],
    phrase: 'delete my account',
    btnLabel: 'Permanently delete my account',
    isDanger: true,
  },
}
