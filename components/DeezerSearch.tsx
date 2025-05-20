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
        const response = await fetch(`/api/deezer?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche')
        }
        const data = await response.json()
        
        if (data.data && Array.isArray(data.data)) {
          const formattedResults = data.data.map((track: any) => ({
            id: track.id.toString(),
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            image: track.album.cover_medium,
            preview: track.preview
          }))
          setResults(formattedResults)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Erreur lors de la recherche Deezer:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

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
            <div key={track.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md bg-card border gap-3">
              <div className="flex items-center gap-3 w-full sm:w-[300px]">
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-12 h-12 rounded flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate" title={track.title}>{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate" title={`${track.artist} • ${track.album}`}>
                    {track.artist} • {track.album}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {track.preview && (
                  <div className="w-full sm:w-[300px]">
                    <audio 
                      controls 
                      className="h-8 w-full"
                      controlsList="nodownload"
                      style={{ minWidth: '300px' }}
                    >
                      <source src={track.preview} type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                  </div>
                )}
                <Button
                  size="sm"
                  variant={addedTracks.includes(track.id) ? "outline" : "default"}
                  onClick={() => handleAddTrack(track)}
                  disabled={addedTracks.includes(track.id)}
                  className="w-full sm:w-auto whitespace-nowrap"
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
