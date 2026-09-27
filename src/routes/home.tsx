import { Elysia } from 'elysia'
import { Html } from '@elysia/html'

const nav = [
  { href: '/', label: 'Back', jp: '戻る' },
  { href: '/anime', label: 'Anime', jp: 'アニメ' },
  { href: '/genshin', label: 'Genshin', jp: '原神' },
]

const fairies = [
  '/public/images/ui/nakatasan.png',
  '/public/images/ui/youseisan5.png',
  '/public/images/ui/youseisan7.png',
  '/public/images/ui/youseisan11.png',
  '/public/images/ui/youseisan14.png',
]

// Generate a konpeitō star-burst clip-path polygon
function konpeitoClipPath(bumps: number, outerR = 50, innerR = 35): string {
  const points: string[] = []
  const totalPoints = bumps * 2
  for (let i = 0; i < totalPoints; i++) {
    const angleDeg = (i * 360) / totalPoints - 90
    const angleRad = (angleDeg * Math.PI) / 180
    const r = i % 2 === 0 ? outerR : innerR
    const x = 50 + r * Math.cos(angleRad)
    const y = 50 + r * Math.sin(angleRad)
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`)
  }
  return `polygon(${points.join(', ')})`
}

// Pre-generate different konpeitō shapes
const konpeitoShapes = [
  konpeitoClipPath(10, 50, 36), // 10-bump
  konpeitoClipPath(12, 50, 38), // 12-bump
  konpeitoClipPath(8, 50, 34),  // 8-bump
]

const konpeitoStyles = [
  { bg: '#FFB6C8', shadow: 'rgba(255, 140, 170, 0.5)', rotate: '-8deg', size: 130 },
  { bg: '#A8D8F0', shadow: 'rgba(130, 190, 240, 0.5)', rotate: '12deg', size: 125 },
  { bg: '#B8E6A0', shadow: 'rgba(150, 210, 130, 0.5)', rotate: '-5deg', size: 135 },
]

export const homeRoute = new Elysia().get('/home', () => {
  return (
    <html lang="uk">
      <head>
        <title>人類は衰退しました</title>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="stylesheet" href="/public/styles.css" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            width: 100%;
            min-height: 100dvh;
            overflow-x: hidden;
            background-color: #f5ead8;
            background-image:
              url('/public/images/ui/logo.png'),
              url('/public/images/ui/top_visual.png'),
              url('/public/images/ui/bg_00.jpg');
            background-repeat: no-repeat;
            background-position:
              center 14px,
              center 52px,
              center center;
            background-size:
              min(58vw, 230px) auto,
              min(100vw, 520px) auto,
              cover;
            background-attachment: scroll, scroll, fixed;
          }

          @media (min-width: 768px) {
            body {
              background-position: 85% 3%, center top, center center;
              background-size: 34% auto, contain, cover;
              background-attachment: fixed;
            }
          }

          main {
            width: 100%;
            max-width: 100vw;
            min-height: 100dvh;
            position: relative;
            overflow-x: hidden;
          }

          /* Navigation */
          nav.fairy-nav {
            position: relative;
            z-index: 50;
            width: 100%;
            margin-top: calc(min(100vw, 520px) * 0.72 + 60px);
            padding: 1.25rem 0.5rem 3rem 0.5rem;
            display: flex;
            justify-content: center;
          }

          @media (min-width: 768px) {
            nav.fairy-nav {
              position: absolute;
              right: 12%;
              top: 18%;
              margin-top: 0;
              width: auto;
              padding: 0;
              display: block;
            }
          }

          nav.fairy-nav ul {
            display: flex;
            flex-direction: row; /* Horizontal on mobile */
            justify-content: space-evenly;
            gap: 0.5rem;
            width: 100%;
            max-width: 100%;
            align-items: center;
            list-style: none;
            position: relative;
            z-index: 10;
          }

          @media (min-width: 768px) {
            nav.fairy-nav ul {
              flex-direction: column; /* Back to vertical on desktop */
              gap: 1.8rem;
              width: auto;
              max-width: none;
            }
          }

          nav.fairy-nav li {
            list-style: none;
            flex: 1; /* Stretch items equally across available space */
            display: flex;
            justify-content: center;
          }
          
          @media (min-width: 768px) {
            nav.fairy-nav li {
              flex: none;
            }
          }

          /* Konpeitō nav link — completely responsive container */
          .konpeito-link {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            cursor: pointer;
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            /* Mobile responsive bounds */
            width: 100%;
            max-width: 110px;
            aspect-ratio: 1 / 1;
          }
          
          @media (min-width: 768px) {
            .konpeito-link {
              /* Exact pixel sizing for desktop based on configuration */
              width: calc(var(--k-size) * 1px);
              height: calc(var(--k-size) * 1px);
              max-width: none;
            }
          }

          .konpeito-link:hover {
            transform: scale(1.08);
          }

          /* The star-burst candy shape */
          .konpeito-candy {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            background: var(--k-bg);
            clip-path: var(--k-shape);
            transform: translate(-50%, -50%) rotate(var(--k-rotate, 0deg));
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                        filter 0.3s ease;
            filter: drop-shadow(0 3px 8px var(--k-shadow));
          }

          .konpeito-link:hover .konpeito-candy {
            transform: translate(-50%, -50%) rotate(calc(var(--k-rotate, 0deg) + 15deg)) scale(1.08);
            filter: drop-shadow(0 5px 14px var(--k-shadow));
          }

          /* Content (fairy + text) on top of the candy */
          .konpeito-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px;
          }

          .konpeito-content .fairy-img {
            width: 32px; /* Smaller for mobile */
            height: 32px;
            object-fit: contain;
            filter: drop-shadow(0 2px 4px rgba(80, 50, 30, 0.2));
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .konpeito-link:hover .fairy-img {
            transform: scale(1.15) rotate(12deg) translateY(-4px);
          }

          .konpeito-label {
            font-weight: 900;
            font-size: 0.85rem; /* Scaled down for mobile */
            letter-spacing: 0.12em;
            color: #725442;
            text-shadow:
              0 1px 0 rgba(255,255,255,0.95),
              1px 0 0 rgba(255,255,255,0.95),
              -1px 0 0 rgba(255,255,255,0.95),
              0 -1px 0 rgba(255,255,255,0.95);
            margin-top: 2px;
            transition: color 0.25s ease;
          }

          .konpeito-link:hover .konpeito-label {
            color: #c0584e;
          }

          .konpeito-sub {
            font-size: 0.55rem; /* Scaled down for mobile */
            font-weight: 500;
            letter-spacing: 0.05em;
            color: #a07060;
            opacity: 0.8;
            text-shadow: 0 1px 0 rgba(255,255,255,0.9);
          }

          /* Restore full sizes for Desktop */
          @media (min-width: 768px) {
            .konpeito-content .fairy-img {
              width: 42px;
              height: 42px;
            }
            .konpeito-label {
              font-size: 1.05rem;
            }
            .konpeito-sub {
              font-size: 0.62rem;
            }
          }
        `}</style>
      </head>
      <body>
        <main>
          <nav class="fairy-nav">
            <ul>
              {nav.map((item, idx) => {
                const fairy = fairies[idx % fairies.length]
                const shape = konpeitoShapes[idx % konpeitoShapes.length]
                const style = konpeitoStyles[idx % konpeitoStyles.length]

                return (
                  <li>
                    {/* Inline styles are mapped to CSS variables for responsive flexibility */}
                    <a
                      href={item.href}
                      class="konpeito-link"
                      style={`
                        --k-size: ${style.size};
                        --k-bg: ${style.bg};
                        --k-shape: ${shape};
                        --k-rotate: ${style.rotate};
                        --k-shadow: ${style.shadow};
                      `}
                    >
                      <div class="konpeito-candy"></div>
                      <div class="konpeito-content">
                        <img src={fairy} class="fairy-img" alt="" />
                        <span class="konpeito-label">{item.label}</span>
                        <span class="konpeito-sub">{item.jp}</span>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </main>
      </body>
    </html>
  )
})