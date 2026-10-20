import { Elysia } from 'elysia'
import { Html } from '@elysia/html'
import { getNowPlaying } from '../utils/lastfm'
import { getLyrics } from '../utils/lyrics'

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
  const isPlaying = nowPlaying?.isNowPlaying ?? false
  const initialArt = isPlaying && nowPlaying?.albumArt ? nowPlaying.albumArt : '/public/images/noimage.png'
  const trackName = isPlaying ? (nowPlaying?.name || '') : ''
  const artistName = isPlaying ? (nowPlaying?.artist || '') : ''
  const trackUrl = isPlaying ? (nowPlaying?.url || '#') : '#'

  // Fetch initial lyrics if music is actively playing
  const initialLyricsResult = isPlaying && trackName && artistName
    ? await getLyrics(trackName, artistName)
    : { lyrics: null, instrumental: false }

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

          /* ===== Lyrics Widget ===== */
          /* Mobile (< 768px): in-flow bottom section */
          .lyrics-section {
            position: relative;
            z-index: 45;
            width: min(92%, 580px);
            margin: 0.5rem auto 3.5rem auto;
            pointer-events: auto;
          }

          /* Desktop (>= 768px): top-left floating widget */
          @media (min-width: 768px) {
            .lyrics-section {
              position: fixed;
              top: 24px;
              left: 24px;
              z-index: 60;
              width: clamp(270px, 23vw, 330px);
              margin: 0;
            }

            .lyrics-card {
              max-height: clamp(260px, 52vh, 440px);
            }

            .lyrics-section:not(.is-collapsed) .lyrics-pill {
              display: none;
            }
            .lyrics-section:not(.is-collapsed) .lyrics-card {
              display: flex;
            }
            .lyrics-section.is-collapsed .lyrics-pill {
              display: flex;
            }
            .lyrics-section.is-collapsed .lyrics-card {
              display: none;
            }

            .lyrics-status-badge {
              display: none;
            }
            .lyrics-close-btn {
              display: flex;
            }
          }

          /* Mobile display rules */
          @media (max-width: 767px) {
            .lyrics-pill {
              display: none !important;
            }
            .lyrics-close-btn {
              display: none !important;
            }
            .lyrics-status-badge {
              display: flex;
            }
          }

          /* Compact pill badge (used on desktop when minimized) */
          .lyrics-pill {
            display: flex;
            align-items: center;
            gap: 7px;
            background: rgba(255, 250, 242, 0.94);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1.5px solid #FFB6C8;
            border-radius: 9999px;
            padding: 5px 12px;
            box-shadow:
              0 4px 14px rgba(255, 140, 170, 0.25),
              0 2px 6px rgba(114, 84, 66, 0.12);
            cursor: pointer;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.25s ease,
                        border-color 0.25s ease;
            font-family: inherit;
            user-select: none;
          }

          .lyrics-pill:hover {
            transform: scale(1.06);
            box-shadow: 0 6px 18px rgba(255, 140, 170, 0.38);
            border-color: #f792ab;
          }

          .lyrics-pill-fairy {
            width: 22px;
            height: 22px;
            object-fit: contain;
            filter: drop-shadow(0 1px 2px rgba(80, 50, 30, 0.15));
          }

          .lyrics-pill-text {
            font-size: 0.78rem;
            font-weight: 800;
            color: #725442;
            letter-spacing: 0.05em;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.9);
          }

          .lyrics-pill-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #a07060;
            opacity: 0.6;
            transition: all 0.3s ease;
          }

          .lyrics-pill-dot.live {
            background: #4ade80;
            opacity: 1;
            box-shadow: 0 0 6px rgba(74, 222, 128, 0.7);
            animation: pulse-dot 2s infinite ease-in-out;
          }

          .lyrics-card {
            width: 100%;
            background: rgba(255, 250, 242, 0.94);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(255, 182, 200, 0.85);
            border-radius: 20px;
            box-shadow:
              0 12px 36px rgba(114, 84, 66, 0.14),
              0 4px 16px rgba(255, 140, 170, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: box-shadow 0.3s ease;
          }

          .lyrics-card:hover {
            box-shadow:
              0 16px 42px rgba(114, 84, 66, 0.18),
              0 6px 20px rgba(255, 140, 170, 0.28),
              inset 0 1px 0 rgba(255, 255, 255, 0.95);
          }

          .lyrics-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: linear-gradient(135deg, rgba(255, 225, 235, 0.88), rgba(215, 240, 255, 0.8));
            border-bottom: 1px solid rgba(224, 204, 185, 0.55);
            user-select: none;
          }

          .lyrics-title-group {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            flex: 1;
          }

          .lyrics-fairy-icon {
            width: 28px;
            height: 28px;
            object-fit: contain;
            flex-shrink: 0;
            filter: drop-shadow(0 2px 4px rgba(80, 50, 30, 0.18));
          }

          .lyrics-title-meta {
            min-width: 0;
            flex: 1;
          }

          .lyrics-heading {
            font-size: 0.88rem;
            font-weight: 900;
            color: #725442;
            letter-spacing: 0.08em;
            display: flex;
            align-items: center;
            gap: 6px;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.9);
            line-height: 1.2;
          }

          .lyrics-subheading {
            font-size: 0.65rem;
            font-weight: 600;
            color: #a07060;
            opacity: 0.85;
          }

          .lyrics-track-info {
            font-size: 0.72rem;
            font-weight: 600;
            color: #a07060;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
            margin-top: 2px;
          }

          .lyrics-status-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(160, 112, 96, 0.2);
            border-radius: 9999px;
            padding: 3px 9px;
            font-size: 0.65rem;
            font-weight: 700;
            color: #725442;
            flex-shrink: 0;
          }

          .lyrics-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #a07060;
            opacity: 0.6;
            transition: all 0.3s ease;
          }

          .lyrics-status-dot.live {
            background: #4ade80;
            opacity: 1;
            box-shadow: 0 0 6px rgba(74, 222, 128, 0.7);
            animation: pulse-dot 2s infinite ease-in-out;
          }

          .lyrics-close-btn {
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(160, 112, 96, 0.25);
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            color: #725442;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s ease;
          }

          .lyrics-close-btn:hover {
            background: #FFB6C8;
            color: #fff;
            transform: scale(1.1);
          }

          .lyrics-body {
            padding: 18px 20px;
            max-height: 380px;
            overflow-y: auto;
            font-size: 0.86rem;
            line-height: 1.85;
            color: #5c4033;
            scrollbar-width: thin;
            scrollbar-color: #FFB6C8 transparent;
          }

          .lyrics-body::-webkit-scrollbar {
            width: 5px;
          }
          .lyrics-body::-webkit-scrollbar-thumb {
            background-color: #FFB6C8;
            border-radius: 9999px;
          }
          .lyrics-body::-webkit-scrollbar-track {
            background: transparent;
          }

          .lyrics-text {
            white-space: pre-wrap;
            word-break: break-word;
            user-select: text;
            text-align: center;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
          }

          .lyrics-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 28px 12px;
            color: #8c6a58;
          }

          .lyrics-placeholder-icon {
            font-size: 1.8rem;
            margin-bottom: 8px;
          }

          .lyrics-placeholder p {
            font-size: 0.78rem;
            font-weight: 600;
            line-height: 1.6;
          }

          .lyrics-en {
            font-size: 0.66rem;
            font-weight: 500;
            opacity: 0.8;
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
            <a href={trackUrl} target={isPlaying ? '_blank' : '_self'} rel="noopener noreferrer" id="vinyl-link" style="text-decoration:none;">
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

          {/* Lyrics: Bottom on Mobile, Top-Left Floating on Desktop */}
          <section class="lyrics-section" id="lyrics-section">
            <button
              type="button"
              class="lyrics-pill"
              id="lyrics-pill"
              aria-label="Expand Lyrics"
            >
              <img src="/public/images/ui/nakatasan.png" class="lyrics-pill-fairy" alt="" />
              <span class="lyrics-pill-text">歌詞</span>
              <span class={`lyrics-pill-dot ${isPlaying ? 'live' : 'idle'}`} id="lyrics-pill-dot"></span>
            </button>

            <div class="lyrics-card" id="lyrics-card">
              <div class="lyrics-header">
                <div class="lyrics-title-group">
                  <img src="/public/images/ui/nakatasan.png" class="lyrics-fairy-icon" alt="" />
                  <div class="lyrics-title-meta">
                    <div class="lyrics-heading">
                      歌詞 <span class="lyrics-subheading">Lyrics</span>
                    </div>
                    <div class="lyrics-track-info" id="lyrics-track-info">
                      {isPlaying ? `${trackName} — ${artistName}` : '音楽停止中 (Not playing)'}
                    </div>
                  </div>
                </div>
                <div class="lyrics-status-badge">
                  <span class={`lyrics-status-dot ${isPlaying ? 'live' : 'idle'}`} id="lyrics-status-dot"></span>
                  <span id="lyrics-status-text">{isPlaying ? 'LIVE' : 'IDLE'}</span>
                </div>
                <button
                  type="button"
                  class="lyrics-close-btn"
                  id="lyrics-close-btn"
                  title="Minimize lyrics"
                  aria-label="Minimize lyrics"
                >
                  ✕
                </button>
              </div>

              <div class="lyrics-body" id="lyrics-body">
                {isPlaying ? (
                  initialLyricsResult.instrumental ? (
                    <div class="lyrics-placeholder">
                      <span class="lyrics-placeholder-icon">🎵</span>
                      <p>インストゥルメンタル楽曲です<br /><span class="lyrics-en">Instrumental track (no lyrics)</span></p>
                    </div>
                  ) : initialLyricsResult.lyrics ? (
                    <div class="lyrics-text">{initialLyricsResult.lyrics}</div>
                  ) : (
                    <div class="lyrics-placeholder">
                      <span class="lyrics-placeholder-icon">🍂</span>
                      <p>歌詞が見つかりませんでした<br /><span class="lyrics-en">Lyrics unavailable for this track</span></p>
                    </div>
                  )
                ) : (
                  <div class="lyrics-placeholder">
                    <span class="lyrics-placeholder-icon">🍬</span>
                    <p>曲を再生すると歌詞が表示されます<br /><span class="lyrics-en">Play a song to view lyrics ~</span></p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <script>{`
          (function() {
            const record = document.getElementById('vinyl-record');
            const art = document.getElementById('vinyl-art');
            const trackEl = document.getElementById('vinyl-track');
            const artistEl = document.getElementById('vinyl-artist');
            const statusEl = document.getElementById('vinyl-status');
            const linkEl = document.getElementById('vinyl-link');

            // Lyrics elements
            const lyricsSection = document.getElementById('lyrics-section');
            const lyricsPill = document.getElementById('lyrics-pill');
            const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
            const lyricsTrackInfo = document.getElementById('lyrics-track-info');
            const lyricsBody = document.getElementById('lyrics-body');
            const lyricsPillDot = document.getElementById('lyrics-pill-dot');
            const lyricsStatusDot = document.getElementById('lyrics-status-dot');
            const lyricsStatusText = document.getElementById('lyrics-status-text');

            if (lyricsPill && lyricsSection) {
              lyricsPill.addEventListener('click', function() {
                lyricsSection.classList.remove('is-collapsed');
              });
            }

            if (lyricsCloseBtn && lyricsSection) {
              lyricsCloseBtn.addEventListener('click', function() {
                lyricsSection.classList.add('is-collapsed');
              });
            }

            function updateLyricsStatus(live) {
              if (live) {
                if (lyricsPillDot) {
                  lyricsPillDot.classList.remove('idle');
                  lyricsPillDot.classList.add('live');
                }
                if (lyricsStatusDot) {
                  lyricsStatusDot.classList.remove('idle');
                  lyricsStatusDot.classList.add('live');
                }
                if (lyricsStatusText) lyricsStatusText.textContent = 'LIVE';
              } else {
                if (lyricsPillDot) {
                  lyricsPillDot.classList.remove('live');
                  lyricsPillDot.classList.add('idle');
                }
                if (lyricsStatusDot) {
                  lyricsStatusDot.classList.remove('live');
                  lyricsStatusDot.classList.add('idle');
                }
                if (lyricsStatusText) lyricsStatusText.textContent = 'IDLE';
              }
            }

            let currentTrack = ${JSON.stringify(trackName)};
            let currentArtist = ${JSON.stringify(artistName)};

            async function updateLyrics(track, artist) {
              if (!track || !artist) {
                if (lyricsTrackInfo) lyricsTrackInfo.textContent = '音楽停止中 (Not playing)';
                if (lyricsBody) {
                  lyricsBody.innerHTML = '<div class="lyrics-placeholder"><span class="lyrics-placeholder-icon">🍬</span><p>曲を再生すると歌詞が表示されます<br /><span class="lyrics-en">Play a song to view lyrics ~</span></p></div>';
                }
                return;
              }

              if (lyricsTrackInfo) lyricsTrackInfo.textContent = track + ' — ' + artist;
              if (lyricsBody) {
                lyricsBody.innerHTML = '<div class="lyrics-placeholder"><span class="lyrics-placeholder-icon">✨</span><p>歌詞を読み込み中...<br /><span class="lyrics-en">Loading lyrics...</span></p></div>';
              }

              try {
                const res = await fetch('/api/lyrics?track=' + encodeURIComponent(track) + '&artist=' + encodeURIComponent(artist));
                if (!res.ok) throw new Error('Lyrics fetch failed');
                const data = await res.json();

                if (!lyricsBody) return;

                if (data.instrumental) {
                  lyricsBody.innerHTML = '<div class="lyrics-placeholder"><span class="lyrics-placeholder-icon">🎵</span><p>インストゥルメンタル楽曲です<br /><span class="lyrics-en">Instrumental track (no lyrics)</span></p></div>';
                } else if (data.lyrics) {
                  const div = document.createElement('div');
                  div.className = 'lyrics-text';
                  div.textContent = data.lyrics;
                  lyricsBody.replaceChildren(div);
                } else {
                  lyricsBody.innerHTML = '<div class="lyrics-placeholder"><span class="lyrics-placeholder-icon">🍂</span><p>歌詞が見つかりませんでした<br /><span class="lyrics-en">Lyrics unavailable for this track</span></p></div>';
                }
              } catch (e) {
                console.error('Failed to load lyrics:', e);
                if (lyricsBody) {
                  lyricsBody.innerHTML = '<div class="lyrics-placeholder"><span class="lyrics-placeholder-icon">🍂</span><p>歌詞が見つかりませんでした<br /><span class="lyrics-en">Lyrics unavailable for this track</span></p></div>';
                }
              }
            }

            async function pollNowPlaying() {
              try {
                const res = await fetch('/api/nowplaying');
                if (!res.ok) throw new Error('API error: ' + res.status);
                const text = await res.text();
                const data = text ? JSON.parse(text) : null;

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
                  linkEl.href = data.url || '#';
                  linkEl.target = '_blank';

                  updateLyricsStatus(true);

                  if (data.name !== currentTrack || data.artist !== currentArtist) {
                    currentTrack = data.name || '';
                    currentArtist = data.artist || '';
                    await updateLyrics(currentTrack, currentArtist);
                  }
                } else {
                  art.src = '/public/images/noimage.png';
                  record.classList.remove('is-spinning');
                  record.classList.add('is-paused');
                  statusEl.classList.remove('live');
                  statusEl.classList.add('idle');
                  trackEl.textContent = 'Not playing';
                  artistEl.textContent = '';
                  linkEl.href = '#';
                  linkEl.target = '_self';

                  updateLyricsStatus(false);

                  if (currentTrack !== '') {
                    currentTrack = '';
                    currentArtist = '';
                    await updateLyrics('', '');
                  }
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