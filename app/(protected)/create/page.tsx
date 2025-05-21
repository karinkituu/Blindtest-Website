"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuizPreview } from "@/components/quiz-preview"
import { SearchIcon, SaveIcon, TrashIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeezerSearch } from "@/components/DeezerSearch"

export default function CreateQuiz() {
  const router = useRouter()
  const { toast } = useToast()
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTracks, setSelectedTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La recherche est gérée automatiquement par le composant SearchResults
  }

  const handleRemoveTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter((track) => track.id !== trackId))
  }

  const handleSaveQuiz = async () => {
    if (!quizTitle || selectedTracks.length === 0) {
      toast({
        title: "Impossible de sauvegarder",
        description: "Veuillez ajouter un titre et au moins une chanson à votre quiz.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDescription,
          tracks: selectedTracks,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création du quiz")
      }

      // Réinitialiser le formulaire
      setQuizTitle("")
      setQuizDescription("")
      setSelectedTracks([])
      setSearchQuery("")

      toast({
        title: "Quiz sauvegardé",
        description: "Votre quiz a été créé avec succès!",
      })

      // Rediriger vers la page des quiz
      router.push("/quizzes")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du quiz",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Créer un Quiz</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Détails du Quiz</CardTitle>
              <CardDescription>Donnez un titre à votre quiz et ajoutez une description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Titre du Quiz</Label>
                <Input
                  id="quiz-title"
                  placeholder="Ex: Hits des années 90"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-description">Description (optionnel)</Label>
                <Textarea
                  id="quiz-description"
                  placeholder="Décrivez votre quiz..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="search" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Rechercher des chansons</TabsTrigger>
              <TabsTrigger value="selected">Chansons sélectionnées ({selectedTracks.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="search" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des chansons</CardTitle>
                  <CardDescription>
                    Trouvez des chansons à ajouter à votre quiz. La recherche tolère les fautes d'orthographe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      placeholder="Rechercher un artiste, une chanson..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Rechercher
                    </Button>
                  </form>

                  <DeezerSearch
                    query={searchQuery}
                    onAddTrack={(track) => {
                      if (!selectedTracks.some((t) => t.id === track.id)) {
                        setSelectedTracks([...selectedTracks, track])
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="selected" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chansons sélectionnées</CardTitle>
                  <CardDescription>Gérez les chansons de votre quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTracks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune chanson sélectionnée. Recherchez et ajoutez des chansons à votre quiz.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedTracks.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-3 rounded-md bg-card border">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={track.image || "/placeholder.svg?height=40&width=40"}
                              alt={track.title}
                              className="w-10 h-10 rounded flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate" title={track.title}>{track.title}</p>
                              <p className="text-sm text-muted-foreground truncate" title={`${track.artist} • ${track.album}`}>
                                {track.artist} • {track.album}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveTrack(track.id)} className="flex-shrink-0">
                            <TrashIcon className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du Quiz</CardTitle>
              <CardDescription>Voici à quoi ressemblera votre quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              <QuizPreview
                title={quizTitle || "Titre du quiz"}
                description={quizDescription || "Description du quiz"}
                trackCount={selectedTracks.length}
                tracks={selectedTracks.slice(0, 3)}
              />
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSaveQuiz} 
                className="w-full" 
                disabled={!quizTitle || selectedTracks.length === 0 || loading}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {loading ? "Sauvegarde..." : "Sauvegarder le Quiz"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
