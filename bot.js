const mineflayer = require('mineflayer')

const SERVER_HOST = 'node1.lumine.asia'
const SERVER_PORT = 25575
const AUTH_MODE = 'offline'

const JOIN_DELAY = 9000 // 4s mỗi bot
const REJOIN_DELAY = 10000 // 5s nếu bị kick

const BOT_NAMES = [
  'HuyAnh', 'MinhDz', 'PhongMC', 'CuongPro',
  'LinhCute', 'BaoVN', 'TonyCraft', 'AlexVN',
  'KhoiNoob', 'HenryMC', 'TomVN', 'KenjiVN',
  'HoangPlay', 'JennyVN', 'KhoaMC', 'LuffyVN',
  'AnniePlay', 'SkyMinh', 'DavidVN', 'LucyMC',
  'PhongVip', 'BenVN', 'NamCraft', 'EricVN',
  'HanaMC', 'TuanMC', 'ZeroVN', 'KevinPlay',
  'ThuongVN', 'HiepMC'
]

function createBot(name, index) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: AUTH_MODE,
    verison: '1.20'
  })

  console.log(`[BOT] ${name} connecting...`)

  bot.once('spawn', () => {
    console.log(`[BOT] ${name} joined server`)
  })

  // Chết → hồi sinh
  bot.on('death', () => {
    console.log(`[BOT] ${name} died → respawn`)
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 3000)
  })

  // Bị kick
  bot.on('kicked', reason => {
    console.log(`[BOT] ${name} kicked: ${reason}`)
  })

  // Disconnect → join lại CON ĐÓ
  bot.on('end', () => {
    console.log(`[BOT] ${name} disconnected → rejoin`)
    setTimeout(() => {
      createBot(name, index)
    }, REJOIN_DELAY)
  })

  bot.on('error', () => {})
}

// ✅ JOIN TỪNG CON
;(async () => {
  for (let i = 0; i < BOT_NAMES.length; i++) {
    setTimeout(() => {
      createBot(BOT_NAMES[i], i)
    }, i * JOIN_DELAY)
  }
})()
