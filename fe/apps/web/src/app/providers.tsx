import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useEffect, useState } from 'react'

import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { initializePwaInstallPrompt } from '../lib/pwa-install'
import { ToastViewport } from '../lib/toast-viewport'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  useEffect(() => {
    return initializePwaInstallPrompt()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <PwaInstallPrompt />
      <ToastViewport />
    </QueryClientProvider>
  )
}
