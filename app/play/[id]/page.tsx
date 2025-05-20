"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MusicIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import { use } from "react"

type Quiz = {
  id: string
  title: string
  description: string
  tracks: any[]
  createdAt: string
}

export default function PlayQuiz({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([])
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Charger le quiz depuis le localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
    const foundQuiz = savedQuizzes.find((q: Quiz) => q.id === id)

    if (foundQuiz) {
      setQuiz(foundQuiz)
    } else {
      router.push("/quizzes")
    }

    setLoading(false)
  }, [id, router])

  useEffect(() => {
    // Générer les options pour la question actuelle
    if (quiz && quiz.tracks.length > 0) {
      generateOptions()
    }

    // Nettoyer l'audio précédent
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [quiz, currentQuestion])

  // Nettoyer l'audio quand on quitte le quiz
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
        audio.load()
      }
    }
  }, [audio])

  const generateOptions = () => {
    if (!quiz) return

    // Obtenir la piste correcte
    const correctTrack = quiz.tracks[currentQuestion]

    // Créer un tableau de toutes les pistes sauf la correcte
    const otherTracks = [...quiz.tracks].filter((track) => track.id !== correctTrack.id)

    // Mélanger et prendre 3 pistes aléatoires
    const shuffledTracks = otherTracks.sort(() => 0.5 - Math.random()).slice(0, 3)

    // Créer les options
    const allOptions = [
      { id: "correct", text: correctTrack.title, isCorrect: true },
      ...shuffledTracks.map((track, index) => ({
        id: `wrong-${index}`,
        text: track.title,
        isCorrect: false,
      })),
    ]

    // Mélanger les options
    setOptions(allOptions.sort(() => 0.5 - Math.random()))

    // Charger l'audio si disponible
    if (correctTrack.preview) {
      const newAudio = new Audio(correctTrack.preview)
      setAudio(newAudio)
      newAudio.volume = 0.5
      newAudio.play().catch((e) => console.error("Erreur de lecture audio:", e))
    }
  }

  const handleAnswer = () => {
    // Trouver l'option sélectionnée
    const selectedOption = options.find((option) => option.id === selectedAnswer)
    const correct = selectedOption?.isCorrect || false

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
    }

    // Arrêter l'audio
    if (audio) {
      audio.pause()
    }
  }

  const nextQuestion = () => {
    setSelectedAnswer("")
    setShowResult(false)

    if (quiz && currentQuestion < quiz.tracks.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setGameOver(true)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Quiz introuvable</CardTitle>
            <CardDescription>Ce quiz n'existe pas ou a été supprimé.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/quizzes")}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour aux quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Quiz terminé !</CardTitle>
            <CardDescription>Voici votre score final</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold mb-4">
              {score} / {quiz.tracks.length}
            </div>
            <Progress value={(score / quiz.tracks.length) * 100} className="h-4" />
            <p className="mt-4 text-muted-foreground">
              {score === quiz.tracks.length
                ? "Parfait ! Vous avez tout bon !"
                : score > quiz.tracks.length / 2
                  ? "Bien joué !"
                  : "Vous pouvez faire mieux !"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/quizzes")}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour aux quiz
            </Button>
            <Button
              onClick={() => {
                setCurrentQuestion(0)
                setScore(0)
                setGameOver(false)
                setSelectedAnswer("")
                setShowResult(false)
              }}
            >
              Rejouer
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentTrack = quiz.tracks[currentQuestion]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold truncate" title={quiz.title}>{quiz.title}</h1>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} sur {quiz.tracks.length}
            </div>
            <div className="text-sm font-medium">
              Score: {score} / {currentQuestion}
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / quiz.tracks.length) * 100} className="mt-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MusicIcon className="h-5 w-5 flex-shrink-0" />
              <span>Quelle est cette chanson ?</span>
            </CardTitle>
            <CardDescription>Écoutez l'extrait et choisissez la bonne réponse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <img
                    src={currentTrack.image || "/placeholder.svg?height=64&width=64"}
                    alt="Pochette d'album"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentTrack.preview
                    ? "Écoutez l'extrait et devinez la chanson"
                    : "Aucun extrait disponible pour cette chanson"}
                </p>
                {currentTrack.preview && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      if (audio) {
                        if (audio.paused) {
                          audio.play().catch((e) => console.error("Erreur de lecture audio:", e))
                        } else {
                          audio.pause()
                        }
                      }
                    }}
                  >
                    {audio?.paused ? "Écouter" : "Pause"}
                  </Button>
                )}
              </div>
            </div>

            <RadioGroup
              value={selectedAnswer}
              onValueChange={setSelectedAnswer}
              className="space-y-3"
              disabled={showResult}
            >
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-2 rounded-md border p-3 ${
                    showResult && option.id === selectedAnswer
                      ? isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                  } ${showResult && option.isCorrect ? "border-green-500 bg-green-50/50 dark:bg-green-950/10" : ""}`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer truncate" title={option.text}>
                    {option.text}
                  </Label>
                  {showResult && option.isCorrect && <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />}
                  {showResult && option.id === selectedAnswer && !option.isCorrect && (
                    <XIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            {!showResult ? (
              <Button onClick={handleAnswer} disabled={!selectedAnswer} className="w-full">
                Valider
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="w-full">
                {currentQuestion < quiz.tracks.length - 1 ? (
                  <>
                    <span>Question suivante</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  "Voir les résultats"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
