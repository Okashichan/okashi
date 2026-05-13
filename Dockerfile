FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig.json ./tsconfig.json

RUN bunx @tailwindcss/cli -i src/styles/input.css -o public/styles.css --minify

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    src/index.ts

FROM oven/bun:alpine

WORKDIR /app

RUN apk add --no-cache chafa

ENV TERM=xterm-256color
ENV COLORTERM=truecolor

COPY --from=build /app/server ./server
COPY --from=build /app/public ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]