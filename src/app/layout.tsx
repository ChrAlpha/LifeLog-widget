import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LifeLog Widget',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-600">
          {children}
        </div>
      </body>
    </html>
  )
}
