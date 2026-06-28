import { useMemo, useState, type ReactNode } from 'react'
import { AdminRoleContext, type AdminRole } from '../../features/admin/adminRole'

/** Holds the simulated team role for the session (defaults to 'staff' so the
 *  admin panel is immediately demoable). Prototype-only. */
export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>('staff')
  const value = useMemo(() => ({ role, setRole }), [role])
  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>
}
