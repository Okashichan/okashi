# Okashi's Website

A silly personal website with questionable technology choices & functionality.

### Develop

```bash
devenv shell
bun run dev
```

### Deploy

> docker build -t okashi .
> docker network create okashi-net
> docker run -d --restart=always --name okashi-website --network okashi-net -p 6967:3000 okashi
