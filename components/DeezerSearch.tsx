"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, LoaderIcon } from "lucide-react"

type Track = {
  id: string
  title: string
  artist: string
  album: string
  image: string
  preview: string
}

type SearchResultsProps = {
  query: string
  onAddTrack: (track: Track) => void
}

export function DeezerSearch({ query, onAddTrack }: SearchResultsProps) {
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [addedTracks, setAddedTracks] = useState<string[]>([])

  useEffect(() => {
    const searchDeezer = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // Utilisation de notre route API
        const response = await fetch(`/api/deezer?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        // Transformation des données Deezer dans notre format
        const formattedResults = data.data.map((track: any) => ({
          id: track.id.toString(),
          title: track.title,
          artist: track.artist.name,
          album: track.album.title,
          image: track.album.cover_medium,
          preview: track.preview
        }))

        setResults(formattedResults)
      } catch (error) {
        console.error("Erreur lors de la recherche Deezer:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    // Délai de 500ms pour éviter trop de requêtes
    const timeoutId = setTimeout(searchDeezer, 500)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleAddTrack = (track: Track) => {
    onAddTrack(track)
    setAddedTracks([...addedTracks, track.id])
  }

  if (loading) {
    return (
      <div className="mt-4 flex justify-center py-8">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Résultats de recherche</h3>

      {results.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {query.trim()
            ? "Aucun résultat. Essayez une autre recherche."
            : "Commencez à taper pour rechercher des chansons."}
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((track) => (
            <div key={track.id} className="flex items-center justify-between p-3 rounded-md bg-card border">
              <div className="flex items-center gap-3">
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {track.artist} • {track.album}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {track.preview && (
                  <audio controls className="h-8">
                    <source src={track.preview} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
                <Button
                  size="sm"
                  variant={addedTracks.includes(track.id) ? "outline" : "default"}
                  onClick={() => handleAddTrack(track)}
                  disabled={addedTracks.includes(track.id)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {addedTracks.includes(track.id) ? "Ajouté" : "Ajouter"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
