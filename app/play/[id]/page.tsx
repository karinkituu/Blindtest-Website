"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MusicIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Track {
  id: string
  title: string
  artist: string
  album: string
  image: string
  preview: string
}

interface Quiz {
  _id: string
  title: string
  description: string
  tracks: Track[]
  createdAt: string
}

export default function PlayQuiz({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
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
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null)
  const [dataInitialized, setDataInitialized] = useState(false)
  
  // Utiliser useRef au lieu de useState pour l'élément audio
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Chargement initial du quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log("Fetching quiz with ID:", id)
        const response = await fetch(`/api/quizzes/${id}`)
        if (!response.ok) {
          throw new Error("Quiz non trouvé")
        }
        const data = await response.json()
        console.log("Quiz data:", data)
        setQuiz(data)
        // Ne pas marquer comme initialisé ici, attendez que le reste soit fait
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger le quiz",
          variant: "destructive",
        })
        router.push("/quizzes")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
    
    // Nettoyer l'audio lors du démontage du composant
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.load()
      }
    }
  }, [id, router, toast])

  // Initialisation des données après le chargement du quiz
  useEffect(() => {
    if (quiz && quiz.tracks.length > 0 && !dataInitialized) {
      console.log("Initializing quiz data for the first time")
      
      // Arrêter l'audio précédent si existant
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      
      const correctTrack = quiz.tracks[0] // Première piste
      console.log("First track:", correctTrack)
      
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
      const randomizedOptions = allOptions.sort(() => 0.5 - Math.random())
      console.log("Initial options:", randomizedOptions)
      setOptions(randomizedOptions)
      
      // Mettre à jour l'URL du preview
      console.log("Setting preview URL:", correctTrack.preview || "No preview available")
      setCurrentPreviewUrl(correctTrack.preview || null)
      
      setDataInitialized(true)
    }
  }, [quiz, dataInitialized])

  // Gérer le changement de question
  useEffect(() => {
    // Ne pas exécuter à l'initialisation, cela est géré par l'effet ci-dessus
    if (quiz && quiz.tracks.length > 0 && dataInitialized && currentQuestion > 0) {
      console.log("Changing to question", currentQuestion)
      
      // Arrêter l'audio précédent si existant
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      
      generateOptions()
      
      // Mettre à jour l'URL du preview
      const correctTrack = quiz.tracks[currentQuestion]
      console.log("Setting preview URL for new question:", correctTrack.preview || "No preview available")
      setCurrentPreviewUrl(correctTrack.preview || null)
    }
  }, [quiz, currentQuestion, dataInitialized])

  const generateOptions = () => {
    if (!quiz) return

    console.log("Generating options for question", currentQuestion)
    // Obtenir la piste correcte
    const correctTrack = quiz.tracks[currentQuestion]
    console.log("Correct track:", correctTrack)

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

    console.log("Generated options:", allOptions)

    // Mélanger les options
    setOptions(allOptions.sort(() => 0.5 - Math.random()))
  }

  const handleAnswer = () => {
    // Arrêter l'audio quand on répond
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    // Trouver l'option sélectionnée
    const selectedOption = options.find((option) => option.id === selectedAnswer)
    const correct = selectedOption?.isCorrect || false

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
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

  if (loading || !dataInitialized) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quiz || quiz.tracks.length === 0) {
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

  // Vérifications de débogage
  const currentTrack = quiz.tracks[currentQuestion]
  console.log("Current track:", currentTrack)
  console.log("Current options:", options)
  console.log("Current preview URL:", currentPreviewUrl)

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
                setDataInitialized(false) // Réinitialiser pour recharger les données
              }}
            >
              Rejouer
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>
                Question {currentQuestion + 1} sur {quiz.tracks.length}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              {currentTrack.image ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  <Image 
                    src={currentTrack.image} 
                    alt={currentTrack.title} 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                  <MusicIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {currentPreviewUrl && (
                <div className="w-full">
                  <audio 
                    ref={audioRef}
                    src={currentPreviewUrl} 
                    controls 
                    className="w-full max-w-xs" 
                    controlsList="nodownload"
                    preload="auto"
                    key={currentPreviewUrl} // Forcer la recréation du composant audio
                  />
                </div>
              )}
            </div>

            {options.length > 0 ? (
              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="space-y-3"
              >
                {options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={showResult}
                    />
                    <Label
                      htmlFor={option.id}
                      className={`flex-1 cursor-pointer ${
                        showResult
                          ? option.isCorrect
                            ? "text-green-500"
                            : option.id === selectedAnswer
                              ? "text-red-500"
                              : ""
                          : ""
                      }`}
                    >
                      {option.text}
                    </Label>
                    {showResult && option.isCorrect && (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    )}
                    {showResult && !option.isCorrect && option.id === selectedAnswer && (
                      <XIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center text-muted-foreground">
                Aucune option disponible pour cette question
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/quizzes")}
            disabled={showResult}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quitter
          </Button>
          {!showResult ? (
            <Button
              onClick={handleAnswer}
              disabled={!selectedAnswer}
            >
              Valider
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              {currentQuestion < quiz.tracks.length - 1 ? (
                <>
                  Suivant
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Terminer"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
