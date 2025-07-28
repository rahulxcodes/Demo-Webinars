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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  )
}