import { Html } from '@elysia/html'

const nav = [
  { href: '#intro', label: 'いち' },
  { href: '#news', label: 'に' },
  { href: '#disc', label: 'さん' },
  { href: '/', label: '帰る' },
]

const fairies = [
  '/public/images/ui/nakatasan.png',
  '/public/images/ui/youseisan5.png',
  '/public/images/ui/youseisan7.png',
  '/public/images/ui/youseisan11.png',
  '/public/images/ui/youseisan14.png',
]

export const Layout = ({ children }: { children: any }) => {
  return (
    <html lang="uk">
      <head>
        <title>人類は衰退しました</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body class="w-full min-h-[100dvh] overflow-x-hidden m-0 bg-no-repeat bg-fixed bg-[image:url('/public/images/ui/logo.png'),url('/public/images/ui/top_visual.png'),url('/public/images/ui/bg_00.jpg')] bg-[position:85%_3%,center_top,center_center] bg-[size:90%_auto,cover,cover] md:bg-[size:34%_auto,contain,cover]">
        <main class="w-full max-w-[100vw] min-h-[100dvh] relative overflow-x-hidden">
          <nav class="absolute right-[5%] top-[15%] md:right-[15%] md:top-[20%] z-50">
            <ul class="flex flex-col gap-8 md:gap-10 items-end relative z-10">
              {nav.map((item, idx) => {
                const linkFairy =
                  fairies[Math.floor(Math.random() * fairies.length)]

                // Fairy size between 70px and 100px
                const sizeInt = Math.floor(Math.random() * 30 + 70)
                const size = `${sizeInt}px`

                const verticalOffset = `${Math.floor(Math.random() * 20 - 10)}px`
                const isLeft = Math.random() > 0.5

                // Tightened the offset so they stick closely to the text boundaries
                // Dynamically sizing the offset relative to the generated image size to prevent complete overlap
                const horizontalOffset = `-${sizeInt - 25 + Math.floor(Math.random() * 10)}px`

                const positionStyle = isLeft
                  ? `top: ${verticalOffset}; left: ${horizontalOffset}; width: ${size}; pointer-events: none;`
                  : `top: ${verticalOffset}; right: ${horizontalOffset}; width: ${size}; pointer-events: none;`

                return (
                  <li class="relative flex items-center">
                    {/* Static fairy tucked closely to the link */}
                    <img
                      src={linkFairy}
                      class="absolute z-20"
                      style={positionStyle}
                      alt=""
                    />

                    <a
                      href={item.href}
                      class="relative z-30 text-[#725442] font-black text-3xl md:text-xl tracking-widest hover:text-[#d96c62] hover:-translate-x-2 transition-all duration-300 inline-block [text-shadow:_0_2px_0_white,_0_-2px_0_white,_2px_0_0_white,_-2px_0_0_white]"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {children}
        </main>
      </body>
    </html>
  )
}
