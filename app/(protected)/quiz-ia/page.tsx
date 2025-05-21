"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MusicIcon, SparklesIcon, LoaderIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function QuizIAPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      toast({
        title: "Entrée requise",
        description: "Veuillez saisir une description pour votre quiz.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du quiz")
      }

      const data = await response.json()
      
      toast({
        title: "Quiz généré avec succès !",
        description: "Vous allez être redirigé vers votre nouveau quiz.",
      })
      
      // Redirection vers le quiz créé - correction de la route
      router.push(`/play/${data.quizId}`)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du quiz",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Générer un Quiz avec IA</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                Création par IA
              </CardTitle>
              <CardDescription>
                Décrivez le type de quiz musical que vous souhaitez et notre IA le créera pour vous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateQuiz} className="space-y-4">
                <div>
                  <Input
                    placeholder="Ex: Un quiz sur la pop des années 80, les classiques du rock, les hits de Madonna..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Soyez aussi précis que possible pour obtenir de meilleurs résultats.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Générer mon Quiz
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Suggestions d'entrées</CardTitle>
              <CardDescription>Voici quelques idées pour vous aider</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <MusicIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"Crée un quiz sur les hits rock des années 90"</span>
                </li>
                <li className="flex items-start gap-2">
                  <MusicIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"Un quiz avec les chansons de Daft Punk"</span>
                </li>
                <li className="flex items-start gap-2">
                  <MusicIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"Quiz sur la musique électronique française"</span>
                </li>
                <li className="flex items-start gap-2">
                  <MusicIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>"Les meilleures chansons pop des années 2000"</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium mb-1">1. Décrivez votre quiz</h3>
                  <p className="text-muted-foreground">
                    Saisissez une description détaillée du type de quiz musical que vous souhaitez créer.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">2. L'IA génère le contenu</h3>
                  <p className="text-muted-foreground">
                    Notre intelligence artificielle recherche et sélectionne des chansons correspondant à votre demande.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">3. Jouez à votre quiz</h3>
                  <p className="text-muted-foreground">
                    Votre quiz est automatiquement créé et prêt à être joué !
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-xs text-center text-muted-foreground">
                Propulsé par Google Gemini AI
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 