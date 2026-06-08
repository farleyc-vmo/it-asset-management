'use client'

import { DataProvider } from '@/lib/data-context'
import { Sidebar } from '@/components/sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 pt-16 md:pt-8">
            {children}
          </div>
        </main>
      </div>
    </DataProvider>
  )
}
