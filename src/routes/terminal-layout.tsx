import { Html } from '@elysia/html'

type NavItem = {
  href: string
  label: string
  active?: boolean
}

const navItems: NavItem[] = [
  { href: '/anime', label: 'Anime' },
  { href: '/genshin', label: 'Genshin' },
]

export const TerminalLayout = ({
  children,
  title,
  activePage,
  extraCss,
  extraJs,
}: {
  children: any
  title: string
  activePage?: string
  extraCss?: string
  extraJs?: string
}) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/terminal.css@0.7.4/dist/terminal.min.css"
        />
        <style>{`
          :root {
            --global-font-size: 15px;
            --global-line-height: 1.4em;
            --global-space: 10px;
            --font-stack: Menlo, Monaco, Lucida Console, Liberation Mono,
              DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace,
              serif;
            --mono-font-stack: Menlo, Monaco, Lucida Console, Liberation Mono,
              DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace,
              serif;
            --background-color: #222225;
            --page-width: 60em;
            --font-color: #e8e9ed;
            --invert-font-color: #222225;
            --secondary-color: #a3abba;
            --tertiary-color: #a3abba;
            --primary-color: #62c4ff;
            --error-color: #ff3c74;
            --progress-bar-background: #3f3f44;
            --progress-bar-fill: #62c4ff;
            --code-bg-color: #3f3f44;
            --input-style: solid;
            --display-h1-decoration: none;
          }
        `}</style>
        {extraCss ? <style>{extraCss}</style> : null}
        <title safe>{title}</title>
      </head>
      <body class="terminal">
        <div class="container">
          <div class="terminal-nav">
            <div class="terminal-logo">
              <div class="logo terminal-prompt">
                <a href="/home" class="no-style">
                  Okashi
                </a>
              </div>
            </div>
            <nav class="terminal-menu">
              <ul>
                {navItems.map((item) => (
                  <li>
                    <a
                      class={`menu-item ${activePage === item.href ? 'active' : ''}`}
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {children}

          <footer>
            <hr />
            <p>
              Made by{' '}
              <a href="https://t.me/PeliemeniDesu" target="_blank">
                @okashi
              </a>
            </p>
          </footer>
        </div>
        {extraJs ? <script>{extraJs}</script> : null}
      </body>
    </html>
  )
}
