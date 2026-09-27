import genshinParser from './genshin-parser'

export function initCronJobs() {
  // Daily Genshin stats at midnight using Bun's built-in cron
  Bun.cron('0 0 * * *', async () => {
    try {
      console.log('⏰ Running daily cron: Genshin stats and abyss')
      await genshinParser.get_stats()
      await genshinParser.get_abyss()
    } catch (err) {
      console.error('Error in Genshin cron job:', err)
    }
  })

  console.log('🕐 Cron jobs initialized')
}
