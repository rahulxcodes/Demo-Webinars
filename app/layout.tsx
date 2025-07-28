import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Layout/Header'

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
        <Header />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}