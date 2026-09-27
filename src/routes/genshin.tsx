import { Elysia } from 'elysia'
import { readFileSync, existsSync } from 'fs'

import { Html } from '@elysia/html'

import { TerminalLayout } from './terminal-layout'

const genshinCss = `
  .terminal-timeline {
    width: 50%;
  }
  .card {
    background-position: right;
    background-repeat: no-repeat;
    height: 50%;
  }
  .progress-bar {
    margin: 6px;
  }
  .inner-icon {
    float: left;
    width: 25%;
  }
  .summary {
    border: 1px solid var(--secondary-color);
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(5, 20%);
    grid-template-rows: repeat(3, 80px);
    text-align: center;
  }
  @media only screen and (max-width: 733px) {
    .summary {
      grid-template-columns: repeat(3, 33%);
      grid-template-rows: repeat(3, 80px);
    }
    .terminal-timeline {
      width: 100%;
    }
  }
  .summary-item {
    padding: 5px;
  }
  .image-grid {
    display: grid;
    grid-gap: 1em;
    grid-template-rows: auto;
    grid-template-columns: repeat(auto-fit, minmax(calc(var(--page-width) / 12), 1fr));
  }
  .image-grid img {
    border: 1px solid var(--secondary-color);
    border-radius: 10px;
  }
  .small-icon {
    margin-top: -5px;
  }
`

type GenshinStats = {
  nickname: string
  level: number
  stats: Record<string, any>
  world_explorations: any[]
}

type AbyssStats = {
  reveal_rank: any[]
  defeat_rank: any
  damage_rank: any
  take_damage_rank: any
  normal_skill_rank: any
  energy_skill_rank: any
}

const readJson = <T,>(path: string, fallback: T): T => {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'))
    }
  } catch (err) {
    console.error(`Failed to read ${path}:`, err)
  }
  return fallback
}

export const genshinRoute = new Elysia().get('/genshin', () => {
  const genshin = readJson<GenshinStats>('db/genshin/stats.json', {
    nickname: 'Unknown',
    level: 0,
    stats: {},
    world_explorations: [],
  })

  const abyss = readJson<AbyssStats>('db/genshin/stats_abyss.json', {
    reveal_rank: [],
    defeat_rank: {},
    damage_rank: {},
    take_damage_rank: {},
    normal_skill_rank: {},
    energy_skill_rank: {},
  })

  const statItems = [
    { key: 'active_day_number', label: 'Days Active' },
    { key: 'achievement_number', label: 'Achievements' },
    { key: 'avatar_number', label: 'Characters' },
    { key: 'way_point_number', label: 'Waypoints Unlocked' },
    { key: 'anemoculus_number', label: 'Anemoculi' },
    { key: 'geoculus_number', label: 'Geoculi' },
    { key: 'electroculus_number', label: 'Electroculi' },
    { key: 'dendroculus_number', label: 'Dendroculus' },
    { key: 'domain_number', label: 'Domains Unlocked' },
    { key: 'spiral_abyss', label: 'Spiral Abyss' },
    { key: 'luxurious_chest_number', label: 'Luxurious Chests Opened' },
    { key: 'precious_chest_number', label: 'Precious Chests Opened' },
    { key: 'exquisite_chest_number', label: 'Exquisite Chests Opened' },
    { key: 'common_chest_number', label: 'Common Chests Opened' },
    { key: 'magic_chest_number', label: 'Number of Remarkable Chests' },
  ]

  const abyssNotables = [
    {
      data: abyss.defeat_rank,
      label: 'Most Defeats',
    },
    {
      data: abyss.damage_rank,
      label: 'Strongest Single Strike',
    },
    {
      data: abyss.take_damage_rank,
      label: 'Most Damage Taken',
    },
    {
      data: abyss.energy_skill_rank,
      label: 'Elemental Bursts Unleashed',
    },
    {
      data: abyss.normal_skill_rank,
      label: 'Elemental Skills Cast',
    },
  ]

  return (
    <TerminalLayout
      title="Genshin stats"
      activePage="/genshin"
      extraCss={genshinCss}
    >
      <h1>
        Summary ({genshin.nickname} Lv. {genshin.level})
      </h1>
      <div class="summary">
        {statItems.map((item) => (
          <div class="summary-item">
            <p>
              <b>{genshin.stats[item.key] ?? 'N/A'}</b>
              <br />
              <small>{item.label}</small>
            </p>
          </div>
        ))}
      </div>

      <h1>Spiral Abyss Overview</h1>
      <div style="text-align: center">
        <h3>Most played characters</h3>
      </div>
      <div class="image-grid">
        {abyss.reveal_rank.map((char: any) => (
          <img src={char.avatar_icon} />
        ))}
      </div>
      <br />
      <div style="text-align: center">
        <h3>Notable stats</h3>
      </div>
      <div>
        {abyssNotables.map((n) =>
          n.data?.avatar_icon ? (
            <div class="small-icon">
              <img src={n.data.avatar_icon} style="width: 5%;" />
              {n.label}: {n.data.value}
            </div>
          ) : null,
        )}
      </div>

      <h1>World exploration</h1>
      <div class="terminal-timeline">
        {genshin.world_explorations.map((area: any) => (
          <div class="terminal-card">
            <header safe>{area.name}</header>
            <div
              class="card"
              style={`background-image: url('${area.background_image}');`}
            >
              <div class="text">
                <img class="inner-icon" src={area.inner_icon} />
              </div>
              <br />
              <br />
              <div class="progress-bar progress-bar-show-percent">
                <div
                  class="progress-bar-filled"
                  style={`width: ${area.exploration_percentage}%`}
                  data-filled={`${area.exploration_percentage}%`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalLayout>
  )
})
