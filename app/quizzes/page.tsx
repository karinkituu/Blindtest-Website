"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MusicIcon, PlayIcon, PlusCircleIcon, SearchIcon, MoreHorizontalIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Quiz = {
  id: string
  title: string
  description: string
  tracks: any[]
  createdAt: string
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)

  useEffect(() => {
    // Charger les quiz depuis le localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
    setQuizzes(savedQuizzes)
  }, [])

  const filteredQuizzes = quizzes.filter((quiz) => quiz.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz)
  }

  const confirmDelete = () => {
    if (quizToDelete) {
      const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizToDelete.id)
      setQuizzes(updatedQuizzes)
      localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes))
      setQuizToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Quiz</h1>
          <p className="text-muted-foreground">Jouez à vos quiz ou créez-en de nouveaux</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un quiz..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/create">
            <Button>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Nouveau Quiz
            </Button>
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-8 pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MusicIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun quiz créé</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore créé de quiz. Commencez dès maintenant !
            </p>
            <Link href="/create">
              <Button>
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Créer mon premier Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun quiz ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteQuiz(quiz)}
                    >
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader className="pr-12">
                <div className="min-w-0">
                  <CardTitle className="truncate" title={quiz.title}>
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="truncate" title={quiz.description || "Pas de description"}>
                    {quiz.description || "Pas de description"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <MusicIcon className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {quiz.tracks.length} chanson{quiz.tracks.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Créé le {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/play/${quiz.id}`} className="w-full">
                  <Button className="w-full">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Jouer
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!quizToDelete} onOpenChange={() => setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce quiz ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le quiz "<span className="truncate inline-block max-w-[200px] align-bottom" title={quizToDelete?.title}>{quizToDelete?.title}</span>" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
