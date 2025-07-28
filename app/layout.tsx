import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/ui/navbar'

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
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  )
}