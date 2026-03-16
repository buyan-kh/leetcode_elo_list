import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeetCode Rating Tracker',
  description: 'Track your LeetCode progress and improve your rating',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
