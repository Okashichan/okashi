import { initTailwind } from '@moshyfawn/tailwind-serve'
import { Elysia } from 'elysia'

import { html } from '@elysia/html'
import { staticPlugin } from '@elysia/static'

import { animeRoute } from './routes/anime'
import { genshinRoute } from './routes/genshin'
import { homeRoute } from './routes/home'
import { indexRoute } from './routes/index'
import { initCronJobs } from './utils/cron'

const tw = await initTailwind()

initCronJobs()

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get('/public/styles.css', () => tw.response())
  .get('/favicon.ico', () => Bun.file('public/favicon.ico'))
  .use(indexRoute)
  .use(homeRoute)
  .use(animeRoute)
  .use(genshinRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
