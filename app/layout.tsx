import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { SpotifyProvider } from "@/components/spotify-provider"
import { Toaster } from "@/components/toaster"
// Nous gardons le même nom de composant pour éviter de changer toutes les références

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Quiz Musical",
  description: "Créez et partagez des quiz musicaux avec vos amis",
    generator: 'v0.dev'
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
