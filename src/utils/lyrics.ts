interface CacheEntry {
  result: LyricsResult
  expiry: number
}

export interface LyricsResult {
  lyrics: string | null
  instrumental: boolean
  trackName?: string
  artistName?: string
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_SUCCESS = 1000 * 60 * 60 // 1 hour
const CACHE_TTL_MISS = 1000 * 60 * 5 // 5 minutes

const USER_AGENT = 'Okashi/1.0.50 (https://okashi.ceo)'

function cleanTitle(title: string): string {
  return title
    .replace(/\s*[\(\[](feat\.|ft\.|with|prod\.).*?[\)\]]/gi, '')
    .replace(/\s*[\(\[](remaster(ed)?|\d{4}\s*remaster|single version|radio edit|bonus track).*?[\)\]]/gi, '')
    .replace(/\s*-\s*.*(remaster(ed)?|single version|radio edit).*$/gi, '')
    .trim()
}

async function fetchWithRetry(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      })
      if (res.status === 503 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 600))
        continue
      }
      return res
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 600))
      }
    }
  }
  return null
}

export async function getLyrics(track: string, artist: string): Promise<LyricsResult> {
  const trimmedTrack = track?.trim() || ''
  const trimmedArtist = artist?.trim() || ''

  if (!trimmedTrack || !trimmedArtist) {
    return { lyrics: null, instrumental: false }
  }

  const cacheKey = `${trimmedArtist.toLowerCase()}:::${trimmedTrack.toLowerCase()}`
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && cached.expiry > now) {
    return cached.result
  }

  try {
    // 1. Try exact match first
    const exactParams = new URLSearchParams({
      track_name: trimmedTrack,
      artist_name: trimmedArtist,
    })
    const exactRes = await fetchWithRetry(`https://lrclib.net/api/get?${exactParams}`)

    if (exactRes && exactRes.ok) {
      const data = await exactRes.json()
      const result: LyricsResult = {
        lyrics: data.plainLyrics || null,
        instrumental: !!data.instrumental,
        trackName: data.trackName,
        artistName: data.artistName,
      }
      cache.set(cacheKey, { result, expiry: now + CACHE_TTL_SUCCESS })
      return result
    }

    // 2. Try cleaned title if different
    const cleaned = cleanTitle(trimmedTrack)
    if (cleaned && cleaned.toLowerCase() !== trimmedTrack.toLowerCase()) {
      const cleanParams = new URLSearchParams({
        track_name: cleaned,
        artist_name: trimmedArtist,
      })
      const cleanRes = await fetchWithRetry(`https://lrclib.net/api/get?${cleanParams}`)
      if (cleanRes && cleanRes.ok) {
        const data = await cleanRes.json()
        const result: LyricsResult = {
          lyrics: data.plainLyrics || null,
          instrumental: !!data.instrumental,
          trackName: data.trackName,
          artistName: data.artistName,
        }
        cache.set(cacheKey, { result, expiry: now + CACHE_TTL_SUCCESS })
        return result
      }
    }

    // 3. Try search endpoint as fallback
    const searchParams = new URLSearchParams({
      track_name: cleaned || trimmedTrack,
      artist_name: trimmedArtist,
    })
    const searchRes = await fetchWithRetry(`https://lrclib.net/api/search?${searchParams}`)
    if (searchRes && searchRes.ok) {
      const list = await searchRes.json()
      if (Array.isArray(list) && list.length > 0) {
        const match = list.find((item: any) => item.plainLyrics || item.instrumental) || list[0]
        if (match) {
          const result: LyricsResult = {
            lyrics: match.plainLyrics || null,
            instrumental: !!match.instrumental,
            trackName: match.trackName,
            artistName: match.artistName,
          }
          cache.set(cacheKey, { result, expiry: now + CACHE_TTL_SUCCESS })
          return result
        }
      }
    }

    // Not found
    const missResult: LyricsResult = { lyrics: null, instrumental: false }
    cache.set(cacheKey, { result: missResult, expiry: now + CACHE_TTL_MISS })
    return missResult
  } catch (err) {
    console.error('Error fetching lyrics from LRCLIB:', err)
    return { lyrics: null, instrumental: false }
  }
}
