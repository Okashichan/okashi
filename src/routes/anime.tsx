import { Elysia } from 'elysia'
import { parse } from 'node-html-parser'

import { Html } from '@elysia/html'

import { TerminalLayout } from './terminal-layout'

const animeCss = `
  tr td:not(:first-child) {
    text-align: center;
  }
  .anime img, .anime video {
    max-width: 100%;
    width: auto;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 8px;
    margin: 1rem 0;
  }
`

type AnimeResult = {
  img: string | false
  dl: string
  commentary: string
  vid: string | false
  post: string
}

async function getRandomAnimeGirl(): Promise<AnimeResult | null> {
  // Try Danbooru first
  try {
    const page = Math.floor(Math.random() * 100) + 1
    const listUrl = `https://danbooru.donmai.us/posts?page=${page}&tags=rating%3Ageneral`
    const listRes = await fetch(listUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    const listHtml = await listRes.text()
    if (!listHtml.includes('Just a moment...')) {
      const listRoot = parse(listHtml)
      const posts = listRoot.querySelectorAll('.post-preview')
      const postIds = posts
        .map((el) => {
          const img = el.querySelector('img')
          return img?.getAttribute('alt')?.replace('post #', '') ?? ''
        })
        .filter(Boolean)

      if (postIds.length > 0) {
        const randomId = postIds[Math.floor(Math.random() * postIds.length)]
        const postUrl = `https://danbooru.donmai.us/posts/${randomId}?q=rating%3Ageneral`
        const postRes = await fetch(postUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })
        const postHtml = await postRes.text()
        const postRoot = parse(postHtml)

        let img: string | false = false
        let dl = ''
        let vid: string | false = false
        let commentary = ''

        const viewLarge = postRoot.querySelector('#post-option-view-large > a')
        const downloadLink = postRoot.querySelector('#post-option-download > a')

        if (viewLarge) {
          img = viewLarge.getAttribute('href') || false
        } else if (downloadLink) {
          img = (downloadLink.getAttribute('href') || '').replace(
            '?download=1',
            '',
          )
        }

        if (postRoot.querySelector('#artist-commentary')) {
          commentary =
            postRoot.querySelector('#artist-commentary')?.innerHTML || ''
        }

        if (downloadLink) {
          dl = downloadLink.getAttribute('href') || ''
        }

        const videoEl = postRoot.querySelector('video')
        if (videoEl) {
          vid = videoEl.getAttribute('src') || false
          img = false
        }

        if (img || vid) {
          return { img, dl, commentary, vid, post: postUrl }
        }
      }
    }
  } catch (err) {
    console.error('Danbooru fetch error:', err)
  }

  // Fallback to Safebooru
  try {
    const page = Math.floor(Math.random() * 200) + 1
    const res = await fetch(
      `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=1&pid=${page}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    )
    const data = (await res.json()) as any[]
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0]
      const imgUrl = item.sample_url || item.file_url
      const fullImg = imgUrl.startsWith('http') ? imgUrl : `https:${imgUrl}`
      const fullDl = item.file_url.startsWith('http')
        ? item.file_url
        : `https:${item.file_url}`
      return {
        img: fullImg,
        dl: fullDl,
        commentary: item.tags
          ? `Tags: ${item.tags.split(' ').slice(0, 10).join(', ')}`
          : '',
        vid: false,
        post: `https://safebooru.org/index.php?page=post&s=view&id=${item.id}`,
      }
    }
  } catch (err) {
    console.error('Safebooru fetch error:', err)
  }

  return null
}

export const animeRoute = new Elysia()
  .get('/anime', async () => {
    const anime = await getRandomAnimeGirl()

    return (
      <TerminalLayout
        title="Random Anime Girl"
        activePage="/anime"
        extraCss={animeCss}
      >
        <div class="anime">
          {anime ? (
            <>
              <div>
                <p>
                  <a href={anime.dl} target="_blank">
                    Download image
                  </a>
                  {' | '}
                  <a href={anime.post} target="_blank">
                    View source
                  </a>
                </p>
              </div>
              <div style="text-align: center;">
                {anime.img ? <img src={anime.img as string} alt="Anime girl" /> : null}
                {anime.vid ? (
                  <video
                    src={anime.vid as string}
                    controls
                    autoplay
                    muted
                  />
                ) : null}
              </div>
              {anime.commentary ? (
                <div>
                  <hr />
                  <div safe>{anime.commentary}</div>
                </div>
              ) : null}
            </>
          ) : (
            <div class="terminal-alert terminal-alert-error">
              Failed to fetch anime girl. Try refreshing!
            </div>
          )}
        </div>
        <hr />
        <small>
          All images are being saved to local storage, so if you don't
          like it, then just don't use it.
        </small>
      </TerminalLayout>
    )
  })
  .get('/anime/api/random', async () => {
    const anime = await getRandomAnimeGirl()
    return anime || { error: 'Failed to fetch' }
  })
  .get('/anime/uWuApi/get-random-anime-girl', async () => {
    const anime = await getRandomAnimeGirl()
    return anime || { error: 'Failed to fetch' }
  })
