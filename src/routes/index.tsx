import Elysia from 'elysia'

import { Html } from '@elysia/html'

export const indexRoute = new Elysia().get('/', () => (
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
          alt=""
        />
      </a>
    </body>
  </html>
))
