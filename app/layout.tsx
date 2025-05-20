import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { SpotifyProvider } from "@/components/spotify-provider"
import { Toaster } from "@/components/toaster"
import type { Metadata } from "next"
// Nous gardons le même nom de composant pour éviter de changer toutes les références

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quizspot",
  description: "Créez et jouez à des quiz musicaux",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quizspot",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SpotifyProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main>{children}</main>
            </div>
            <Toaster />
          </SpotifyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
