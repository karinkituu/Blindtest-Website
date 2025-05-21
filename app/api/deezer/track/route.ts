import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('id')

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`)
    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 })
    }
    
    return NextResponse.json({
      id: data.id.toString(),
      title: data.title,
      artist: data.artist.name,
      album: data.album.title,
      image: data.album.cover_medium,
      preview: data.preview
    })
  } catch (error) {
    console.error('Error fetching track from Deezer:', error)
    return NextResponse.json({ error: 'Failed to fetch track from Deezer' }, { status: 500 })
  }
} 