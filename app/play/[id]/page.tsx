"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MusicIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon, AlertTriangleIcon, PlayIcon, PauseIcon, RefreshCwIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Track {
  id: string
  title: string
  artist: string
  album: string
  image: string
  preview: string
  deezerId?: string  // Ajout de l'identifiant Deezer (optionnel pour la rétrocompatibilité)
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
  const [trackLoadError, setTrackLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Utiliser useRef au lieu de useState pour l'élément audio
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fonction pour contrôler la lecture audio
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
  }
  
  // Fonction pour rejouer l'audio depuis le début
  const replayAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(err => {
      console.error("Error replaying audio:", err);
    });
  }
  
  // Effet pour suivre les événements de l'audio de manière plus fiable
  useEffect(() => {
    const audio = audioRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    if (audio) {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentPreviewUrl]);

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

  // Récupérer les informations à jour d'une piste Deezer
  const fetchTrackInfo = async (track: Track): Promise<Track> => {
    try {
      console.log("Fetching updated track info for:", track.title, track.artist)
      
      // Utiliser d'abord l'ID Deezer si disponible
      if (track.deezerId) {
        try {
          console.log("Using Deezer ID:", track.deezerId)
          const response = await fetch(`/api/deezer/track?id=${track.deezerId}`)
          
          if (response.ok) {
            const updatedTrack = await response.json()
            console.log("Updated track info via ID:", updatedTrack)
            
            if (updatedTrack.preview) {
              return {
                ...track,
                preview: updatedTrack.preview,
                image: updatedTrack.image || track.image
              }
            }
          }
        } catch (error) {
          console.error("Error fetching track via ID, falling back to search:", error)
        }
      }
      
      // Essayer de rechercher par métadonnées si l'ID ne fonctionne pas ou n'est pas disponible
      console.log("Searching track by metadata")
      const searchParams = new URLSearchParams({
        title: track.title,
        artist: track.artist
      })
      
      if (track.album) {
        searchParams.append('album', track.album)
      }
      
      const response = await fetch(`/api/deezer/search-track?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error("Impossible de récupérer les informations de la piste")
      }
      
      const updatedTrack = await response.json()
      console.log("Found track via search:", updatedTrack)
      
      // Retourner une piste avec les informations mises à jour
      return {
        ...track,
        preview: updatedTrack.preview,
        image: updatedTrack.image || track.image,
        // Mettre à jour l'ID Deezer pour les futures recherches
        deezerId: updatedTrack.id
      }
    } catch (error) {
      console.error("Error fetching track info:", error)
      // En cas d'erreur, on conserve la piste originale
      return track
    }
  }

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
      
      // Récupérer les informations à jour de la piste
      setTrackLoadError(false)
      fetchTrackInfo(correctTrack)
        .then(updatedTrack => {
          // Créer un tableau de toutes les pistes sauf la correcte
          const otherTracks = [...quiz.tracks].filter((track) => track.id !== correctTrack.id)
          
          // Mélanger et prendre 3 pistes aléatoires
          const shuffledTracks = otherTracks.sort(() => 0.5 - Math.random()).slice(0, 3)
          
          // Créer les options
          const allOptions = [
            { id: "correct", text: updatedTrack.title, isCorrect: true },
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
          console.log("Setting preview URL:", updatedTrack.preview || "No preview available")
          setCurrentPreviewUrl(updatedTrack.preview || null)
          
          if (!updatedTrack.preview) {
            setTrackLoadError(true)
            toast({
              title: "Problème de lecture",
              description: "L'audio de cette piste n'est pas disponible.",
              variant: "destructive",
            })
          }
          
          setDataInitialized(true)
        })
        .catch(error => {
          console.error("Error initializing track data:", error)
          setTrackLoadError(true)
          toast({
            title: "Erreur",
            description: "Impossible de charger l'audio du quiz",
            variant: "destructive",
          })
          setDataInitialized(true)
        })
    }
  }, [quiz, dataInitialized, toast])

  // Gérer le changement de question
  useEffect(() => {
    // Ne pas exécuter à l'initialisation, cela est géré par l'effet ci-dessus
    if (quiz && quiz.tracks.length > 0 && dataInitialized && currentQuestion > 0) {
      console.log("Changing to question", currentQuestion)
      
      // Arrêter l'audio précédent si existant
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      // Obtenir la piste correcte
      const correctTrack = quiz.tracks[currentQuestion]
      setTrackLoadError(false)
      
      // Récupérer les informations à jour de la piste
      fetchTrackInfo(correctTrack)
        .then(updatedTrack => {
          // Générer les options
          generateOptions(updatedTrack)
          
          // Mettre à jour l'URL du preview
          setCurrentPreviewUrl(updatedTrack.preview || null)
          
          if (!updatedTrack.preview) {
            setTrackLoadError(true)
            toast({
              title: "Problème de lecture",
              description: "L'audio de cette piste n'est pas disponible.",
              variant: "destructive",
            })
          }
        })
        .catch(error => {
          console.error("Error updating track data:", error)
          setTrackLoadError(true)
          generateOptions(correctTrack)
          setCurrentPreviewUrl(null)
          toast({
            title: "Erreur",
            description: "Impossible de charger l'audio de cette question",
            variant: "destructive",
          })
        })
    }
  }, [quiz, currentQuestion, dataInitialized, toast])

  const generateOptions = (correctTrack: Track) => {
    if (!quiz) return

    console.log("Generating options for question", currentQuestion)
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
    
    // Si l'utilisateur a passé la question
    if (selectedAnswer === "skip") {
      setShowResult(true)
      setIsCorrect(false)
      return;
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
    setRetryCount(0)

    if (quiz && currentQuestion < quiz.tracks.length - 1) {
      // Passer à la question suivante
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setGameOver(true)
    }
  }

  // Fonction pour réessayer de charger l'audio
  const retryLoadTrack = () => {
    if (quiz && currentQuestion < quiz.tracks.length) {
      setRetryCount(retryCount + 1)
      setTrackLoadError(false)
      
      const currentTrack = quiz.tracks[currentQuestion]
      toast({
        title: "Nouvelle tentative",
        description: "Tentative de récupération de l'audio...",
      })
      
      fetchTrackInfo(currentTrack)
        .then(updatedTrack => {
          console.log("Retrying track load:", updatedTrack)
          setCurrentPreviewUrl(updatedTrack.preview || null)
          
          if (!updatedTrack.preview) {
            setTrackLoadError(true)
            
            // Après 2 tentatives, suggérer de passer à la question suivante
            if (retryCount >= 1) {
              toast({
                title: "Audio non disponible",
                description: "Cette piste n'est pas disponible actuellement. Vous pouvez passer à la question suivante.",
                variant: "destructive",
                duration: 5000,
              })
            } else {
              toast({
                title: "Problème de lecture",
                description: "L'audio de cette piste n'est pas disponible, même après nouvelle tentative.",
                variant: "destructive",
              })
            }
          }
        })
        .catch(error => {
          console.error("Error retrying track load:", error)
          setTrackLoadError(true)
          toast({
            title: "Erreur",
            description: "Impossible de charger l'audio de cette question",
            variant: "destructive",
          })
        })
    }
  }

  // Effet pour lancer automatiquement la lecture audio quand l'URL change
  useEffect(() => {
    if (currentPreviewUrl && audioRef.current && !showResult) {
      // Un petit délai pour laisser le temps à l'élément audio de se charger
      const playPromise = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Autoplay prevented:", err);
          });
        }
      }, 300);
      
      return () => clearTimeout(playPromise);
    }
  }, [currentPreviewUrl, showResult]);

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
            <div className="max-w-[70%]">
              <CardTitle className="truncate" title={quiz.title}>{quiz.title}</CardTitle>
              <CardDescription className="truncate" title={quiz.description || ""}>
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
              
              {trackLoadError ? (
                <div className="flex flex-col items-center gap-3 text-amber-500">
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5" />
                    <span>L'audio n'est pas disponible pour cette piste</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={retryLoadTrack}>
                      Réessayer
                    </Button>
                    {retryCount >= 1 && !showResult && (
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedAnswer("skip")
                        handleAnswer()
                      }}>
                        Passer cette question
                      </Button>
                    )}
                  </div>
                </div>
              ) : currentPreviewUrl ? (
                <div className="w-full">
                  <audio 
                    ref={audioRef}
                    src={currentPreviewUrl}
                    controls={false} 
                    className="w-full" 
                    controlsList="nodownload"
                    preload="auto"
                  />
                  <div className="flex items-center justify-between w-full bg-secondary/20 px-3 py-2 rounded-md mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="relative flex h-3 w-3">
                        <span className={`${isPlaying ? 'animate-ping' : 'hidden'} absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      </span>
                      <span className={`text-sm ${isPlaying ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isPlaying ? 'Lecture en cours' : 'En pause'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        type="button" 
                        onClick={togglePlayPause}
                        className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        aria-label={isPlaying ? "Mettre en pause" : "Lire"}
                      >
                        {isPlaying ? 
                          <PauseIcon className="h-5 w-5 text-primary" /> : 
                          <PlayIcon className="h-5 w-5 text-primary" />
                        }
                      </button>
                      <button 
                        type="button" 
                        onClick={replayAudio}
                        className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                        aria-label="Rejouer"
                      >
                        <RefreshCwIcon className="h-5 w-5 text-primary" />
                      </button>
                      <div className="flex items-center ml-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          defaultValue="1"
                          className="w-24 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer dark:bg-gray-700" 
                          onChange={(e) => {
                            if (audioRef.current) {
                              audioRef.current.volume = parseFloat(e.target.value);
                            }
                          }}
                          title="Volume"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangleIcon className="h-5 w-5" />
                  <span>L'audio n'est pas disponible pour cette piste</span>
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
                  <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/20">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={showResult}
                    />
                    <Label
                      htmlFor={option.id}
                      className={`flex-1 cursor-pointer break-words ${
                        showResult
                          ? option.isCorrect
                            ? "text-green-500"
                            : option.id === selectedAnswer
                              ? "text-red-500"
                              : ""
                          : ""
                      }`}
                      title={option.text}
                    >
                      {option.text}
                    </Label>
                    {showResult && option.isCorrect && (
                      <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    {showResult && !option.isCorrect && option.id === selectedAnswer && (
                      <XIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
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
