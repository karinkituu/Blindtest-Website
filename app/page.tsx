import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MusicIcon, PlusCircleIcon, PlayCircleIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="rounded-full bg-primary p-4">
          <MusicIcon className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Quiz Musical</h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Créez et partagez des quiz musicaux avec vos amis. Testez vos connaissances musicales et découvrez de nouveaux
          artistes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/create">
            <Button size="lg" className="gap-2">
              <PlusCircleIcon className="h-5 w-5" />
              Créer un Quiz
            </Button>
          </Link>
          <Link href="/quizzes">
            <Button size="lg" variant="outline" className="gap-2">
              <PlayCircleIcon className="h-5 w-5" />
              Jouer
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <PlusCircleIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Créez vos propres quiz</h2>
          <p className="text-center text-muted-foreground">
            Utilisez l'API Spotify pour créer des quiz personnalisés basés sur vos artistes et chansons préférés.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <PlayCircleIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Jouez avec vos amis</h2>
          <p className="text-center text-muted-foreground">
            Partagez vos quiz avec vos amis et défiez-les de reconnaître vos morceaux préférés.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Personnalisez l'apparence</h2>
          <p className="text-center text-muted-foreground">
            Changez le thème de l'application selon vos préférences pour une expérience personnalisée.
          </p>
        </div>
      </div>
    </div>
  )
}
