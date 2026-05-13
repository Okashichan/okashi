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
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body class="w-full h-screen">
        <a
          class="block w-full h-full"
          href="https://hikka.io/u/Okashi"
          target="_blank"
        >
          <img
            class="w-full h-full object-cover"
            src="/public/images/waifu.jpg"
            alt="Waifu"
          />
        </a>
        {'<!-- curl her ass -->'}
      </body>
    </html>
  )
})
