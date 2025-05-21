import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MusicIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { useState } from "react"

type QuizPreviewProps = {
  title: string
  description: string
  trackCount: number
  tracks?: any[]
  onRemoveTrack?: (trackId: string) => void
}

export function QuizPreview({ 
  title, 
  description, 
  trackCount, 
  tracks = [], 
  onRemoveTrack 
}: QuizPreviewProps) {
  const [showAllTracks, setShowAllTracks] = useState(false);
  
  // Nombre de pistes à afficher par défaut
  const defaultTrackCount = 3;
  
  // Déterminer les pistes à afficher
  const displayedTracks = showAllTracks ? tracks : tracks.slice(0, defaultTrackCount);
  
  // Calculer le nombre de pistes restantes
  const remainingTracks = trackCount - defaultTrackCount;
  
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl truncate" title={title}>{title}</CardTitle>
        {description && (
          <CardDescription className="truncate" title={description}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <MusicIcon className="h-4 w-4" />
          <span>
            {trackCount} chanson{trackCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {trackCount > 0 ? (
            displayedTracks.length > 0 ? (
              displayedTracks.map((track) => (
                <div key={track.id} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <img
                    src={track.image || "/placeholder.svg?height=30&width=30"}
                    alt={track.title || track.name}
                    className="w-8 h-8 rounded flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={track.title || track.name}>
                      {track.title || track.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={track.artist}>
                      {track.artist}
                    </p>
                  </div>
                  {onRemoveTrack && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onRemoveTrack(track.id)}
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              Array.from({ length: Math.min(trackCount, defaultTrackCount) }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
              ))
            )
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Ajoutez des chansons pour voir l'aperçu
            </div>
          )}

          {!showAllTracks && trackCount > defaultTrackCount && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAllTracks(true)}
            >
              <ChevronDownIcon className="h-4 w-4 mr-1" />
              Afficher les {remainingTracks} autres chansons
            </Button>
          )}

          {showAllTracks && trackCount > defaultTrackCount && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAllTracks(false)}
            >
              <ChevronUpIcon className="h-4 w-4 mr-1" />
              Réduire l'affichage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
