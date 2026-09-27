import crypto from 'node:crypto'
import fs from 'node:fs'

const salt = '6s25p5ox5y14umn1p61aqyyvbvvl3lrt'
const baseUrl =
  'https://bbs-api-os.hoyoverse.com/game_record/genshin/api/'
const x_rpc_app_version = '2.11.1'
const x_rpc_client_type = '5'
const x_rpc_language = 'en-us'

function randomString(length: number): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

function getOsDS() {
  const time = Math.floor(Date.now() / 1000)
  const random = randomString(6)
  const c = crypto
    .createHash('md5')
    .update(`salt=${salt}&t=${time}&r=${random}`)
    .digest('hex')
  return `${time},${random},${c}`
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function parseStats(data: any) {
  if (!data?.role) return null
  const parsed = {
    nickname: data.role.nickname,
    level: data.role.level,
    stats: data.stats,
    world_explorations: (data.world_explorations || []).map((obj: any) => ({
      ...obj,
      exploration_percentage: +(obj.exploration_percentage / 10),
    })),
  }

  ensureDir('db/genshin')
  fs.writeFileSync('db/genshin/stats.json', JSON.stringify(parsed, null, 2))
  return parsed
}

function parseAbyss(data: any) {
  if (!data) return null
  const parsed = {
    reveal_rank: data.reveal_rank || [],
    defeat_rank: data.defeat_rank?.[0] || {},
    damage_rank: data.damage_rank?.[0] || {},
    take_damage_rank: data.take_damage_rank?.[0] || {},
    normal_skill_rank: data.normal_skill_rank?.[0] || {},
    energy_skill_rank: data.energy_skill_rank?.[0] || {},
  }

  ensureDir('db/genshin')
  fs.writeFileSync(
    'db/genshin/stats_abyss.json',
    JSON.stringify(parsed, null, 2),
  )
  return parsed
}

function buildHeaders(cookie: string) {
  return {
    DS: getOsDS(),
    Origin: 'https://act.hoyolab.com',
    Referer: 'https://act.hoyolab.com/',
    'Accept-Language': 'en-US,en;q=0.9',
    'x-rpc-language': x_rpc_language,
    'x-rpc-app_version': x_rpc_app_version,
    'x-rpc-client_type': x_rpc_client_type,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    Cookie: cookie,
  }
}

export async function getGenshinStats(
  cookie: string = process.env.GENSHIN_COOKIE || '',
) {
  if (!cookie) {
    console.warn('GENSHIN_COOKIE is not set, skipping stats fetch')
    return null
  }
  const roleId = process.env.GENSHIN_ROLE_ID || '700675966'
  const server = process.env.GENSHIN_SERVER || 'os_euro'

  try {
    const res = await fetch(
      `${baseUrl}index?role_id=${roleId}&server=${server}`,
      { headers: buildHeaders(cookie) },
    )
    const json = (await res.json()) as any

    if (json?.retcode !== 0) {
      console.error(
        `Genshin stats API error: retcode=${json?.retcode}, message=${json?.message}`,
      )
      return null
    }

    if (json?.data) {
      return parseStats(json.data)
    }
  } catch (err) {
    console.error('Failed to fetch Genshin stats:', err)
  }
  return null
}

export async function getGenshinAbyss(
  cookie: string = process.env.GENSHIN_COOKIE || '',
) {
  if (!cookie) {
    console.warn('GENSHIN_COOKIE is not set, skipping abyss fetch')
    return null
  }
  const roleId = process.env.GENSHIN_ROLE_ID || '700675966'
  const server = process.env.GENSHIN_SERVER || 'os_euro'

  try {
    const res = await fetch(
      `${baseUrl}spiralAbyss?role_id=${roleId}&server=${server}&schedule_type=1`,
      { headers: buildHeaders(cookie) },
    )
    const json = (await res.json()) as any

    if (json?.retcode !== 0) {
      console.error(
        `Genshin abyss API error: retcode=${json?.retcode}, message=${json?.message}`,
      )
      return null
    }

    if (json?.data) {
      return parseAbyss(json.data)
    }
  } catch (err) {
    console.error('Failed to fetch Genshin abyss:', err)
  }
  return null
}

export default {
  get_stats: getGenshinStats,
  get_abyss: getGenshinAbyss,
}
