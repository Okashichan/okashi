import { $ } from 'bun'
import Elysia from 'elysia'

import { Html } from '@elysia/html'

const ALLOWED_CURL_FORMATS = ['iterm', 'kitty', 'sixel', 'symbols'] as const

const getRandomScreenshot = async () => {
  const files = await Array.fromAsync(
    new Bun.Glob('public/screenshots/*').scan(),
  )

  return files[Math.floor(Math.random() * files.length)]
}

const getCurled = async (requestedFormat?: string) => {
  const safeFormat =
    ALLOWED_CURL_FORMATS.find((f) => f === requestedFormat) ?? 'symbols'

  const render =
    await $`chafa --probe off -s 150x -c full -f ${safeFormat} ${await getRandomScreenshot()}`
      .quiet()
      .text()

  const helpMessage = `Change the output format by adding ?f=<format> to the URL.
Supported formats: ${ALLOWED_CURL_FORMATS.join(', ')}.
`

  return !requestedFormat ? render + helpMessage : render
}

export const indexRoute = new Elysia().get('/', async ({ headers, query }) => {
  if (headers['user-agent']?.includes('curl')) return getCurled(query.f)

  return (
    <html lang="uk">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta name="theme-color" content="#F3C2B3" />
        <meta
          property="og:title"
          content="Watashi (わたし, お菓子ちゃん)"
        />
        <meta
          property="og:description"
          content="A girl with long pink hair who serves as a mediator between human kind and the fairies."
        />
        <meta property="og:url" content="https://okashi.ceo" />
        <meta property="og:site_name" content="okashi.ceo" />
        <meta
          property="og:image"
          content="https://okashi.ceo/public/images/waifu.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://okashi.ceo/public/images/waifu.jpg"
        />
        <title>人類は衰退しました</title>
        <style>{`
          html {
            background: url('/public/images/waifu.jpg') no-repeat center center fixed;
            background-size: cover;
            height: 100%;
            overflow: hidden;
          }
          body { margin: 0; height: 100%; }
          .clickable {
            height: 100%;
            width: 100%;
            left: 0;
            top: 0;
            position: absolute;
            z-index: 1;
          }
        `}</style>
      </head>
      <body>
        <a href="/home">
          <span class="clickable"></span>
        </a>
        {'<!-- Try curl -L okashi.ceo -->'}
        {'<!-- Try password generator https://okashi.ceo/password -->'}
        {'<!-- Telegram stickers https://t.me/addstickers/Watashichan -->'}
      </body>
    </html>
  )
})
