"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { MusicIcon, PlusCircleIcon, PlayCircleIcon, HomeIcon } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MusicIcon className="h-6 w-6" />
          <span className="font-bold">Quiz Musical</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            Accueil
          </Link>
          <Link
            href="/create"
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/create" ? "text-primary" : "text-muted-foreground"}`}
          >
            Créer
          </Link>
          <Link
            href="/quizzes"
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === "/quizzes" ? "text-primary" : "text-muted-foreground"}`}
          >
            Jouer
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="block md:hidden">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <HomeIcon className="h-5 w-5" />
                <span className="sr-only">Accueil</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/create">
                <PlusCircleIcon className="h-5 w-5" />
                <span className="sr-only">Créer</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/quizzes">
                <PlayCircleIcon className="h-5 w-5" />
                <span className="sr-only">Jouer</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
