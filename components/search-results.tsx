"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, LoaderIcon } from "lucide-react"
import { useMusic } from "@/components/spotify-provider"

type SearchResultsProps = {
  query: string
  onAddTrack: (track: any) => void
}

export function SearchResults({ query, onAddTrack }: SearchResultsProps) {
  const { searchMusic } = useMusic()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [addedTracks, setAddedTracks] = useState<string[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const data = await searchMusic(query)
        setResults(data)
      } catch (error) {
        console.error("Erreur lors de la recherche:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, searchMusic])

  const handleAddTrack = (track: any) => {
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
                  src={track.image || "/placeholder.svg?height=40&width=40"}
                  alt={track.name}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {track.artist} • {track.album}
                  </p>
                </div>
              </div>
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
          ))}
        </div>
      )}
    </div>
  )
}
