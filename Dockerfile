FROM oven/bun:alpine AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig.json ./tsconfig.json

RUN bunx @tailwindcss/cli -i src/styles.css -o public/styles.css --minify

ENV NODE_ENV=production


FROM oven/bun:alpine

WORKDIR /app

RUN apk add --no-cache chafa

ENV TERM=xterm-256color
ENV COLORTERM=truecolor

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "src/main.ts"]