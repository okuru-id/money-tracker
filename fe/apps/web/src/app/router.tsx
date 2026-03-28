import { Navigate, createBrowserRouter } from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/login-page'
import { RegisterPage } from '../features/auth/pages/register-page'
import { FamilyManagementPage } from '../features/family/pages/family-management-page'
import { FamilySetupPage } from '../features/family/pages/family-setup-page'
import { InviteJoinPage } from '../features/family/pages/invite-join-page'
import { HomePage } from '../features/home/pages/home-page'
import { HistoryPage } from '../features/history/pages/history-page'
import { InsightsPage } from '../features/insights/pages/insights-page'
import { SettingsPage } from '../features/settings/pages/settings-page'
import { AddPage } from '../features/transactions/pages/add-page'
import { AdminPage } from '../features/admin/pages/admin-page'
import { MobileShell } from '../layouts/mobile-shell'
import { AdminGate, FamilyOptionalGate, FamilyRequiredGate, NoFamilyOnlyGate, PublicOnlyGate, SessionGate } from './router-gates'

export const appRouter = createBrowserRouter([
  {
    element: <PublicOnlyGate />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <SessionGate />,
    children: [
      {
        element: <NoFamilyOnlyGate />,
        children: [
          {
            path: '/family/setup',
            element: <FamilySetupPage />,
          },
          {
            path: '/family/join',
            element: <InviteJoinPage />,
          },
          {
            path: '/invite/:token',
            element: <InviteJoinPage />,
          },
        ],
      },
      {
        element: <FamilyOptionalGate />,
        children: [
          {
            path: '/settings',
            element: <MobileShell />,
            children: [
              {
                index: true,
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
      {
        element: <FamilyRequiredGate />,
        children: [
          {
            path: '/',
            element: <MobileShell />,
            children: [
              {
                index: true,
                element: <HomePage />,
              },
              {
                path: 'add',
                element: <AddPage />,
              },
              {
                path: 'history',
                element: <HistoryPage />,
              },
              {
                path: 'insights',
                element: <InsightsPage />,
              },
              {
                path: 'settings',
                element: <Navigate to="/settings" replace />,
              },
              {
                path: 'settings/family',
                element: <FamilyManagementPage />,
              },
              {
                path: 'family',
                element: <Navigate to="/settings/family" replace />,
              },
            ],
          },
        ],
      },
      {
        element: <AdminGate />,
        children: [
          {
            path: '/admin',
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
