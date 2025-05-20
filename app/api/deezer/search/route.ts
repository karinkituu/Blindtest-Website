import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`
    )

    if (!response.ok) {
      throw new Error("Deezer API error")
    }

    const data = await response.json()

    // Formater les résultats
    const tracks = data.data.map((track: any) => ({
      id: track.id.toString(),
      name: track.title,
      artist: track.artist.name,
      image: track.album.cover_medium,
      preview: track.preview,
    }))

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Error searching Deezer:", error)
    return NextResponse.json(
      { error: "Failed to search Deezer" },
      { status: 500 }
    )
  }
} 