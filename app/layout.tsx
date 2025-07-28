import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import '../styles/webinar-live-class.css'
import { Header } from '@/components/ui/Header'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Webinar Platform',
  description: 'Professional webinar platform with Stream.io',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        <Providers>
          <Header />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}