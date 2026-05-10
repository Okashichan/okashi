import { Elysia } from 'elysia'

import { html } from '@elysia/html'
import { staticPlugin } from '@elysia/static'

import { indexRoute } from './routes/index'

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .use(indexRoute)
  .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
