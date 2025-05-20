"use client"

import { createContext, useContext, type ReactNode } from "react"

type MusicContextType = {
  searchMusic: (query: string) => Promise<any[]>
  getPopularTracks: () => Promise<any[]>
}

// Données de démonstration
const demoTracks = [
  {
    id: "1",
    name: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    preview_url: "https://example.com/preview1.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "2",
    name: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    preview_url: "https://example.com/preview2.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "3",
    name: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    preview_url: "https://example.com/preview3.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "4",
    name: "Like a Rolling Stone",
    artist: "Bob Dylan",
    album: "Highway 61 Revisited",
    preview_url: "https://example.com/preview4.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "5",
    name: "Luther",
    artist: "Kendrick Lamar",
    album: "Mr. Morale & the Big Steppers",
    preview_url: "https://example.com/preview5.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "6",
    name: "Lose Yourself",
    artist: "Eminem",
    album: "8 Mile Soundtrack",
    preview_url: "https://example.com/preview6.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "7",
    name: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    preview_url: "https://example.com/preview7.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "8",
    name: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    preview_url: "https://example.com/preview8.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "9",
    name: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    preview_url: "https://example.com/preview9.mp3",
    image: "https://via.placeholder.com/60",
  },
  {
    id: "10",
    name: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    preview_url: "https://example.com/preview10.mp3",
    image: "https://via.placeholder.com/60",
  },
]

// Fonction pour calculer la distance de Levenshtein (distance d'édition)
function levenshteinDistance(a: string, b: string): number {
  const matrix = []

  // Initialiser la matrice
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Remplir la matrice
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // suppression
          ),
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// Fonction pour rechercher avec tolérance aux erreurs
function fuzzySearch(query: string, tracks: any[]): any[] {
  if (!query) return tracks

  const lowerQuery = query.toLowerCase()

  // Calculer un score pour chaque piste
  const scoredTracks = tracks.map((track) => {
    const nameDistance = levenshteinDistance(lowerQuery, track.name.toLowerCase())
    const artistDistance = levenshteinDistance(lowerQuery, track.artist.toLowerCase())

    // Normaliser la distance par rapport à la longueur de la chaîne
    const nameScore = 1 - nameDistance / Math.max(lowerQuery.length, track.name.length)
    const artistScore = 1 - artistDistance / Math.max(lowerQuery.length, track.artist.length)

    // Prendre le meilleur score
    const score = Math.max(nameScore, artistScore)

    return { ...track, score }
  })

  // Filtrer les résultats avec un score minimum et trier par score
  return scoredTracks
    .filter((track) => track.score > 0.5) // Seuil de similarité de 50%
    .sort((a, b) => b.score - a.score)
}

const MusicContext = createContext<MusicContextType>({
  searchMusic: async () => [],
  getPopularTracks: async () => [],
})

export const useMusic = () => useContext(MusicContext)

export function SpotifyProvider({ children }: { children: ReactNode }) {
  // Fonction de recherche avec tolérance aux erreurs
  const searchMusic = async (query: string): Promise<any[]> => {
    // Simuler un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return fuzzySearch(query, demoTracks)
  }

  // Obtenir des pistes populaires
  const getPopularTracks = async (): Promise<any[]> => {
    // Simuler un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 500))
    return demoTracks
  }

  return <MusicContext.Provider value={{ searchMusic, getPopularTracks }}>{children}</MusicContext.Provider>
}
