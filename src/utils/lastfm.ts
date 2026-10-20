const LASTFM_API_KEY = process.env.LASTFM_API_KEY || ''
const LASTFM_USERNAME = process.env.LASTFM_USERNAME || ''
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/'

export interface NowPlayingTrack {
  name: string
  artist: string
  album: string
  albumArt: string | null
  url: string
  isNowPlaying: boolean
}

export async function getNowPlaying(): Promise<NowPlayingTrack | null> {
  try {
    const url = `${LASTFM_BASE}?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
    const res = await fetch(url)

    if (!res.ok) {
      console.error('Last.fm API error:', res.status, res.statusText)
      return null
    }

    const data = await res.json()
    const rawTracks = data?.recenttracks?.track

    if (!rawTracks) {
      return null
    }

    const tracks = Array.isArray(rawTracks) ? rawTracks : [rawTracks]

    if (tracks.length === 0) {
      return null
    }

    const track = tracks[0]
    const isNowPlaying = track['@attr']?.nowplaying === 'true'

    // Get the largest available album art image only if currently playing
    let albumArt: string | null = null
    if (isNowPlaying) {
      const images = track.image || []
      // Prefer extralarge > large > medium > small
      for (const size of ['extralarge', 'large', 'medium', 'small']) {
        const img = images.find((i: any) => i.size === size)
        if (img && img['#text'] && img['#text'].trim().length > 0) {
          albumArt = img['#text'].trim()
          break
        }
      }
    }

    return {
      name: isNowPlaying ? (track.name || 'Unknown') : 'Not playing',
      artist: isNowPlaying ? (track.artist?.['#text'] || track.artist?.name || 'Unknown') : '',
      album: isNowPlaying ? (track.album?.['#text'] || '') : '',
      albumArt,
      url: isNowPlaying ? (track.url || '') : '',
      isNowPlaying,
    }
  } catch (err) {
    console.error('Error fetching Last.fm data:', err)
    return null
  }
}
