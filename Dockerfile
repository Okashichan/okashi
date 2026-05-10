FROM oven/bun AS build

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

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/public public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]