# Okashi's Website

A silly personal website with questionable technology choices & functionality.

### Develop

```bash
devenv shell
bun run dev
```

### Deploy

> docker build -t okashi .

> docker run -d --restart=always --name okashi-website -p 3000:3000 okashi
