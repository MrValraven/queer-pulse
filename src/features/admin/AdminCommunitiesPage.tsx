import { useState } from 'react'
import { AdminShell } from '../../shared/components/layout/AdminShell'
import { AdminCommunityGrid } from './AdminCommunityGrid'
import { AdminCommunityDetail } from './AdminCommunityDetail'
import { TRANS_FRIENDS_DETAIL } from './adminCommunities.data'

export function AdminCommunitiesPage() {
  const [view, setView] = useState<'grid' | 'detail'>('grid')

  function openDetail() {
    setView('detail')
    window.scrollTo(0, 0)
  }

  function backToGrid() {
    setView('grid')
    window.scrollTo(0, 0)
  }

  return (
    <AdminShell title={<>Communities · <em>all spaces</em></>}>
      {view === 'grid' ? (
        <AdminCommunityGrid onOpen={openDetail} />
      ) : (
        <AdminCommunityDetail detail={TRANS_FRIENDS_DETAIL} onBack={backToGrid} />
      )}
    </AdminShell>
  )
}
