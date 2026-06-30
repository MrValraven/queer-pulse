import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../shared/api/queryClient'
import { ThemeProvider } from './providers/ThemeProvider'
import { DemoModeProvider } from './providers/DemoModeProvider'
import { AuthProvider } from './providers/AuthProvider'
import { I18nProvider } from './providers/I18nProvider'
import { ToastProvider } from '../shared/components/feedback/ToastProvider'
import { AdminRoleProvider } from './providers/AdminRoleProvider'
import { ConnectProvider } from './providers/ConnectProvider'
import { ConnectionsProvider } from './providers/ConnectionsProvider'
import { ProfileProvider } from './providers/ProfileProvider'
import { ProfileThemeProvider } from './providers/ProfileThemeProvider'
import { VouchProvider } from './providers/VouchProvider'
import { WorkProfileProvider } from './providers/WorkProfileProvider'
import { SavedProvider } from './providers/SavedProvider'
import { DraftsProvider } from './providers/DraftsProvider'
import { SocialProvider } from './providers/SocialProvider'
import { CommunityMembershipProvider } from './providers/CommunityMembershipProvider'
import { CommandPalette } from '../features/members/CommandPalette'
import { RoomLoader } from '../shared/components/feedback/RoomLoader'
import { ScrollManager } from './ScrollManager'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <DemoModeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <I18nProvider>
              <ToastProvider>
                <AdminRoleProvider>
                <BrowserRouter>
                  <ScrollManager />
                  <WorkProfileProvider>
                    <ProfileProvider>
                      <ProfileThemeProvider>
                        <ConnectionsProvider>
                        <ConnectProvider>
                          <VouchProvider>
                            <SavedProvider>
                              <DraftsProvider>
                                <SocialProvider>
                                  <CommunityMembershipProvider>
                                    <AppRoutes />
                                    <CommandPalette />
                                  </CommunityMembershipProvider>
                                </SocialProvider>
                              </DraftsProvider>
                            </SavedProvider>
                          </VouchProvider>
                        </ConnectProvider>
                        </ConnectionsProvider>
                      </ProfileThemeProvider>
                    </ProfileProvider>
                  </WorkProfileProvider>
                  <RoomLoader />
                </BrowserRouter>
                </AdminRoleProvider>
              </ToastProvider>
            </I18nProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DemoModeProvider>
    </ThemeProvider>
  )
}
