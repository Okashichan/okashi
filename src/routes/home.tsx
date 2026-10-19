import { Elysia } from 'elysia'
import { Html } from '@elysia/html'
import { getNowPlaying } from '../utils/lastfm'

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

export const homeRoute = new Elysia().get('/home', async () => {
  // Fetch initial now-playing data server-side
  const nowPlaying = await getNowPlaying()
  const initialArt = nowPlaying?.albumArt || '/public/images/noimage.png'
  const isPlaying = nowPlaying?.isNowPlaying ?? false
  const trackName = nowPlaying?.name || ''
  const artistName = nowPlaying?.artist || ''

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

          /* ===== Vinyl Record ===== */
          @keyframes spin-vinyl {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .vinyl-container {
            position: fixed;
            z-index: 40;
            width: 70px;
            height: 70px;
            /* Mobile (< 768px): overlay directly on illustration background.
               Background starts at 52px, image height = min(100vw, 520px) * 0.72.
               Fairies cluster at 59.5% width and ~75% of illustration height. */
            top: calc(52px + min(100vw, 520px) * 0.72 * 0.60);
            left: calc(49% + min(100vw, 520px) * 0.095);
            transform: translateX(-50%);
          }

          @media (min-width: 768px) {
            .vinyl-container {
              position: absolute;
              /* Scale size with illustration: ~120px on small screens, up to 200px on large desktop */
              width: clamp(110px, min(100vh, 100vw * 0.6936) * 0.23, 200px);
              height: clamp(110px, min(100vh, 100vw * 0.6936) * 0.23, 200px);
              /* Anchor to illustration top (never viewport bottom!), so tall windows dont pull it down */
              top: calc(min(100vh, 100vw * 0.6936) * 0.74);
              bottom: auto;
              /* Center offset matches the fairy cluster at 58.6% of illustration width */
              left: calc(50vw + min(100vw, 100vh * 1.4417) * 0.086);
              transform: translate(-50%, -50%);
            }
          }

          .vinyl-record {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            transition: filter 0.3s ease, box-shadow 0.3s ease;
          }

          .vinyl-record:hover {
            filter: brightness(1.08);
            box-shadow: 0 0 24px rgba(0,0,0,0.25);
          }

          .vinyl-record.is-spinning {
            animation: spin-vinyl 3s linear infinite;
          }

          .vinyl-record.is-paused {
            animation: spin-vinyl 8s linear infinite;
            opacity: 0.7;
          }

          /* Outer vinyl body — the black disc with grooves */
          .vinyl-body {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background:
              radial-gradient(circle at center,
                transparent 32%,
                rgba(30, 30, 30, 0.6) 33%,
                transparent 34%,
                transparent 38%,
                rgba(30, 30, 30, 0.4) 39%,
                transparent 40%,
                transparent 44%,
                rgba(30, 30, 30, 0.3) 45%,
                transparent 46%
              ),
              conic-gradient(
                from 0deg,
                #1a1a1a 0deg,
                #2a2a2a 30deg,
                #1a1a1a 60deg,
                #222 90deg,
                #1a1a1a 120deg,
                #2a2a2a 150deg,
                #1a1a1a 180deg,
                #222 210deg,
                #1a1a1a 240deg,
                #2a2a2a 270deg,
                #1a1a1a 300deg,
                #222 330deg,
                #1a1a1a 360deg
              );
            box-shadow:
              0 2px 12px rgba(0,0,0,0.4),
              inset 0 0 3px rgba(255,255,255,0.05);
          }

          /* Center label (album art area) */
          .vinyl-label {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 52%;
            height: 52%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            overflow: hidden;
            background: #2a2a2a;
            box-shadow:
              0 0 0 2px rgba(60,60,60,0.8),
              inset 0 0 8px rgba(0,0,0,0.5);
          }

          .vinyl-label img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          /* Center spindle hole */
          .vinyl-spindle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8%;
            height: 8%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, #f5ead8 40%, #c9b89a 100%);
            box-shadow: inset 0 0 2px rgba(0,0,0,0.3);
            z-index: 5;
          }

          /* Track info tooltip */
          .vinyl-info {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 25, 20, 0.88);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #f0e6d6;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.7rem;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease, transform 0.25s ease;
            transform: translateX(-50%) translateY(4px);
            max-width: 220px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 100;
          }

          .vinyl-info .track-name {
            font-weight: 700;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #FFB6C8;
          }

          .vinyl-info .track-artist {
            font-weight: 400;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.8;
            font-size: 0.62rem;
          }

          .vinyl-container:hover .vinyl-info {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }

          /* Scrobbling indicator dot */
          .vinyl-status {
            position: absolute;
            top: -2px;
            left: -2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            z-index: 10;
            border: 2px solid #f5ead8;
          }

          .vinyl-status.live {
            background: #4ade80;
            box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
            animation: pulse-dot 2s ease-in-out infinite;
          }

          .vinyl-status.idle {
            background: #a07060;
            opacity: 0.6;
          }

          @keyframes pulse-dot {
            0%, 100% { box-shadow: 0 0 4px rgba(74, 222, 128, 0.4); }
            50% { box-shadow: 0 0 12px rgba(74, 222, 128, 0.8); }
          }

          @media (min-width: 768px) {
            .vinyl-info {
              font-size: 0.75rem;
              max-width: 280px;
            }
            .vinyl-info .track-artist {
              font-size: 0.65rem;
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

          {/* Vinyl Record - Last.fm Now Playing */}
          <div class="vinyl-container" id="vinyl-container">
            <div class="vinyl-info" id="vinyl-info">
              <span class="track-name" id="vinyl-track">{isPlaying ? trackName : 'Not playing'}</span>
              <span class="track-artist" id="vinyl-artist">{isPlaying ? artistName : ''}</span>
            </div>
            <div class={`vinyl-status ${isPlaying ? 'live' : 'idle'}`} id="vinyl-status"></div>
            <a href={nowPlaying?.url || '#'} target="_blank" rel="noopener noreferrer" id="vinyl-link" style="text-decoration:none;">
              <div class={`vinyl-record ${isPlaying ? 'is-spinning' : 'is-paused'}`} id="vinyl-record">
                <div class="vinyl-body"></div>
                <div class="vinyl-label">
                  <img
                    src={initialArt}
                    alt="Album art"
                    id="vinyl-art"
                    onerror="this.src='/public/images/noimage.png'"
                  />
                </div>
                <div class="vinyl-spindle"></div>
              </div>
            </a>
          </div>
        </main>

        <script>{`
          (function() {
            const record = document.getElementById('vinyl-record');
            const art = document.getElementById('vinyl-art');
            const trackEl = document.getElementById('vinyl-track');
            const artistEl = document.getElementById('vinyl-artist');
            const statusEl = document.getElementById('vinyl-status');
            const linkEl = document.getElementById('vinyl-link');

            async function pollNowPlaying() {
              try {
                const res = await fetch('/api/nowplaying');
                const data = await res.json();

                if (data && data.isNowPlaying) {
                  const newArt = data.albumArt || '/public/images/noimage.png';
                  if (art.src !== newArt && !art.src.endsWith(newArt)) {
                    art.src = newArt;
                  }
                  record.classList.remove('is-paused');
                  record.classList.add('is-spinning');
                  statusEl.classList.remove('idle');
                  statusEl.classList.add('live');
                  trackEl.textContent = data.name || 'Unknown';
                  artistEl.textContent = data.artist || '';
                  if (data.url) linkEl.href = data.url;
                } else {
                  art.src = '/public/images/noimage.png';
                  record.classList.remove('is-spinning');
                  record.classList.add('is-paused');
                  statusEl.classList.remove('live');
                  statusEl.classList.add('idle');
                  trackEl.textContent = 'Not playing';
                  artistEl.textContent = '';
                  linkEl.href = '#';
                }
              } catch(e) {
                console.error('Failed to poll now playing:', e);
              }
            }

            // Poll every 15 seconds
            setInterval(pollNowPlaying, 15000);
          })();
        `}</script>
      </body>
    </html>
  )
})