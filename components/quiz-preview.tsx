import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MusicIcon } from "lucide-react"

type QuizPreviewProps = {
  title: string
  description: string
  trackCount: number
  tracks?: any[]
}

export function QuizPreview({ title, description, trackCount, tracks = [] }: QuizPreviewProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
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
            tracks.length > 0 ? (
              tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <img
                    src={track.image || "/placeholder.svg?height=30&width=30"}
                    alt={track.name}
                    className="w-8 h-8 rounded"
                  />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: Math.min(trackCount, 3) }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
              ))
            )
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Ajoutez des chansons pour voir l'aperçu
            </div>
          )}

          {trackCount > 3 && (
            <div className="text-center text-sm text-muted-foreground">+{trackCount - 3} autres chansons</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
