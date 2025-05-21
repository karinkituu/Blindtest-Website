import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const artist = searchParams.get('artist')
  const album = searchParams.get('album')

  if (!title || !artist) {
    return NextResponse.json({ error: 'Title and artist parameters are required' }, { status: 400 })
  }

  try {
    // Construire une requête précise pour trouver la bonne piste
    let query = `${title} ${artist}`
    if (album) query += ` ${album}`
    
    // Rechercher la piste
    const response = await fetch(`https://api.deezer.com/search/track?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ error: 'No track found matching the query' }, { status: 404 })
    }
    
    // Essayer de trouver la correspondance exacte
    let matchedTrack = data.data.find((track: any) => 
      track.title.toLowerCase() === title.toLowerCase() && 
      track.artist.name.toLowerCase() === artist.toLowerCase()
    )
    
    // Si pas de correspondance exacte, prendre le premier résultat
    if (!matchedTrack) {
      matchedTrack = data.data[0]
    }
    
    return NextResponse.json({
      id: matchedTrack.id.toString(),
      title: matchedTrack.title,
      artist: matchedTrack.artist.name,
      album: matchedTrack.album.title,
      image: matchedTrack.album.cover_medium,
      preview: matchedTrack.preview
    })
  } catch (error) {
    console.error('Error searching track from Deezer:', error)
    return NextResponse.json({ error: 'Failed to search track from Deezer' }, { status: 500 })
  }
} 