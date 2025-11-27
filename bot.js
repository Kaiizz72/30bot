const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

const SERVER_HOST = 'node1.lumine.asia'
const SERVER_PORT = 25675
const AUTH_MODE = 'offline'

const JOIN_DELAY = 4000
const REJOIN_DELAY = 5000

const ATTACK_RANGE = 3.2        // tầm đánh an toàn
const ATTACK_DELAY_MIN = 600
const ATTACK_DELAY_MAX = 850

const BOT_NAMES = [
  'HuyAnh','MinhDz','PhongMC','CuongPro','LinhCute',
  'BaoVN','TonyCraft','AlexVN','KhoiNoob','HenryMC',
  'TomVN','KenjiVN','HoangPlay','JennyVN','KhoaMC',
  'LuffyVN','AnniePlay','SkyMinh','DavidVN','LucyMC',
  'PhongVip','BenVN','NamCraft','EricVN','HanaMC',
  'TuanMC','ZeroVN','KevinPlay','ThuongVN','HiepMC'
]

// ========= UTIL =========
function rand(min, max) {
  return Math.random() * (max - min) + min
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ========= BOT =========
function createBot(name) {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: name,
    auth: AUTH_MODE
  })

  bot.loadPlugin(pathfinder)

  let lastAttack = 0

  bot.once('spawn', () => {
    console.log(`[BOT] ${name} joined`)
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.canDig = false
    movements.allow1by1towers = false
    bot.pathfinder.setMovements(movements)

    // ===== LOOK NGẪU NHIÊN =====
    setInterval(() => {
      if (!bot.entity) return
      bot.look(rand(-Math.PI, Math.PI), rand(-0.4, 0.4), true)
    }, rand(2500, 4000))

    // ===== MOVE NHẸ =====
    setInterval(async () => {
      if (!bot.entity || bot.pathfinder.isMoving()) return
      const pos = bot.entity.position
      bot.pathfinder.setGoal(
        new GoalNear(
          pos.x + rand(-3, 3),
          pos.y,
          pos.z + rand(-3, 3),
          1
        )
      )
      await sleep(rand(2000, 4000))
      bot.pathfinder.stop()
    }, rand(6000, 9000))

    // ===== PVP LOOP =====
    setInterval(async () => {
      if (!bot.entity) return

      const target = bot.nearestEntity(e =>
        e.type === 'player' &&
        e.username !== bot.username &&
        e.position.distanceTo(bot.entity.position) < 6
      )

      if (!target) return

      const dist = target.position.distanceTo(bot.entity.position)

      // Tiến lại gần
      if (dist > ATTACK_RANGE) {
        bot.pathfinder.setGoal(
          new GoalNear(
            target.position.x,
            target.position.y,
            target.position.z,
            1
          ), true
        )
        return
      }

      // Đánh
      const now = Date.now()
      if (now - lastAttack < rand(ATTACK_DELAY_MIN, ATTACK_DELAY_MAX)) return
      lastAttack = now

      bot.lookAt(target.position.offset(0, 1.4, 0), true)
      bot.attack(target)

    }, 300)
  })

  // ===== DEATH =====
  bot.on('death', () => {
    setTimeout(() => {
      try { bot.respawn() } catch {}
    }, 3000)
  })

  // ===== REJOIN =====
  bot.on('end', () => {
    console.log(`[BOT] ${name} rejoining`)
    setTimeout(() => createBot(name), REJOIN_DELAY)
  })

  bot.on('error', () => {})
}

// ===== JOIN TỪNG CON =====
for (let i = 0; i < BOT_NAMES.length; i++) {
  setTimeout(() => createBot(BOT_NAMES[i]), i * JOIN_DELAY)
}
